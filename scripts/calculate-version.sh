#!/usr/bin/env bash
#
# calculate-version.sh
#
# Calculates the next semantic version based on conventional commits
# since the last tag.
#
# Usage:
#   ./scripts/calculate-version.sh           # Output next version
#   ./scripts/calculate-version.sh --current # Output current version
#   ./scripts/calculate-version.sh --bump    # Output bump type (major|minor|patch|none)
#
# Exit codes:
#   0 - Success
#   1 - Error (e.g., no tags found)
#

set -euo pipefail

# Get the latest tag
get_latest_tag() {
  git describe --tags --abbrev=0 2>/dev/null || echo ""
}

# Parse version components from tag (e.g., v1.2.3 -> "1 2 3")
parse_version() {
  local tag="$1"
  echo "$tag" | sed 's/^v//' | tr '.' ' '
}

# Determine bump type from commits
get_bump_type() {
  local since="${1:-}"
  local log_range=""

  if [[ -n "$since" ]]; then
    log_range="${since}..HEAD"
  else
    log_range="HEAD"
  fi

  local commits
  commits=$(git log "$log_range" --pretty=format:"%s" 2>/dev/null || echo "")

  if [[ -z "$commits" ]]; then
    echo "none"
    return
  fi

  # Check for breaking changes (MAJOR)
  if echo "$commits" | grep -qE "^.*!:.*$|BREAKING CHANGE:"; then
    echo "major"
    return
  fi

  # Check for features (MINOR)
  if echo "$commits" | grep -qE "^feat(\(.*\))?:"; then
    echo "minor"
    return
  fi

  # Check for fixes or performance improvements (PATCH)
  if echo "$commits" | grep -qE "^(fix|perf)(\(.*\))?:"; then
    echo "patch"
    return
  fi

  # Other commits (chore, docs, ci, style, refactor, test) don't bump version
  echo "none"
}

# Calculate next version
calculate_next_version() {
  local current_tag
  current_tag=$(get_latest_tag)

  if [[ -z "$current_tag" ]]; then
    # No tags exist, start with v0.1.0
    echo "v0.1.0"
    return
  fi

  local bump_type
  bump_type=$(get_bump_type "$current_tag")

  if [[ "$bump_type" == "none" ]]; then
    echo "$current_tag"
    return
  fi

  # Parse current version
  read -r major minor patch <<< "$(parse_version "$current_tag")"

  # Calculate next version
  case "$bump_type" in
    major)
      major=$((major + 1))
      minor=0
      patch=0
      ;;
    minor)
      minor=$((minor + 1))
      patch=0
      ;;
    patch)
      patch=$((patch + 1))
      ;;
  esac

  echo "v${major}.${minor}.${patch}"
}

# Main
main() {
  local mode="${1:-next}"

  case "$mode" in
    --current)
      local current
      current=$(get_latest_tag)
      if [[ -z "$current" ]]; then
        echo "v0.0.0"
      else
        echo "$current"
      fi
      ;;
    --bump)
      local current_tag
      current_tag=$(get_latest_tag)
      get_bump_type "$current_tag"
      ;;
    *)
      calculate_next_version
      ;;
  esac
}

main "$@"
