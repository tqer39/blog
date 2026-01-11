#!/bin/bash
# sync-secrets.sh - Sync secrets from 1Password to GitHub Secrets and Cloudflare Workers
#
# Security features:
#   - Secrets are piped directly from 1Password (never stored in variables)
#   - No use of echo (avoids process list exposure)
#   - umask 077 for restrictive file permissions
#   - Signal handling for clean interruption
#
# Prerequisites:
#   - 1Password CLI (op): brew install 1password-cli
#   - GitHub CLI (gh): brew install gh
#   - Logged into 1Password: op signin
#   - Logged into GitHub: gh auth login
#   - 1Password vault "blog-secrets" with items configured
#
# Usage:
#   ./scripts/sync-secrets.sh           # Sync all secrets
#   ./scripts/sync-secrets.sh --github  # Sync only GitHub Secrets
#   ./scripts/sync-secrets.sh --wrangler # Sync only Wrangler Secrets
#   ./scripts/sync-secrets.sh --dry-run # Show what would be synced

set -euo pipefail

# Security: Restrict file permissions for any temporary files
umask 077

# Configuration
VAULT="blog-secrets"
REPO="tqer39/blog"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions (use printf instead of echo for consistency)
log_info() { printf "${BLUE}[INFO]${NC} %s\n" "$1"; }
log_success() { printf "${GREEN}[OK]${NC} %s\n" "$1"; }
log_warn() { printf "${YELLOW}[WARN]${NC} %s\n" "$1"; }
log_error() { printf "${RED}[ERROR]${NC} %s\n" "$1" >&2; }

# Signal handling for clean interruption
cleanup() {
    log_error "Interrupted by signal"
    exit 130
}
trap cleanup INT TERM

# Parse arguments
SYNC_GITHUB=true
SYNC_WRANGLER=true
DRY_RUN=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --github)
            SYNC_GITHUB=true
            SYNC_WRANGLER=false
            shift
            ;;
        --wrangler)
            SYNC_GITHUB=false
            SYNC_WRANGLER=true
            shift
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        -h|--help)
            printf "Usage: %s [OPTIONS]\n" "$0"
            printf "\n"
            printf "Options:\n"
            printf "  --github    Sync only GitHub Secrets\n"
            printf "  --wrangler  Sync only Cloudflare Workers Secrets\n"
            printf "  --dry-run   Show what would be synced without making changes\n"
            printf "  -h, --help  Show this help message\n"
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."

    if ! command -v op &> /dev/null; then
        log_error "1Password CLI (op) is not installed"
        log_info "Install with: brew install 1password-cli"
        exit 1
    fi

    if ! command -v gh &> /dev/null; then
        log_error "GitHub CLI (gh) is not installed"
        log_info "Install with: brew install gh"
        exit 1
    fi

    # Check 1Password sign-in
    if ! op whoami &> /dev/null; then
        log_error "Not signed in to 1Password"
        log_info "Sign in with: op signin"
        exit 1
    fi

    # Check GitHub auth
    if ! gh auth status &> /dev/null; then
        log_error "Not authenticated with GitHub CLI"
        log_info "Authenticate with: gh auth login"
        exit 1
    fi

    # Check if vault exists
    if ! op vault get "$VAULT" &> /dev/null; then
        log_error "1Password vault '$VAULT' not found"
        log_info "Create the vault and add secrets first"
        exit 1
    fi

    log_success "All prerequisites met"
}

# Set GitHub Secret (secrets piped directly, never stored in variables)
set_github_secret() {
    local op_item="$1"
    local secret_name="$2"
    local field="${3:-password}"

    if [[ "$DRY_RUN" == "true" ]]; then
        log_info "[DRY-RUN] Would set GitHub Secret: $secret_name"
        return 0
    fi

    # Security: Pipe directly from op to gh (secret never in a variable or echo)
    if op read "op://${VAULT}/${op_item}/${field}" 2>/dev/null | \
        gh secret set "$secret_name" --repo "$REPO" --body -; then
        log_success "GitHub Secret: $secret_name"
    else
        log_warn "Failed to set GitHub Secret: $secret_name (item may not exist)"
    fi
}

