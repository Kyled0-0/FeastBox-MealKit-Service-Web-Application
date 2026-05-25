# FeastBox -- SIT226 HD Submission

A meal-kit ordering web application deployed to Docker Desktop Kubernetes.
This README explains the contents of the submission ZIP and how to
reproduce the deployment shown in the presentation.

**Submission contents:**
- This file (`HD_README.md`) -- setup instructions and file map
- `Dockerfile`, `.dockerignore`, `docker-compose.yml` -- container build
- `k8s/*.yaml` -- 10 Kubernetes manifests
- `k8s/apply.sh` -- orchestrated deploy script
- `server/` -- Express + Prisma backend source
- `src/` -- Vue 3 frontend source
- `prisma/schema.prisma` -- database schema

---

## Architecture

```
Host machine (Windows + Docker Desktop)
│
├── Vue 3 SPA              (npm run dev, host port 5173)
│       │
│       │ HTTP
│       ▼
└── Docker Desktop Kubernetes (kind-based, 2 nodes)
    │
    ├── Deployment   feastbox-api      (2-5 replicas, HPA-managed)
    ├── Service      feastbox-api-svc  (LoadBalancer → host port 3000)
    ├── HPA          feastbox-api-hpa  (CPU > 60% triggers scale-up)
    ├── StatefulSet  postgres-0        (Postgres 16, 1Gi PVC)
    ├── Service     postgres-service   (ClusterIP, port 5432)
    ├── Job          feastbox-migrate  (prisma migrate deploy, run-once)
    ├── Deployment   registry          (in-cluster container registry)
    ├── Secret       feastbox-secret   (4 keys: DB password, JWT x2, DATABASE_URL)
    ├── ConfigMap    feastbox-config   (CLIENT_URL, NODE_ENV, PORT)
    └── PVC          postgres-data     (1Gi RWO, hostpath storage class)
```

---

## Prerequisites

| Tool                                   | Verify                              | Tested |
|----------------------------------------|-------------------------------------|--------|
| Docker Desktop with Kubernetes enabled | `kubectl cluster-info`              | K8s 1.28+ |
| `kubectl` CLI                          | `kubectl version --client`          | 1.28+  |
| Node.js + npm                          | `node -v && npm -v`                 | Node 22+ |
| `bash` (Git Bash on Windows)           | `bash --version`                    | 5.x    |

> **Windows users:** all bash commands assume Git Bash or WSL. PowerShell
> will mangle JSON quoting in the seed command -- use Git Bash.

---

# A. Local development (without Kubernetes)

For day-to-day development. Runs Postgres in a container, Express +
Vite on the host with hot reload. Not the HD demo path.

## A.1 -- First-time setup

```bash
# Install root + server dependencies.
npm install
npm --prefix server install

# Copy the env template and fill in the JWT secrets.
cp server/.env.example server/.env

# Generate two distinct JWT secrets:
#   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
# Edit server/.env, paste them into JWT_SECRET and JWT_REFRESH_SECRET.
```

## A.2 -- One-command startup

```bash
npm run dev:all
```

This single command:
1. `docker compose up -d --wait db` -- starts Postgres in a container,
   blocks until the `pg_isready` healthcheck passes (~3-5 s cold,
   instant if already running).
2. `prisma migrate deploy` -- applies any pending migrations
   (idempotent, no-op when up to date).
3. `concurrently` runs Vite and Express side-by-side in one terminal
   with colour-coded log prefixes (`vite|...` cyan, `api|...` magenta).
   The `-k` flag means Ctrl-C kills both processes cleanly.

After it starts:
- Frontend: `http://localhost:5173`
- API: `http://localhost:3000`

## A.3 -- Seed the database (one-time)

```bash
npm --prefix server run db:seed
```

Expected output: `Seeded 8 meals.`

## A.4 -- Run tests

```bash
# Server tests (security + integration)
npm --prefix server run test

# Frontend tests (composables, stores, components)
npx vitest run
```

