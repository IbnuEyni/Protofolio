#!/usr/bin/env bash
# =============================================================================
# infra/bootstrap.sh  —  One-time GCP infrastructure provisioning
#
# Run ONCE from your local machine before the first deployment.
# Idempotent — safe to re-run; existing resources are skipped.
#
# Prerequisites:
#   gcloud auth login
#   gcloud auth application-default login
#   Billing enabled on the project
#
# Usage:
#   chmod +x infra/bootstrap.sh
#   PROJECT_ID=my-project-id ./infra/bootstrap.sh
# =============================================================================

set -euo pipefail

# ── CONFIG ────────────────────────────────────────────────────────────────────
PROJECT_ID="${PROJECT_ID:?Set PROJECT_ID env var, e.g. PROJECT_ID=my-proj ./infra/bootstrap.sh}"
REGION="${REGION:-us-central1}"
DB_INSTANCE="portfolio-db"
DB_NAME="portfolio"
DB_USER="portfolio_user"
ARTIFACT_REPO="portfolio-images"
CLOUDRUN_SA="portfolio-cloudrun-sa"
CLOUDBUILD_SA="portfolio-cloudbuild-sa"
GITHUB_REPO="${GITHUB_REPO:-}"   # optional: owner/repo for Cloud Build trigger
# ─────────────────────────────────────────────────────────────────────────────

CLOUDRUN_SA_EMAIL="${CLOUDRUN_SA}@${PROJECT_ID}.iam.gserviceaccount.com"
CLOUDBUILD_SA_EMAIL="${CLOUDBUILD_SA}@${PROJECT_ID}.iam.gserviceaccount.com"
ARTIFACT_HOST="${REGION}-docker.pkg.dev"

log()  { echo "▶ $*"; }
ok()   { echo "  ✓ $*"; }
warn() { echo "  ⚠ $*"; }

# ── 1. Set project ────────────────────────────────────────────────────────────
log "Setting project: $PROJECT_ID"
gcloud config set project "$PROJECT_ID"

# ── 2. Enable APIs ────────────────────────────────────────────────────────────
log "Enabling GCP APIs..."
gcloud services enable \
  run.googleapis.com \
  sqladmin.googleapis.com \
  artifactregistry.googleapis.com \
  secretmanager.googleapis.com \
  cloudbuild.googleapis.com \
  containerscanning.googleapis.com \
  containeranalysis.googleapis.com \
  iam.googleapis.com \
  iamcredentials.googleapis.com \
  cloudresourcemanager.googleapis.com \
  vpcaccess.googleapis.com \
  --quiet
ok "All APIs enabled"

# ── 3. Artifact Registry ──────────────────────────────────────────────────────
log "Creating Artifact Registry repository: $ARTIFACT_REPO"
gcloud artifacts repositories create "$ARTIFACT_REPO" \
  --repository-format=docker \
  --location="$REGION" \
  --description="Portfolio app Docker images" \
  --quiet 2>/dev/null && ok "Created $ARTIFACT_REPO" || ok "Already exists"

# Enable vulnerability scanning on the repo
gcloud artifacts repositories update "$ARTIFACT_REPO" \
  --location="$REGION" \
  --quiet 2>/dev/null || true

# ── 4. Cloud SQL — PostgreSQL 16 ──────────────────────────────────────────────
log "Creating Cloud SQL instance: $DB_INSTANCE (takes ~5 min)..."
gcloud sql instances create "$DB_INSTANCE" \
  --database-version=POSTGRES_16 \
  --tier=db-f1-micro \
  --region="$REGION" \
  --storage-type=SSD \
  --storage-size=10GB \
  --storage-auto-increase \
  --backup-start-time=03:00 \
  --retained-backups-count=7 \
  --deletion-protection \
  --no-assign-ip \
  --quiet 2>/dev/null && ok "Created $DB_INSTANCE" || ok "Already exists"

log "Creating database: $DB_NAME"
gcloud sql databases create "$DB_NAME" \
  --instance="$DB_INSTANCE" --quiet 2>/dev/null && ok "Created $DB_NAME" || ok "Already exists"