# Set Wrangler Secret (secrets piped directly, never stored in variables)
set_wrangler_secret() {
    local op_item="$1"
    local secret_name="$2"
    local wrangler_env="$3"  # "dev" or "production"
    local field="${4:-password}"

    if [[ "$DRY_RUN" == "true" ]]; then
        log_info "[DRY-RUN] Would set Wrangler Secret: $secret_name (env: $wrangler_env)"
        return 0
    fi

    # Security: Pipe directly from op to wrangler (secret never in a variable or echo)
    cd "$PROJECT_ROOT/apps/cms-api"
    if op read "op://${VAULT}/${op_item}/${field}" 2>/dev/null | \
        pnpm wrangler secret put "$secret_name" --env "$wrangler_env"; then
        log_success "Wrangler Secret: $secret_name (env: $wrangler_env)"
    else
        log_warn "Failed to set Wrangler Secret: $secret_name (item may not exist)"
    fi
    cd "$PROJECT_ROOT"
}

# Sync a secret to specified targets
sync_secret() {
    local op_item="$1"
    local secret_name="$2"
    local targets="$3"  # "github", "wrangler_dev", "wrangler_prod", "wrangler_both", "github_wrangler_both"
    local field="${4:-password}"

    case "$targets" in
        github)
            if [[ "$SYNC_GITHUB" == "true" ]]; then
                set_github_secret "$op_item" "$secret_name" "$field"
            fi
            ;;
        wrangler_dev)
            if [[ "$SYNC_WRANGLER" == "true" ]]; then
                set_wrangler_secret "$op_item" "$secret_name" "dev" "$field"
            fi
            ;;
        wrangler_prod)
            if [[ "$SYNC_WRANGLER" == "true" ]]; then
                set_wrangler_secret "$op_item" "$secret_name" "production" "$field"
            fi
            ;;
        wrangler_both)
            # Same 1Password item synced to both dev and production
            if [[ "$SYNC_WRANGLER" == "true" ]]; then
                set_wrangler_secret "$op_item" "$secret_name" "dev" "$field"
                set_wrangler_secret "$op_item" "$secret_name" "production" "$field"
            fi
            ;;
        github_wrangler_both)
            # GitHub + both Wrangler environments (same 1Password item)
            if [[ "$SYNC_GITHUB" == "true" ]]; then
                set_github_secret "$op_item" "$secret_name" "$field"
            fi
            if [[ "$SYNC_WRANGLER" == "true" ]]; then
                set_wrangler_secret "$op_item" "$secret_name" "dev" "$field"
                set_wrangler_secret "$op_item" "$secret_name" "production" "$field"
            fi
            ;;
    esac
}