Both suites: `vitest`. Test counts: 76 server + 49 frontend = 125 total.

---

# B. Kubernetes deployment (HD demo path)

## B.1 -- Enable Docker Desktop Kubernetes

Docker Desktop > Settings > Kubernetes > tick "Enable Kubernetes" > Apply & Restart.

Wait for the green status indicator (~3-5 minutes on first enable).

Verify:
```bash
kubectl cluster-info
kubectl get nodes
```

## B.2 -- Configure insecure registry (Docker Desktop daemon)

Docker Desktop > Settings > Docker Engine. Add to the JSON config:

```json
{
  "builder": { "gc": { "defaultKeepStorage": "20GB", "enabled": true } },
  "experimental": false,
  "insecure-registries": ["host.docker.internal:5001"]
}
```

Click Apply & Restart.

## B.3 -- Install metrics-server (HPA dependency)

```bash
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

kubectl patch deployment metrics-server -n kube-system --type=json \
    -p='[{"op":"add","path":"/spec/template/spec/containers/0/args/-","value":"--kubelet-insecure-tls"}]'

kubectl wait deployment/metrics-server -n kube-system --for=condition=Available --timeout=120s

# Verify (wait ~20s for first scrape):
kubectl top nodes
```

## B.4 -- Generate `k8s/secret.yaml`

```bash
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
JWT_REFRESH_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
POSTGRES_PASSWORD=$(node -e "console.log(require('crypto').randomBytes(24).toString('base64url'))")

cat > k8s/secret.yaml <<EOF
apiVersion: v1
kind: Secret
metadata:
  name: feastbox-secret
type: Opaque
stringData:
  POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
  DATABASE_URL: postgresql://feastbox:${POSTGRES_PASSWORD}@postgres-service:5432/feastbox
  JWT_SECRET: ${JWT_SECRET}
  JWT_REFRESH_SECRET: ${JWT_REFRESH_SECRET}
EOF
```

> `k8s/secret.yaml` is gitignored. Never commit it.

## B.5 -- Deploy

```bash
bash k8s/apply.sh
```

This script:
1. Preflight checks (docker, kubectl, cluster).
2. `docker build -t feastbox-api:latest .`
3. `docker save` to a tarball.
4. Applies Secret + ConfigMap.
5. Deploys the in-cluster Container Registry.
6. Loads the image into the worker node's containerd via a privileged
   `image-loader` pod + `ctr import` (bypasses Docker Desktop's
   kind registry-mirror).
7. Deploys Postgres (PVC + Service + StatefulSet), waits for Ready.
8. Runs the Migration Job, waits for Complete.
9. Deploys the API (Deployment + Service + HPA), waits for rollout.

Expected runtime: 5-8 minutes on first run, 90-120 s on re-runs.

## B.6 -- Seed the cluster database (one-time per fresh DB)

```bash
kubectl run feastbox-seed --rm -i --restart=Never \
    --image=docker.io/library/feastbox-api:latest \
    --overrides='{"spec":{"containers":[{"name":"seed","image":"docker.io/library/feastbox-api:latest","imagePullPolicy":"Never","command":["node","prisma/seed.js"],"env":[{"name":"NODE_ENV","value":"development"}],"envFrom":[{"secretRef":{"name":"feastbox-secret"}}]}]}}'
```

Expected output: `Seeded 8 meals.`

> `NODE_ENV=development` is required: the seed has a production-guard
> that refuses to run when `NODE_ENV=production` (which the ConfigMap
> sets for the api).

## B.7 -- Verify

```bash
curl http://localhost:3000/health     # expect {"status":"ok"}
curl http://localhost:3000/meals      # expect 8 meal objects

kubectl get pods                      # all Running/Completed
kubectl get hpa                       # cpu: N%/60%, NOT <unknown>
kubectl describe deployment feastbox-api  # probes visible
```

## B.8 -- Run the frontend against the cluster

```bash
echo "VITE_API_URL=http://localhost:3000" > .env.local
npm run dev
```

