set shell := ["bash", "-euo", "pipefail", "-c"]

# Environment variables
aws_profile := env("AWS_PROFILE", "default")

# Show help
help:
    @just --list

default: help

# Setup
setup: setup-mise setup-direnv setup-hooks
    @echo "Setup completed"

setup-mise:
    @mise install

setup-direnv:
    @direnv allow .

setup-hooks:
    @prek install

# Development
dev:
    @pnpm dev

build:
    @pnpm build

start:
    @pnpm --filter @blog/web start

# Code quality
lint:
    @biome lint --write .

format:
    @biome format --write .

check:
    @biome check --write .

lint-hook hook:
    @prek run {{hook}}

lint-all:
    @prek run -a

# Testing
test:
    @pnpm test

test-coverage:
    @pnpm test -- --coverage

# CMS Local Development
dev-all:
    #!/usr/bin/env bash
    set -euo pipefail
    echo "→ Starting all services..."
    echo "  - CMS API: http://localhost:8787"
    echo "  - Blog:    http://localhost:3100"
    echo ""
    concurrently \
        --names "api,blog" \
        --prefix-colors "yellow,cyan" \
        "pnpm --filter @blog/cms-api dev" \
        "pnpm --filter @blog/web dev"

dev-blog:
    #!/usr/bin/env bash
    set -euo pipefail
    just kill-port 3100 || true
    pnpm --filter @blog/web dev

dev-api:
    #!/usr/bin/env bash
    set -euo pipefail
    just kill-port 8787 || true
    pnpm --filter @blog/cms-api dev

# Kill process using a specific port
kill-port port:
    #!/usr/bin/env bash
    set -euo pipefail
    pid=$(lsof -ti :{{port}} 2>/dev/null || true)
    if [ -n "$pid" ]; then
        echo "→ Killing process on port {{port}} (PID: $pid)"
        kill -9 $pid
        sleep 1
    fi

# Database commands
db-reset:
    #!/usr/bin/env bash
    set -euo pipefail
    echo "→ Resetting local D1 database..."
    rm -rf apps/cms-api/.wrangler/state/v3/d1
    echo "✅ Local D1 database reset"

db-migrate:
    #!/usr/bin/env bash
    set -euo pipefail
    echo "→ Running D1 migrations..."
    cd apps/cms-api
    for migration in migrations/*.sql; do
        echo "  Applying: $migration"
        wrangler d1 execute blog-cms --local --file="$migration"
    done
    echo "✅ D1 local migrations completed"

db-seed:
    #!/usr/bin/env bash
    set -euo pipefail
    echo "→ Seeding sample data..."
    cd apps/blog && pnpm migrate
    echo "✅ Sample data seeded"

# Legacy aliases
db-migrate-local: db-migrate

seed: db-seed

# Dependencies
deps:
    @echo "→ Installing dependencies..."
    @pnpm install
    @echo "✅ Dependencies installed"

# Bootstrap: Full local development setup
bootstrap: deps db-reset db-migrate db-seed
    @echo ""
    @echo "✅ Bootstrap completed!"
    @echo ""
    @echo "To start development servers:"
    @echo "  just dev-api   # Terminal 1: API server (http://localhost:8787)"
    @echo "  just dev-blog  # Terminal 2: Blog app (http://localhost:3100)"

# E2E tests
e2e:
    @pnpm e2e

e2e-ui:
    @pnpm --filter @blog/web e2e:ui

# Wrap terraform with convenient -chdir handling
# Usage examples:
#   just tf -chdir=dev/bootstrap init -reconfigure
#   just tf -chdir=infra/terraform/envs/dev/bootstrap plan
#   just tf version
tf *args:
    @echo "→ make terraform-cf ARGS='{{args}}'"
    @exec make terraform-cf ARGS="{{args}}"

# mise tool management
status:
    @mise status

install:
    @mise install

update:
    @mise upgrade

# Git Worktree commands

# Worktree directory (relative to repo root)
wt_dir := "../dotfiles-worktrees"

# Create a new worktree with a new branch (branch name: name-yymmdd-xxxxxx)
wt-new name:
    #!/usr/bin/env bash
    set -euo pipefail
    suffix="$(date +%y%m%d)-$(openssl rand -hex 3)"
    branch="{{name}}-${suffix}"
    echo "→ Creating worktree: ${branch}"
    mkdir -p {{wt_dir}}
    git worktree add "{{wt_dir}}/${branch}" -b "${branch}"
    echo "✅ Worktree ready: {{wt_dir}}/${branch}"

# Create a worktree from an existing branch
wt-add branch:
    @echo "→ Creating worktree from branch: {{branch}}"
    @mkdir -p {{wt_dir}}
    git worktree add {{wt_dir}}/{{branch}} {{branch}}
    @echo "✅ Worktree ready: {{wt_dir}}/{{branch}}"

# List all worktrees
wt-list:
    @git worktree list

# Remove a worktree
wt-rm name="":
    #!/usr/bin/env bash
    set -euo pipefail
    if [ -z "{{name}}" ]; then
        echo "Usage: just wt-rm <name>"
        echo ""
        echo "Available worktrees:"
        git worktree list | grep -v "(bare)" | awk '{print $1}' | xargs -I{} basename {} | sed 's/^/  /'
        exit 1
    fi
    echo "→ Removing worktree: {{name}}"
    git worktree remove {{wt_dir}}/{{name}}
    echo "✅ Worktree removed"

# Remove a worktree (force)
wt-rm-force name="":
    #!/usr/bin/env bash
    set -euo pipefail
    if [ -z "{{name}}" ]; then
        echo "Usage: just wt-rm-force <name>"
        echo ""
        echo "Available worktrees:"
        git worktree list | grep -v "(bare)" | awk '{print $1}' | xargs -I{} basename {} | sed 's/^/  /'
        exit 1
    fi
    echo "→ Force removing worktree: {{name}}"
    git worktree remove --force {{wt_dir}}/{{name}}
    echo "✅ Worktree removed"

# Open worktree in VS Code
wt-code name:
    @code {{wt_dir}}/{{name}}

# Prune stale worktree references
wt-prune:
    @echo "→ Pruning stale worktree references..."
    git worktree prune
    @echo "✅ Pruned"
