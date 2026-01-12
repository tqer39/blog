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
#   - 1Password vaults: "shared-secrets" and "blog-secrets"
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
SHARED_VAULT="shared-secrets"
CLOUDFLARE_ITEM="cloudflare"
VERCEL_ITEM="vercel"
BLOG_VAULT="blog-secrets"
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

    # Check if vaults exist
    if ! op vault get "$SHARED_VAULT" &> /dev/null; then
        log_error "1Password vault '$SHARED_VAULT' not found"
        exit 1
    fi

    if ! op vault get "$BLOG_VAULT" &> /dev/null; then
        log_error "1Password vault '$BLOG_VAULT' not found"
        exit 1
    fi

    log_success "All prerequisites met"
}

# Set GitHub Secret from Cloudflare vault (custom field)
set_github_secret_cf() {
    local field="$1"
    local secret_name="$2"

    if [[ "$DRY_RUN" == "true" ]]; then
        log_info "[DRY-RUN] Would set GitHub Secret: $secret_name (from cloudflare/$field)"
        return 0
    fi

    if op read "op://${SHARED_VAULT}/${CLOUDFLARE_ITEM}/${field}" 2>/dev/null | \
        gh secret set "$secret_name" --repo "$REPO" --body -; then
        log_success "GitHub Secret: $secret_name"
    else
        log_warn "Failed to set GitHub Secret: $secret_name (field may not exist)"
    fi
}

# Set GitHub Secret from Vercel vault (custom field)
set_github_secret_vercel() {
    local field="$1"
    local secret_name="$2"

    if [[ "$DRY_RUN" == "true" ]]; then
        log_info "[DRY-RUN] Would set GitHub Secret: $secret_name (from vercel/$field)"
        return 0
    fi

    if op read "op://${SHARED_VAULT}/${VERCEL_ITEM}/${field}" 2>/dev/null | \
        gh secret set "$secret_name" --repo "$REPO" --body -; then
        log_success "GitHub Secret: $secret_name"
    else
        log_warn "Failed to set GitHub Secret: $secret_name (field may not exist)"
    fi
}

# Set GitHub Secret from blog-secrets vault (item/password)
set_github_secret_blog() {
    local op_item="$1"
    local secret_name="$2"
    local field="${3:-password}"

    if [[ "$DRY_RUN" == "true" ]]; then
        log_info "[DRY-RUN] Would set GitHub Secret: $secret_name (from $op_item)"
        return 0
    fi

    if op read "op://${BLOG_VAULT}/${op_item}/${field}" 2>/dev/null | \
        gh secret set "$secret_name" --repo "$REPO" --body -; then
        log_success "GitHub Secret: $secret_name"
    else
        log_warn "Failed to set GitHub Secret: $secret_name (item may not exist)"
    fi
}

# Set GitHub Secret from shared-secrets vault (generic item/field)
set_github_secret_shared() {
    local op_item="$1"
    local secret_name="$2"
    local field="$3"

    if [[ "$DRY_RUN" == "true" ]]; then
        log_info "[DRY-RUN] Would set GitHub Secret: $secret_name (from shared-secrets/$op_item/$field)"
        return 0
    fi

    if op read "op://${SHARED_VAULT}/${op_item}/${field}" 2>/dev/null | \
        gh secret set "$secret_name" --repo "$REPO" --body -; then
        log_success "GitHub Secret: $secret_name"
    else
        log_warn "Failed to set GitHub Secret: $secret_name (item may not exist)"
    fi
}

