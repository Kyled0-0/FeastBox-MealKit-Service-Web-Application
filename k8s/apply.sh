#!/usr/bin/env bash
# Orchestrated apply for the FeastBox K8s stack.
#
# Why this is a script (not raw `kubectl apply -f k8s/`):
#   - The api Deployment must not start until Postgres is Ready AND the
#     migration Job has completed; apply.sh enforces ordering with
#     `kubectl wait`.
#   - The migration Job is not re-runnable by plain `kubectl apply`
#     (apply on a completed Job is a no-op); we delete first with
#     --ignore-not-found.
#   - Docker Desktop's kind containerd does not pull from custom
#     registries; we `docker save` then `ctr import` the image into the
#     worker node via a privileged loader pod.
#
# Run from the repo root: `bash k8s/apply.sh`

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
IMAGE_TAG="feastbox-api:latest"

# Git Bash on Windows mangles /host/... paths in kubectl exec/cp args.
export MSYS_NO_PATHCONV=1

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
  echo "ERROR: $SCRIPT_DIR/secret.yaml not found." >&2
  echo "  cp $SCRIPT_DIR/secret.example.yaml $SCRIPT_DIR/secret.yaml" >&2
  echo "  # edit secret.yaml: POSTGRES_PASSWORD, JWT_SECRET, JWT_REFRESH_SECRET, DATABASE_URL" >&2
  exit 1
fi

echo "==> Build ${IMAGE_TAG}"
(cd "$REPO_ROOT" && docker build -t "${IMAGE_TAG}" .)

echo "==> Save image to tarball for ctr import"
docker save "${IMAGE_TAG}" -o /tmp/feastbox-api.tar

echo "==> Apply Secret + ConfigMap"
kubectl apply -f "$SCRIPT_DIR/secret.yaml"
kubectl apply -f "$SCRIPT_DIR/configmap.yaml"

echo "==> Apply in-cluster Container Registry (ULO evidence resource)"
kubectl apply -f "$SCRIPT_DIR/registry.yaml"

echo "==> Load image into worker node containerd"
kubectl delete pod image-loader --ignore-not-found --force --grace-period=0 2>/dev/null || true
kubectl apply -f "$SCRIPT_DIR/image-loader.yaml"
kubectl wait pod/image-loader --for=condition=Ready --timeout=60s
echo "    copying tarball (~142 MB)..."
(cd /tmp && kubectl cp ./feastbox-api.tar image-loader:/host/tmp/feastbox-api.tar)
kubectl exec image-loader -- sh -c 'chroot /host ctr -n=k8s.io image import /tmp/feastbox-api.tar'
kubectl delete pod image-loader --ignore-not-found --force --grace-period=0

echo "==> Apply Postgres (PVC + Service + StatefulSet)"
kubectl apply -f "$SCRIPT_DIR/postgres-pvc.yaml"
kubectl apply -f "$SCRIPT_DIR/postgres-service.yaml"
kubectl apply -f "$SCRIPT_DIR/postgres-statefulset.yaml"

echo "==> Wait for Postgres pod Ready (timeout 120s)"
kubectl wait --for=condition=Ready pod/postgres-0 --timeout=120s

echo "==> Re-create Migration Job"
kubectl delete job feastbox-migrate --ignore-not-found
kubectl apply -f "$SCRIPT_DIR/postgres-migration-job.yaml"

echo "==> Wait for Migration Job complete (timeout 120s)"
kubectl wait --for=condition=complete job/feastbox-migrate --timeout=120s

echo "==> Apply API (Deployment + Service + HPA)"
kubectl apply -f "$SCRIPT_DIR/api-deployment.yaml"
kubectl apply -f "$SCRIPT_DIR/api-service.yaml"
kubectl apply -f "$SCRIPT_DIR/api-hpa.yaml"

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