# Main sync function
sync_all_secrets() {
    log_info "Starting secret sync..."
    [[ "$DRY_RUN" == "true" ]] && log_warn "DRY-RUN mode: No changes will be made"
    printf "\n"

    # Infrastructure secrets (GitHub only)
    log_info "=== Infrastructure Secrets (GitHub) ==="
    sync_secret "cloudflare-api-token"  "CLOUDFLARE_API_TOKEN"  "github"
    sync_secret "cloudflare-account-id" "CLOUDFLARE_ACCOUNT_ID" "github"
    sync_secret "cloudflare-zone-id"    "CLOUDFLARE_ZONE_ID"    "github"
    sync_secret "vercel-api-token"      "VERCEL_API_TOKEN"      "github"
    sync_secret "d1-database-id-dev"    "D1_DATABASE_ID_DEV"    "github"
    sync_secret "d1-database-id-prod"   "D1_DATABASE_ID_PROD"   "github"
    printf "\n"

    # R2 secrets (environment-specific)
    log_info "=== R2 Secrets (Dev) ==="
    sync_secret "r2-access-key-id-dev"     "R2_ACCESS_KEY_ID"     "wrangler_dev"
    sync_secret "r2-secret-access-key-dev" "R2_SECRET_ACCESS_KEY" "wrangler_dev"
    sync_secret "r2-public-url-dev"        "R2_PUBLIC_URL"        "wrangler_dev"
    printf "\n"

    log_info "=== R2 Secrets (Prod) ==="
    sync_secret "r2-access-key-id-prod"     "R2_ACCESS_KEY_ID"     "wrangler_prod"
    sync_secret "r2-secret-access-key-prod" "R2_SECRET_ACCESS_KEY" "wrangler_prod"
    sync_secret "r2-public-url-prod"        "R2_PUBLIC_URL"        "wrangler_prod"
    printf "\n"

    # AI API keys (environment-specific for Wrangler, shared for GitHub)
    log_info "=== AI Service Secrets (GitHub) ==="
    sync_secret "openai-api-key-prod"    "OPENAI_API_KEY"    "github"  # PR description generation
    sync_secret "anthropic-api-key-prod" "ANTHROPIC_API_KEY" "github"  # Future use
    printf "\n"

    log_info "=== AI Service Secrets (Dev) ==="
    sync_secret "openai-api-key-dev"    "OPENAI_API_KEY"    "wrangler_dev"
    sync_secret "gemini-api-key-dev"    "GEMINI_API_KEY"    "wrangler_dev"
    sync_secret "anthropic-api-key-dev" "ANTHROPIC_API_KEY" "wrangler_dev"
    printf "\n"

    log_info "=== AI Service Secrets (Prod) ==="
    sync_secret "openai-api-key-prod"    "OPENAI_API_KEY"    "wrangler_prod"
    sync_secret "gemini-api-key-prod"    "GEMINI_API_KEY"    "wrangler_prod"
    sync_secret "anthropic-api-key-prod" "ANTHROPIC_API_KEY" "wrangler_prod"
    printf "\n"

    # Application secrets (environment-specific)
    log_info "=== Application Secrets (Dev) ==="
    sync_secret "auth-secret-dev"         "AUTH_SECRET"         "wrangler_dev"
    sync_secret "admin-password-hash-dev" "ADMIN_PASSWORD_HASH" "wrangler_dev"
    printf "\n"

    log_info "=== Application Secrets (Prod) ==="
    sync_secret "auth-secret-prod"         "AUTH_SECRET"         "wrangler_prod"
    sync_secret "admin-password-hash-prod" "ADMIN_PASSWORD_HASH" "wrangler_prod"
    printf "\n"

    # Third-party service secrets (GitHub only)
    log_info "=== Third-party Service Secrets (GitHub) ==="
    sync_secret "slack-webhook-dev"    "SLACK_WEBHOOK_DEV"    "github"
    sync_secret "slack-webhook-prod"   "SLACK_WEBHOOK_PROD"   "github"
    sync_secret "discord-webhook-dev"  "DISCORD_WEBHOOK_DEV"  "github"
    sync_secret "discord-webhook-prod" "DISCORD_WEBHOOK_PROD" "github"
    sync_secret "codecov-token"        "CODECOV_TOKEN"        "github"
    printf "\n"

    # GitHub App secrets (GitHub only)
    log_info "=== GitHub App Secrets (GitHub) ==="
    sync_secret "gha-app-id"          "GHA_APP_ID"          "github"
    sync_secret "gha-app-private-key" "GHA_APP_PRIVATE_KEY" "github" "private key"
    printf "\n"

    log_success "Secret sync completed!"
}

# Main
main() {
    printf "\n"
    printf "==================================\n"
    printf "  1Password -> GitHub & Wrangler\n"
    printf "==================================\n"
    printf "\n"

    check_prerequisites
    printf "\n"
    sync_all_secrets

    printf "\n"
    log_info "Verification commands:"
    printf "  gh secret list --repo %s\n" "$REPO"
    printf "  cd apps/cms-api && pnpm wrangler secret list --env dev\n"
    printf "  cd apps/cms-api && pnpm wrangler secret list --env production\n"
}

main