# Set Wrangler Secret from Cloudflare vault (custom field)
set_wrangler_secret_cf() {
    local field="$1"
    local secret_name="$2"
    local wrangler_env="$3"

    if [[ "$DRY_RUN" == "true" ]]; then
        log_info "[DRY-RUN] Would set Wrangler Secret: $secret_name (env: $wrangler_env, from cloudflare/$field)"
        return 0
    fi

    cd "$PROJECT_ROOT/apps/cms-api"
    if op read "op://${SHARED_VAULT}/${CLOUDFLARE_ITEM}/${field}" 2>/dev/null | \
        pnpm wrangler secret put "$secret_name" --env "$wrangler_env"; then
        log_success "Wrangler Secret: $secret_name (env: $wrangler_env)"
    else
        log_warn "Failed to set Wrangler Secret: $secret_name (field may not exist)"
    fi
    cd "$PROJECT_ROOT"
}

# Set Wrangler Secret from blog-secrets vault (item/password)
set_wrangler_secret_blog() {
    local op_item="$1"
    local secret_name="$2"
    local wrangler_env="$3"
    local field="${4:-password}"

    if [[ "$DRY_RUN" == "true" ]]; then
        log_info "[DRY-RUN] Would set Wrangler Secret: $secret_name (env: $wrangler_env, from $op_item)"
        return 0
    fi

    cd "$PROJECT_ROOT/apps/cms-api"
    if op read "op://${BLOG_VAULT}/${op_item}/${field}" 2>/dev/null | \
        pnpm wrangler secret put "$secret_name" --env "$wrangler_env"; then
        log_success "Wrangler Secret: $secret_name (env: $wrangler_env)"
    else
        log_warn "Failed to set Wrangler Secret: $secret_name (item may not exist)"
    fi
    cd "$PROJECT_ROOT"
}

# Set Wrangler Secret from shared-secrets vault (generic item/field)
set_wrangler_secret_shared() {
    local op_item="$1"
    local secret_name="$2"
    local wrangler_env="$3"
    local field="$4"

    if [[ "$DRY_RUN" == "true" ]]; then
        log_info "[DRY-RUN] Would set Wrangler Secret: $secret_name (env: $wrangler_env, from shared-secrets/$op_item/$field)"
        return 0
    fi

    cd "$PROJECT_ROOT/apps/cms-api"
    if op read "op://${SHARED_VAULT}/${op_item}/${field}" 2>/dev/null | \
        pnpm wrangler secret put "$secret_name" --env "$wrangler_env"; then
        log_success "Wrangler Secret: $secret_name (env: $wrangler_env)"
    else
        log_warn "Failed to set Wrangler Secret: $secret_name (item may not exist)"
    fi
    cd "$PROJECT_ROOT"
}

