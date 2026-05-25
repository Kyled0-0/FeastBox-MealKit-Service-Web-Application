#!/usr/bin/env bash
#
# k8s/apply.sh, orchestrated apply of the FeastBox K8s manifests.
#
# Why this script exists (instead of a single `kubectl apply -f k8s/`):
# the manifests have ordering constraints that `apply -f` does not respect:
#
#   1. The api Deployment MUST NOT start until the Postgres pod is Ready
#      AND the migration Job has completed, otherwise the api boots
#      against an empty schema, crashes, restarts in a loop, and the
#      demo recording shows ImagePullBackOff-style noise instead of a
#      clean startup sequence.
#
#   2. The migration Job is NOT re-runnable by a plain `kubectl apply`.
#      `apply` on a completed Job is a no-op. To re-run migrations on
#      a second demo pass, the Job must be DELETED first (with
#      `--ignore-not-found` so the first run does not error).
#
#   3. imagePullPolicy: Never on the api and migration Job means the
#      image MUST exist locally before any `kubectl apply` that
#      references it. The build step is enforced at the top of the
#      script so a fresh checkout cannot accidentally apply a stale
#      manifest set against a missing image.
#
# Run from the repo root:
#   bash k8s/apply.sh
#
# Idempotent. Re-running is the supported workflow for re-applying
# config changes.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "==> Preflight: docker, kubectl, cluster context"
command -v docker >/dev/null || { echo "ERROR: docker not in PATH" >&2; exit 1; }
command -v kubectl >/dev/null || { echo "ERROR: kubectl not in PATH" >&2; exit 1; }
kubectl cluster-info >/dev/null 2>&1 || {
  echo "ERROR: kubectl has no cluster context." >&2
  echo "Enable Docker Desktop Kubernetes: Settings, Kubernetes, Enable Kubernetes." >&2
  exit 1
}

echo "==> Build feastbox-api:latest"
# Build from the repo root so the Dockerfile's COPY server/ path resolves.
# Tag MUST be `:latest` to match imagePullPolicy: Never in api-deployment
# and postgres-migration-job manifests.
(cd "$REPO_ROOT" && docker build -t feastbox-api:latest .)

echo "==> Verify k8s/secret.yaml exists (copy from secret.example.yaml first if not)"
if [[ ! -f "$SCRIPT_DIR/secret.yaml" ]]; then
  echo "ERROR: $SCRIPT_DIR/secret.yaml not found." >&2
  echo "Copy the template and fill in real values:" >&2
  echo "  cp $SCRIPT_DIR/secret.example.yaml $SCRIPT_DIR/secret.yaml" >&2
  echo "  # edit secret.yaml: POSTGRES_PASSWORD, JWT_SECRET, JWT_REFRESH_SECRET, DATABASE_URL" >&2
  exit 1
fi

echo "==> Delete any prior migration Job (apply on a completed Job is a no-op)"
# `--ignore-not-found` makes the first run safe. Subsequent runs need
# the explicit deletion so the new Job actually executes.
kubectl delete job feastbox-migrate --ignore-not-found

echo "==> Apply Secret + ConfigMap"
kubectl apply -f "$SCRIPT_DIR/secret.yaml"
kubectl apply -f "$SCRIPT_DIR/configmap.yaml"

echo "==> Apply Postgres (PVC + Service + StatefulSet)"
kubectl apply -f "$SCRIPT_DIR/postgres-pvc.yaml"
kubectl apply -f "$SCRIPT_DIR/postgres-service.yaml"
kubectl apply -f "$SCRIPT_DIR/postgres-statefulset.yaml"

echo "==> Wait for Postgres pod to be Ready (timeout 120s)"
# The api Deployment depends on this. `condition=Ready` checks the
# readiness probe (`pg_isready -d feastbox`), not just pod-Running,
# so we know the DB actually accepts queries before proceeding.
kubectl wait --for=condition=Ready pod/postgres-0 --timeout=120s

echo "==> Apply Migration Job"
kubectl apply -f "$SCRIPT_DIR/postgres-migration-job.yaml"

echo "==> Wait for Migration Job to complete (timeout 120s)"
# `condition=complete` is the canonical Job-finished signal. If
# migrations fail, the Job stays Active and this wait times out;
# `kubectl logs job/feastbox-migrate` is the next debugging step.
kubectl wait --for=condition=complete job/feastbox-migrate --timeout=120s

echo "==> Apply API (Deployment + Service + HPA)"
kubectl apply -f "$SCRIPT_DIR/api-deployment.yaml"
kubectl apply -f "$SCRIPT_DIR/api-service.yaml"
kubectl apply -f "$SCRIPT_DIR/api-hpa.yaml"

echo "==> Wait for API rollout to complete (timeout 120s)"
# Rollout-status blocks until all replicas of the new ReplicaSet are
# Available. Combined with the readiness probe on /health, this means
# the LoadBalancer is routing traffic by the time the script exits.
kubectl rollout status deployment/feastbox-api --timeout=120s

echo ""
echo "==> Done. Quick verification:"
echo "    curl http://localhost:3000/health         # expect 200"
echo "    curl http://localhost:3000/meals          # expect 8 meals"
echo "    kubectl get pods                          # all Running"
echo "    kubectl describe deployment feastbox-api  # probes config"
echo "    kubectl get hpa                           # baseline replicas"
echo ""
echo "==> Seed step (run ONCE per fresh DB, from Git Bash or WSL, not PowerShell):"
echo "    kubectl run feastbox-seed --rm -i --restart=Never \\"
echo "        --image=feastbox-api:latest \\"
echo "        --overrides='{\"spec\":{\"containers\":[{\"name\":\"seed\",\"image\":\"feastbox-api:latest\",\"imagePullPolicy\":\"Never\",\"command\":[\"node\",\"prisma/seed.js\"],\"envFrom\":[{\"secretRef\":{\"name\":\"feastbox-secret\"}}]}]}}'"
echo ""
echo "    Note: --overrides supplies the full container spec including image"
echo "    and imagePullPolicy, so the outer --image flag is the kubectl-"
echo "    required placeholder (it picks the container name) and the"
echo "    overrides JSON wins for everything else."