Open `http://localhost:5173/menu` in a browser. The meal grid loads 8
meals from the cluster's LoadBalancer.

## B.9 -- Demonstrate autoscaling

```bash
# Background: fire 500 concurrent requests
for i in $(seq 1 500); do curl -s http://localhost:3000/meals > /dev/null & done

# Foreground: watch the HPA scale up
kubectl get hpa -w
```

Watch `REPLICAS` climb from 2 toward 5 as `TARGETS` exceeds 60%.
`stabilizationWindowSeconds: 0` in `api-hpa.yaml` ensures the event
fires quickly enough to see on camera.

## B.10 -- Demonstrate the authenticated DB write path

```bash
# Register a user, capture the JWT.
TOKEN=$(curl -s -X POST http://localhost:3000/auth/register \
    -H "Content-Type: application/json" \
    -d '{"email":"demo@feastbox.local","password":"demo_password_12"}' \
    | python -c "import json,sys; print(json.load(sys.stdin)['accessToken'])")

# Place an authenticated order.
curl -X POST http://localhost:3000/orders \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"servings":4,"voucher":"FEAST20"}'

# Confirm the row landed in Postgres (inside the StatefulSet pod).
kubectl exec postgres-0 -- psql -U feastbox -d feastbox -c \
    'SELECT id, "totalCents", status FROM "Order" ORDER BY "createdAt" DESC LIMIT 1;'
```

## B.11 -- Teardown

```bash
# Delete app resources, keep the cluster.
kubectl delete -f k8s/api-hpa.yaml -f k8s/api-service.yaml -f k8s/api-deployment.yaml
kubectl delete job feastbox-migrate
kubectl delete -f k8s/postgres-statefulset.yaml -f k8s/postgres-service.yaml -f k8s/postgres-pvc.yaml
kubectl delete -f k8s/registry.yaml
kubectl delete -f k8s/configmap.yaml -f k8s/secret.yaml

# Or nuke everything in the default namespace at once:
kubectl delete all,pvc,configmap,secret --all
```

---

# Quick command reference

| Goal                                  | Command                                            |
|---------------------------------------|----------------------------------------------------|
| Local dev (all three processes)       | `npm run dev:all`                                  |
| Local DB only                         | `docker compose up -d db`                          |
| Local Express only (host)             | `npm --prefix server run dev`                      |
| Local frontend only (host)            | `npm run dev`                                      |
| Local DB seed                         | `npm --prefix server run db:seed`                  |
| Server tests (76)                     | `npm --prefix server run test`                     |
| Frontend tests (49)                   | `npx vitest run`                                   |
| Build API image                       | `docker build -t feastbox-api:latest .`            |
| Deploy to K8s                         | `bash k8s/apply.sh`                                |
| Cluster pods                          | `kubectl get pods`                                 |
| Cluster autoscaling                   | `kubectl get hpa`                                  |
| Watch autoscaling live                | `kubectl get hpa -w`                               |
| Probe config                          | `kubectl describe deployment feastbox-api`         |
| Cluster teardown                      | `kubectl delete all,pvc,configmap,secret --all`    |

---

## File map

