#!/usr/bin/env bash
set -euo pipefail

PROJECT_ID="${GOOGLE_CLOUD_PROJECT:-$(gcloud config get-value project 2>/dev/null)}"
REGION="${GCP_REGION:-me-central1}"
SERVICE="${SEO_CLOUD_RUN_SERVICE:-seo-control-center}"
RUNTIME_SA_NAME="${SEO_RUNTIME_SA_NAME:-seo-control-center}"
SCHEDULER_SA_NAME="${SEO_SCHEDULER_SA_NAME:-seo-control-center-scheduler}"
IMAGE="${SEO_IMAGE:-gcr.io/${PROJECT_ID}/${SERVICE}:latest}"
SCHEDULE="${SEO_SCHEDULE:-15 7 * * *}"
TIME_ZONE="${SEO_TIME_ZONE:-Asia/Riyadh}"

if [[ -z "${PROJECT_ID}" || "${PROJECT_ID}" == "(unset)" ]]; then
  echo "Set GOOGLE_CLOUD_PROJECT or run: gcloud config set project PROJECT_ID" >&2
  exit 1
fi

RUNTIME_SA="${RUNTIME_SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"
SCHEDULER_SA="${SCHEDULER_SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"

ensure_service_account() {
  local name="$1"
  local display="$2"
  if ! gcloud iam service-accounts describe "${name}@${PROJECT_ID}.iam.gserviceaccount.com" --project "$PROJECT_ID" >/dev/null 2>&1; then
    gcloud iam service-accounts create "$name" --display-name "$display" --project "$PROJECT_ID"
  fi
}

echo "Using project: ${PROJECT_ID}"
echo "Using region:  ${REGION}"

gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  cloudscheduler.googleapis.com \
  secretmanager.googleapis.com \
  searchconsole.googleapis.com \
  pagespeedonline.googleapis.com \
  chromeuxreport.googleapis.com \
  --project "$PROJECT_ID"

ensure_service_account "$RUNTIME_SA_NAME" "SEO Control Center runtime"
ensure_service_account "$SCHEDULER_SA_NAME" "SEO Control Center scheduler"

gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:${RUNTIME_SA}" \
  --role="roles/secretmanager.secretAccessor" \
  --condition=None >/dev/null

gcloud builds submit \
  --project "$PROJECT_ID" \
  --config ops/seo-control-center/cloudbuild.yaml \
  --substitutions="_IMAGE=${IMAGE}" \
  .

SECRET_FLAGS=()
if gcloud secrets describe gsc-service-account-json --project "$PROJECT_ID" >/dev/null 2>&1; then
  SECRET_FLAGS+=(--set-secrets="GSC_SERVICE_ACCOUNT_JSON=gsc-service-account-json:latest")
else
  echo "NOTE: gsc-service-account-json secret not found; Search Console API will stay disabled until it is added."
fi
if gcloud secrets describe pagespeed-api-key --project "$PROJECT_ID" >/dev/null 2>&1; then
  SECRET_FLAGS+=(--set-secrets="PAGESPEED_API_KEY=pagespeed-api-key:latest")
else
  echo "NOTE: pagespeed-api-key secret not found; PageSpeed API will stay disabled until it is added."
fi
if gcloud secrets describe crux-api-key --project "$PROJECT_ID" >/dev/null 2>&1; then
  SECRET_FLAGS+=(--set-secrets="CRUX_API_KEY=crux-api-key:latest")
else
  echo "NOTE: crux-api-key secret not found; CrUX will reuse PAGESPEED_API_KEY when available."
fi

gcloud run deploy "$SERVICE" \
  --image "$IMAGE" \
  --region "$REGION" \
  --project "$PROJECT_ID" \
  --platform managed \
  --service-account "$RUNTIME_SA" \
  --no-allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --timeout 900 \
  --max-instances 2 \
  --set-env-vars="GSC_SITE_PROPERTY=sc-domain:eslam-elshikh.com,SEO_ORIGIN=https://www.eslam-elshikh.com,SEO_SITEMAP_URL=https://www.eslam-elshikh.com/sitemap.xml" \
  "${SECRET_FLAGS[@]}"

SERVICE_URL="$(gcloud run services describe "$SERVICE" --region "$REGION" --project "$PROJECT_ID" --format='value(status.url)')"

gcloud run services add-iam-policy-binding "$SERVICE" \
  --region "$REGION" \
  --project "$PROJECT_ID" \
  --member="serviceAccount:${SCHEDULER_SA}" \
  --role="roles/run.invoker" >/dev/null

if gcloud scheduler jobs describe "$SERVICE" --location "$REGION" --project "$PROJECT_ID" >/dev/null 2>&1; then
  gcloud scheduler jobs update http "$SERVICE" \
    --location "$REGION" \
    --project "$PROJECT_ID" \
    --schedule "$SCHEDULE" \
    --time-zone "$TIME_ZONE" \
    --uri="${SERVICE_URL}/run" \
    --http-method=GET \
    --oidc-service-account-email="$SCHEDULER_SA" \
    --oidc-token-audience="$SERVICE_URL"
else
  gcloud scheduler jobs create http "$SERVICE" \
    --location "$REGION" \
    --project "$PROJECT_ID" \
    --schedule "$SCHEDULE" \
    --time-zone "$TIME_ZONE" \
    --uri="${SERVICE_URL}/run" \
    --http-method=GET \
    --oidc-service-account-email="$SCHEDULER_SA" \
    --oidc-token-audience="$SERVICE_URL"
fi

echo
printf 'Cloud Run service: %s\n' "$SERVICE_URL"
printf 'Runtime identity:  %s\n' "$RUNTIME_SA"
printf 'Scheduler:         %s (%s)\n' "$SCHEDULE" "$TIME_ZONE"
echo
cat <<EOF
NEXT REQUIRED GOOGLE STEP
Add the Search Console service-account identity represented by the JSON stored in Secret Manager as a user of:
  sc-domain:eslam-elshikh.com
Then the next scheduled run will activate URL Inspection, Search Analytics, and Sitemap status automatically.
EOF