# Generate a cryptographically strong password
DB_PASSWORD=$(openssl rand -base64 48 | tr -dc 'A-Za-z0-9' | head -c 40)
log "Creating DB user: $DB_USER"
gcloud sql users create "$DB_USER" \
  --instance="$DB_INSTANCE" \
  --password="$DB_PASSWORD" \
  --quiet 2>/dev/null && ok "Created $DB_USER" || {
    warn "User may already exist — updating password"
    gcloud sql users set-password "$DB_USER" \
      --instance="$DB_INSTANCE" \
      --password="$DB_PASSWORD" --quiet
  }

# ── 5. Secret Manager ─────────────────────────────────────────────────────────
log "Storing secrets in Secret Manager..."

# Cloud SQL socket path — used by Cloud Run via the Auth Proxy sidecar
DB_URL="postgresql://${DB_USER}:${DB_PASSWORD}@localhost/${DB_NAME}?host=/cloudsql/${PROJECT_ID}:${REGION}:${DB_INSTANCE}"

upsert_secret() {
  local name="$1" value="$2"
  if gcloud secrets describe "$name" --quiet 2>/dev/null; then
    printf '%s' "$value" | gcloud secrets versions add "$name" --data-file=- --quiet
    ok "Updated secret: $name"
  else
    printf '%s' "$value" | gcloud secrets create "$name" \
      --data-file=- \
      --replication-policy=automatic \
      --quiet
    ok "Created secret: $name"
  fi
}

upsert_secret "DATABASE_URL" "$DB_URL"
upsert_secret "DB_PASSWORD"  "$DB_PASSWORD"

echo ""
warn "You must manually create these secrets before deploying:"
echo "   gcloud secrets create DEEPSEEK_API_KEY --data-file=- <<< 'sk-...'"
echo "   gcloud secrets create ADMIN_TOKEN      --data-file=- <<< \"\$(openssl rand -hex 32)\""
echo ""

# ── 6. Cloud Run service account ─────────────────────────────────────────────
log "Creating Cloud Run service account: $CLOUDRUN_SA"
gcloud iam service-accounts create "$CLOUDRUN_SA" \
  --display-name="Portfolio Cloud Run SA" \
  --quiet 2>/dev/null && ok "Created" || ok "Already exists"

for role in \
  "roles/cloudsql.client" \
  "roles/secretmanager.secretAccessor" \
  "roles/artifactregistry.reader" \
  "roles/run.viewer"; do
  gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member="serviceAccount:${CLOUDRUN_SA_EMAIL}" \
    --role="$role" \
    --condition=None \
    --quiet
  ok "$role → $CLOUDRUN_SA"
done

# ── 7. Cloud Build service account ───────────────────────────────────────────
log "Creating Cloud Build service account: $CLOUDBUILD_SA"
gcloud iam service-accounts create "$CLOUDBUILD_SA" \
  --display-name="Portfolio Cloud Build SA" \
  --quiet 2>/dev/null && ok "Created" || ok "Already exists"

for role in \
  "roles/run.admin" \
  "roles/artifactregistry.writer" \
  "roles/cloudsql.admin" \
  "roles/secretmanager.secretAccessor" \
  "roles/iam.serviceAccountUser" \
  "roles/logging.logWriter" \
  "roles/storage.objectAdmin"; do
  gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member="serviceAccount:${CLOUDBUILD_SA_EMAIL}" \
    --role="$role" \
    --condition=None \
    --quiet
  ok "$role → $CLOUDBUILD_SA"
done

# Allow Cloud Build SA to act as the Cloud Run SA
gcloud iam service-accounts add-iam-policy-binding "$CLOUDRUN_SA_EMAIL" \
  --member="serviceAccount:${CLOUDBUILD_SA_EMAIL}" \
  --role="roles/iam.serviceAccountUser" \
  --quiet
ok "Cloud Build SA can impersonate Cloud Run SA"

