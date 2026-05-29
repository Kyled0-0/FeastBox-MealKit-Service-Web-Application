#!/usr/bin/env bash
# Run from the repo root: `bash k8s/apply.sh`

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
IMAGE_TAG="feastbox-api:latest"

# NOTE: MSYS_NO_PATHCONV is set inline only on the kubectl cp line that needs it.
# Setting it globally breaks `kubectl apply -f` for local manifests.

echo "==> Preflight: docker, kubectl, cluster context"
command -v docker >/dev/null || { echo "ERROR: docker not in PATH" >&2; exit 1; }
command -v kubectl >/dev/null || { echo "ERROR: kubectl not in PATH" >&2; exit 1; }
kubectl cluster-info >/dev/null 2>&1 || {
  echo "ERROR: kubectl has no cluster context." >&2
  echo "Enable Docker Desktop Kubernetes: Settings, Kubernetes, Enable Kubernetes." >&2
  exit 1
}

echo "==> Verify k8s/secret.yaml exists"
if [[ ! -f "$SCRIPT_DIR/secret.yaml" ]]; then
  echo "ERROR: k8s/secret.yaml not found." >&2
  echo "  cp k8s/secret.example.yaml k8s/secret.yaml" >&2
  echo "  # edit secret.yaml: POSTGRES_PASSWORD, JWT_SECRET, JWT_REFRESH_SECRET, DATABASE_URL" >&2
  exit 1
fi

echo "==> Build ${IMAGE_TAG}"
(cd "$REPO_ROOT" && docker build -t "${IMAGE_TAG}" .)

echo "==> Save image to tarball for ctr import"
(cd "$REPO_ROOT" && docker save "${IMAGE_TAG}" -o ./feastbox-api.tar)

# All kubectl apply calls run from the repo root and use relative paths
# to avoid MSYS absolute-path translation issues on Git Bash.
cd "$REPO_ROOT"

echo "==> Apply Secret + ConfigMap"
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/configmap.yaml

echo "==> Apply in-cluster Container Registry (ULO evidence resource)"
kubectl apply -f k8s/registry.yaml

echo "==> Apply metrics-server (required for HPA; pinned v0.8.1, vendored)"
# A fresh kind cluster ships no metrics API, so without this the HPA sits at
# <unknown> and never scales. Installed early so metrics are populating by the
# time the API + HPA come up later in this script. See k8s/metrics-server.yaml.
kubectl apply -f k8s/metrics-server.yaml
echo "==> Wait for metrics-server rollout (timeout 120s)"
# Non-fatal: metrics-server is needed for the HPA demo but is NOT a prerequisite
# for the app stack (API, DB, migration all run without it). Under `set -e` a
# strict gate would abort the whole deploy if the image pull is slow on a fresh
# cluster, so a slow/failed rollout warns rather than killing the deploy.
kubectl rollout status deployment/metrics-server -n kube-system --timeout=120s \
  || echo "WARN: metrics-server not Ready yet; HPA may read <unknown> until it settles." >&2

echo "==> Load image into worker node containerd"
kubectl delete pod image-loader --ignore-not-found --force --grace-period=0 2>/dev/null || true
kubectl apply -f k8s/image-loader.yaml
kubectl wait pod/image-loader --for=condition=Ready --timeout=60s
echo "    copying tarball (~142 MB)..."
MSYS_NO_PATHCONV=1 kubectl cp ./feastbox-api.tar image-loader:/host/tmp/feastbox-api.tar
MSYS_NO_PATHCONV=1 kubectl exec image-loader -- sh -c 'chroot /host ctr -n=k8s.io image import /tmp/feastbox-api.tar'
kubectl delete pod image-loader --ignore-not-found --force --grace-period=0

echo "==> Apply Postgres (PVC + Service + StatefulSet)"
kubectl apply -f k8s/postgres-pvc.yaml
kubectl apply -f k8s/postgres-service.yaml
kubectl apply -f k8s/postgres-statefulset.yaml

echo "==> Wait for Postgres pod Ready (timeout 120s)"
kubectl wait --for=condition=Ready pod/postgres-0 --timeout=120s

echo "==> Re-create Migration Job"
kubectl delete job feastbox-migrate --ignore-not-found
kubectl apply -f k8s/postgres-migration-job.yaml

echo "==> Wait for Migration Job complete (timeout 120s)"
kubectl wait --for=condition=complete job/feastbox-migrate --timeout=120s

echo "==> Apply API (Deployment + Service + HPA)"
kubectl apply -f k8s/api-deployment.yaml
kubectl apply -f k8s/api-service.yaml
kubectl apply -f k8s/api-hpa.yaml

echo "==> Wait for API rollout (timeout 120s)"
kubectl rollout status deployment/feastbox-api --timeout=120s

echo ""
echo "==> Done. Quick verification:"
echo "    curl http://localhost:3000/health         # expect 200"
echo "    curl http://localhost:3000/meals          # expect [] until seeded"
echo "    kubectl get pods                          # all Running"
echo "    kubectl describe deployment feastbox-api  # probes visible"
echo "    kubectl get hpa                           # real CPU %"
echo ""
echo "==> Seed step (run ONCE per fresh DB, from Git Bash or WSL):"
echo "    kubectl run feastbox-seed --rm -i --restart=Never \\"
echo "        --image=docker.io/library/feastbox-api:latest \\"
echo "        --overrides='{\"spec\":{\"containers\":[{\"name\":\"seed\",\"image\":\"docker.io/library/feastbox-api:latest\",\"imagePullPolicy\":\"Never\",\"command\":[\"node\",\"prisma/seed.js\"],\"env\":[{\"name\":\"NODE_ENV\",\"value\":\"development\"}],\"envFrom\":[{\"secretRef\":{\"name\":\"feastbox-secret\"}}]}]}}'"
echo ""
echo "    NODE_ENV=development override required: seed.js refuses to run"
echo "    when NODE_ENV=production (which the ConfigMap sets)."