#!/usr/bin/env bash
# Sync Supabase env vars from .env.local → Vercel project `gaprinthub`.
#
# Reads three variables from .env.local and pushes them to production,
# preview, and development environments. Values are piped to `vercel env add`
# via chmod-600 tmp files; values are NEVER printed to stdout/stderr.
#
# Run from the repo root (where .env.local and .vercel/project.json live):
#   bash scripts/sync-vercel-env.sh
#
# Prereqs:
#   - vercel CLI installed (brew install vercel-cli, or npm i -g vercel)
#   - .vercel/project.json present (run `vercel link` once if missing)
#   - .env.local contains: NEXT_PUBLIC_SUPABASE_URL,
#       NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, SUPABASE_SECRET_KEY

set -euo pipefail
umask 077

# Lock down tmp file location.
TMP_DIR="$(mktemp -d -t vercel-env-sync)"
trap 'find "$TMP_DIR" -type f -exec shred -u {} \; 2>/dev/null || rm -rf "$TMP_DIR"; rm -rf "$TMP_DIR"' EXIT

ENV_FILE=".env.local"
if [[ ! -f "$ENV_FILE" ]]; then
  echo "✗ $ENV_FILE not found. Run from the repo root." >&2
  exit 1
fi
if [[ ! -f ".vercel/project.json" ]]; then
  echo "✗ .vercel/project.json missing. Run 'vercel link' first." >&2
  exit 1
fi

# Variables to sync. NEXT_PUBLIC_* go to all envs; SUPABASE_SECRET_KEY also.
VARS=(
  "NEXT_PUBLIC_SUPABASE_URL"
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"
  "SUPABASE_SECRET_KEY"
)
ENVS=("production" "preview" "development")

# Extract a single variable's value from .env.local without echoing it.
# Strips matching surrounding single OR double quotes if present.
extract_value() {
  local name="$1" out="$2"
  # Use awk for safety: match only the first line with exactly that name=
  awk -v n="$name" '
    BEGIN { FS = "=" }
    $0 ~ "^" n "=" {
      val = substr($0, length(n) + 2)
      # strip matching outer quotes
      if (length(val) >= 2) {
        first = substr(val, 1, 1); last = substr(val, length(val), 1)
        if ((first == "\"" && last == "\"") || (first == "'\''" && last == "'\''")) {
          val = substr(val, 2, length(val) - 2)
        }
      }
      print val
      exit
    }
  ' "$ENV_FILE" > "$out"

  if [[ ! -s "$out" ]]; then
    return 1
  fi
}

echo "→ Syncing 3 Supabase variables across 3 environments (9 ops total)…"
echo

for name in "${VARS[@]}"; do
  val_file="$TMP_DIR/$name.val"
  if ! extract_value "$name" "$val_file"; then
    echo "✗ $name not found (or empty) in $ENV_FILE — skipping" >&2
    continue
  fi
  chmod 600 "$val_file"

  for env in "${ENVS[@]}"; do
    # Remove existing (idempotent; ignore if missing). Suppress stdout/stderr.
    vercel env rm "$name" "$env" -y >/dev/null 2>&1 || true

    # Add the new value via stdin. `vercel env add` reads stdin when piped.
    # We use `< file` so the value never appears in argv or shell history.
    if vercel env add "$name" "$env" < "$val_file" >/dev/null 2>&1; then
      printf "  \033[32m✓\033[0m %-42s → %s\n" "$name" "$env"
    else
      printf "  \033[31m✗\033[0m %-42s → %s  (FAILED — re-run manually)\n" "$name" "$env"
    fi
  done
done

echo
echo "→ Done. Verify with: vercel env ls"
echo "→ Trigger redeploy with: vercel --prod  (or push to main)"