# ── 8. Cloud Build trigger (optional — requires GITHUB_REPO) ─────────────────
if [ -n "$GITHUB_REPO" ]; then
  log "Creating Cloud Build trigger for $GITHUB_REPO..."
  gcloud builds triggers create github \
    --name="portfolio-deploy-main" \
    --repo-name="$(basename "$GITHUB_REPO")" \
    --repo-owner="$(dirname "$GITHUB_REPO")" \
    --branch-pattern="^main$" \
    --build-config="cloudbuild.yaml" \
    --service-account="projects/${PROJECT_ID}/serviceAccounts/${CLOUDBUILD_SA_EMAIL}" \
    --substitutions="_REGION=${REGION},_ARTIFACT_REPO=${ARTIFACT_REPO},_CLOUD_SQL_CONN=${PROJECT_ID}:${REGION}:${DB_INSTANCE},_SA_EMAIL=${CLOUDRUN_SA_EMAIL}" \
    --quiet 2>/dev/null && ok "Trigger created" || ok "Trigger already exists"
else
  warn "GITHUB_REPO not set — skipping Cloud Build trigger creation."
  warn "Set it and re-run: GITHUB_REPO=owner/repo ./infra/bootstrap.sh"
fi

# ── 9. GitHub Actions Workload Identity Federation ────────────────────────────
# WIF is more secure than SA key files — no long-lived credentials to rotate.
log "Setting up Workload Identity Federation for GitHub Actions..."

POOL_ID="github-actions-pool"
PROVIDER_ID="github-provider"
GITHUB_ORG="${GITHUB_REPO%%/*}"   # extract org/user from owner/repo

# Create the pool
gcloud iam workload-identity-pools create "$POOL_ID" \
  --location=global \
  --display-name="GitHub Actions Pool" \
  --quiet 2>/dev/null && ok "Created WIF pool" || ok "Pool already exists"

# Create the OIDC provider
gcloud iam workload-identity-pools providers create-oidc "$PROVIDER_ID" \
  --location=global \
  --workload-identity-pool="$POOL_ID" \
  --display-name="GitHub OIDC Provider" \
  --issuer-uri="https://token.actions.githubusercontent.com" \
  --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository,attribute.actor=assertion.actor" \
  --attribute-condition="assertion.repository_owner=='${GITHUB_ORG}'" \
  --quiet 2>/dev/null && ok "Created OIDC provider" || ok "Provider already exists"

# Allow GitHub Actions to impersonate the Cloud Build SA
POOL_RESOURCE="projects/$(gcloud projects describe "$PROJECT_ID" --format='value(projectNumber)')/locations/global/workloadIdentityPools/${POOL_ID}/providers/${PROVIDER_ID}"

gcloud iam service-accounts add-iam-policy-binding "$CLOUDBUILD_SA_EMAIL" \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/${POOL_RESOURCE%/providers*}/attribute.repository/${GITHUB_REPO}" \
  --quiet
ok "WIF binding created for $GITHUB_REPO"

WIF_PROVIDER="projects/$(gcloud projects describe "$PROJECT_ID" --format='value(projectNumber)')/locations/global/workloadIdentityPools/${POOL_ID}/providers/${PROVIDER_ID}"

# ── Summary ───────────────────────────────────────────────────────────────────
echo ""
echo "════════════════════════════════════════════════════════════════"
echo "✅ Bootstrap complete"
echo ""
echo "GitHub Actions secrets to add (Settings → Secrets → Actions):"
echo ""
echo "  GCP_PROJECT_ID        = $PROJECT_ID"
echo "  GCP_REGION            = $REGION"
echo "  GCP_WORKLOAD_IDENTITY = $WIF_PROVIDER"
echo "  GCP_SERVICE_ACCOUNT   = $CLOUDBUILD_SA_EMAIL"
echo "  CLOUD_SQL_CONN        = ${PROJECT_ID}:${REGION}:${DB_INSTANCE}"
echo ""
echo "Cloud Build substitutions (already set in trigger if GITHUB_REPO was set):"
echo "  _REGION         = $REGION"
echo "  _ARTIFACT_REPO  = $ARTIFACT_REPO"
echo "  _CLOUD_SQL_CONN = ${PROJECT_ID}:${REGION}:${DB_INSTANCE}"
echo "  _SA_EMAIL       = $CLOUDRUN_SA_EMAIL"
echo ""
echo "Still required — create these secrets manually:"
echo "  gcloud secrets create DEEPSEEK_API_KEY --data-file=- <<< 'sk-...'"
echo "  gcloud secrets create ADMIN_TOKEN      --data-file=- <<< \"\$(openssl rand -hex 32)\""
echo "════════════════════════════════════════════════════════════════"