| File                                | Purpose                                                              |
|-------------------------------------|----------------------------------------------------------------------|
| `Dockerfile`                        | Multi-stage build, non-root user, tini PID 1, HEALTHCHECK            |
| `.dockerignore`                     | Excludes secrets and unused trees from the build context             |
| `docker-compose.yml`                | Local dev stack: db + api, host-bound to 127.0.0.1 only              |
| `package.json` (root)               | Frontend deps + the `dev:all` orchestration script                   |
| `server/package.json`               | Backend deps + `db:migrate`, `db:seed`, `db:migrate:deploy`          |
| `k8s/apply.sh`                      | Orchestrated deploy with build, image-load, ordered apply, and waits |
| `k8s/secret.example.yaml`           | Template for `k8s/secret.yaml` (gitignored, generated locally)       |
| `k8s/configmap.yaml`                | Non-sensitive runtime config                                         |
| `k8s/postgres-pvc.yaml`             | 1Gi PersistentVolumeClaim                                            |
| `k8s/postgres-statefulset.yaml`     | Postgres 16 StatefulSet with readiness/liveness probes               |
| `k8s/postgres-service.yaml`         | ClusterIP for internal-only Postgres access                          |
| `k8s/postgres-migration-job.yaml`   | Run-once Job: `npx prisma migrate deploy`                            |
| `k8s/api-deployment.yaml`           | 2 replicas, probes, resource limits, runAsNonRoot                    |
| `k8s/api-service.yaml`              | LoadBalancer exposing the API on `localhost:3000`                    |
| `k8s/api-hpa.yaml`                  | HorizontalPodAutoscaler: 2-5 replicas, 60% CPU                       |
| `k8s/registry.yaml`                 | In-cluster Container Registry (Deployment + NodePort Service)        |
| `k8s/image-loader.yaml`             | Privileged pod for `ctr image import` on the worker node             |
| `server/`                           | Express API source, Prisma schema, seed                              |
| `src/`                              | Vue 3 SPA source                                                     |

---

## ULO mapping

**ULO1 -- Cloud resources.** Secret + ConfigMap + PersistentVolumeClaim
are three distinct K8s resource kinds visible to `kubectl get all,
secret,configmap,pvc`. A Container Registry is also deployed
(`k8s/registry.yaml`) as a fourth resource representing the image
storage layer of the deployment pipeline.

**ULO2 -- Orchestration of stateful workloads.** The cluster uses four
distinct orchestration patterns: a StatefulSet for the database with
stable pod naming (`postgres-0`), a Deployment for the stateless API
with rolling updates, a HorizontalPodAutoscaler for elastic scaling
under load, and a Job for run-once schema migrations. The API's
liveness/readiness probes target `/health` and intentionally decouple
from the DB so a database outage cannot cascade into API pod restarts.

**ULO3 -- Business impact.** The application implements a real
meal-kit ordering flow with authenticated `POST /orders`, server-side
total computation (the client never controls the price), and an
IDOR-safe `GET /orders/:id` that returns 404 (not 403) when a user
requests an order they do not own. The order persists to the
StatefulSet-backed Postgres.

**ULO4 -- DevOps lifecycle.** `k8s/apply.sh` codifies the deploy in 11
ordered stages with explicit waits between dependent steps (Postgres
must be Ready before the migration Job; the Job must Complete before
the API Deployment applies). The script is idempotent for re-runs and
includes preflight checks. The root `npm run dev:all` script provides
the parallel dev-side counterpart: one command to bring up DB + API +
frontend together. The in-cluster Container Registry
(`k8s/registry.yaml`) represents the build-tag-push-pull lifecycle a
production cluster would use.

---

## Architectural notes

**Docker Desktop kind workaround:** Docker Desktop 4.x ships a
kind-based multi-node Kubernetes cluster. Its containerd routes all
image pulls through an internal registry-mirror that only proxies
known public registries (docker.io, registry.k8s.io). Custom registries
-- including in-cluster `registry-service:5000` -- return 500 with no
override available without modifying the kind nodes' containerd config
(which Docker Desktop does not expose).

The deploy works around this by:
1. Keeping `k8s/registry.yaml` deployed as a cloud resource (ULO
   evidence; it would be the real pull source in a non-Docker-Desktop
   cluster).
2. Loading the application image directly into the worker node's
   containerd content store via `kubectl exec ... ctr image import`
   from a privileged pod (`k8s/image-loader.yaml`).
3. Using `imagePullPolicy: Never` on the api Deployment and migration
   Job so the kubelet skips the mirror and uses the imported image.

In a production Kubernetes deployment (EKS, GKE, AKS, vanilla kubeadm),
the registry path would be the actual pull source and this workaround
would not be needed.

---

## Contact / submission

- DeakinAir presentation: `<paste link after upload>`
- ZIP submitted to: CloudDeakin submission box
- 1-page outline submitted to: OnTrack (PDF)