# Main sync function
sync_all_secrets() {
    log_info "Starting secret sync..."
    [[ "$DRY_RUN" == "true" ]] && log_warn "DRY-RUN mode: No changes will be made"
    printf "\n"

    # ========================================
    # GitHub Secrets
    # ========================================
    if [[ "$SYNC_GITHUB" == "true" ]]; then
        # Infrastructure (from shared-secrets/cloudflare)
        log_info "=== Infrastructure Secrets (GitHub) ==="
        set_github_secret_cf "api-token"               "CLOUDFLARE_API_TOKEN"
        set_github_secret_cf "account-id"              "CLOUDFLARE_ACCOUNT_ID"
        set_github_secret_cf "blog-zone-id"            "CLOUDFLARE_ZONE_ID"
        set_github_secret_cf "blog-d1-database-id-dev" "D1_DATABASE_ID_DEV"
        set_github_secret_cf "blog-d1-database-id-prod" "D1_DATABASE_ID_PROD"
        printf "\n"

        # AI Services (OpenAI from shared-secrets, others from blog-secrets)
        log_info "=== AI Service Secrets (GitHub) ==="
        set_github_secret_shared "openai" "OPENAI_API_KEY" "blog-secret-key"
        set_github_secret_shared "anthropic" "ANTHROPIC_API_KEY" "blog-api-key"
        printf "\n"

        # Third-party (all from shared-secrets)
        log_info "=== Third-party Service Secrets (GitHub) ==="
        set_github_secret_shared "discord" "DISCORD_WEBHOOK_DEV" "blog-webhook-url-dev"
        set_github_secret_shared "discord" "DISCORD_WEBHOOK_PROD" "blog-webhook-url-prod"
        set_github_secret_shared "codecov" "CODECOV_TOKEN" "blog"
        printf "\n"

        # Vercel (from shared-secrets/vercel)
        log_info "=== Vercel Secrets (GitHub) ==="
        set_github_secret_vercel "blog-api-token"     "VERCEL_API_TOKEN"
        printf "\n"

        # GitHub App (from blog-secrets)
        log_info "=== GitHub App Secrets (GitHub) ==="
        set_github_secret_blog "gha-app-id"          "GHA_APP_ID"
        set_github_secret_blog "gha-app-private-key" "GHA_APP_PRIVATE_KEY" "private key"
        printf "\n"
    fi

    # ========================================
    # Wrangler Secrets (Dev)
    # ========================================
    if [[ "$SYNC_WRANGLER" == "true" ]]; then
        log_info "=== R2 Secrets (Dev) ==="
        set_wrangler_secret_cf "blog-r2-token"             "R2_TOKEN"             "dev"
        set_wrangler_secret_cf "blog-r2-access-key-id"     "R2_ACCESS_KEY_ID"     "dev"
        set_wrangler_secret_cf "blog-r2-secret-access-key" "R2_SECRET_ACCESS_KEY" "dev"
        set_wrangler_secret_cf "blog-r2-public-url-dev"    "R2_PUBLIC_URL"        "dev"
        printf "\n"

        log_info "=== AI Service Secrets (Dev) ==="
        set_wrangler_secret_shared "openai" "OPENAI_API_KEY" "dev" "blog-secret-key"
        set_wrangler_secret_shared "google-ai-studio" "GEMINI_API_KEY" "dev" "blog-api-key"
        set_wrangler_secret_shared "anthropic" "ANTHROPIC_API_KEY" "dev" "blog-api-key"
        printf "\n"

        log_info "=== Application Secrets (Dev) ==="
        set_wrangler_secret_blog "auth-secret"              "AUTH_SECRET"         "dev" "dev"
        set_wrangler_secret_blog "admin-password-hash-dev" "ADMIN_PASSWORD_HASH" "dev" "hash"
        set_wrangler_secret_blog "basic-auth"               "BASIC_AUTH_USER"     "dev" "username"
        set_wrangler_secret_blog "basic-auth"               "BASIC_AUTH_PASS"     "dev" "password"
        printf "\n"

        # ========================================
        # Wrangler Secrets (Prod)
        # ========================================
        log_info "=== R2 Secrets (Prod) ==="
        set_wrangler_secret_cf "blog-r2-token"             "R2_TOKEN"             "prod"
        set_wrangler_secret_cf "blog-r2-access-key-id"     "R2_ACCESS_KEY_ID"     "prod"
        set_wrangler_secret_cf "blog-r2-secret-access-key" "R2_SECRET_ACCESS_KEY" "prod"
        set_wrangler_secret_cf "blog-r2-public-url-prod"   "R2_PUBLIC_URL"        "prod"
        printf "\n"

        log_info "=== AI Service Secrets (Prod) ==="
        set_wrangler_secret_shared "openai" "OPENAI_API_KEY" "prod" "blog-secret-key"
        set_wrangler_secret_shared "google-ai-studio" "GEMINI_API_KEY" "prod" "blog-api-key"
        set_wrangler_secret_shared "anthropic" "ANTHROPIC_API_KEY" "prod" "blog-api-key"
        printf "\n"

        log_info "=== Application Secrets (Prod) ==="
        set_wrangler_secret_blog "auth-secret"              "AUTH_SECRET"         "prod" "prod"
        set_wrangler_secret_blog "admin-password-hash-prod" "ADMIN_PASSWORD_HASH" "prod" "hash"
        printf "\n"
    fi

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
    printf "  cd apps/cms-api && pnpm wrangler secret list --env prod\n"
}

main
