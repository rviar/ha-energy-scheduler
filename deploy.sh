#!/usr/bin/env bash
set -euo pipefail

# === Configuration ===
# All connection settings come from environment variables. Set them in your
# shell profile, a .env file you source, or pass them inline:
#   HA_HOST=192.168.x.x HA_USER=ssh_user ./deploy.sh
#
# Required:
#   HA_HOST  — Home Assistant host or IP
#   HA_USER  — SSH user with write access to /config/custom_components
# Optional:
#   HA_PORT  — SSH port (default: 22)
#   HA_TOKEN — Long-Lived Access Token for restart action
#              (Profile -> Long-Lived Access Tokens)
HA_HOST="${HA_HOST:-}"
HA_PORT="${HA_PORT:-22}"
HA_USER="${HA_USER:-}"
HA_TOKEN="${HA_TOKEN:-}"

COMPONENT="hacs_energy_scheduler"
LOCAL_PATH="custom_components/${COMPONENT}/"
REMOTE_PATH="/config/custom_components/${COMPONENT}/"
HA_URL="http://${HA_HOST}:8123"

if [[ -z "${HA_HOST}" || -z "${HA_USER}" ]]; then
    echo "ERROR: HA_HOST and HA_USER environment variables must be set." >&2
    echo "Example: HA_HOST=192.168.1.10 HA_USER=ssh_user ./deploy.sh" >&2
    exit 1
fi

# === Colors ===
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

info()  { echo -e "${GREEN}[+]${NC} $*"; }
warn()  { echo -e "${YELLOW}[!]${NC} $*"; }
error() { echo -e "${RED}[x]${NC} $*"; exit 1; }

# === Deploy ===
deploy() {
    info "Syncing ${COMPONENT} -> ${HA_HOST}..."

    rsync -rlvz --delete \
        --no-times --no-perms --omit-dir-times \
        --exclude='__pycache__' \
        --exclude='*.pyc' \
        --exclude='.DS_Store' \
        --rsync-path="sudo rsync" \
        -e "ssh -p ${HA_PORT}" \
        "${LOCAL_PATH}" \
        "${HA_USER}@${HA_HOST}:${REMOTE_PATH}"

    info "Files synced successfully."
}

# === Restart ===
restart() {
    if [[ -z "${HA_TOKEN}" ]]; then
        warn "HA_TOKEN not set — skipping restart."
        warn "Create token: HA Profile -> Long-Lived Access Tokens"
        warn "Then: export HA_TOKEN='your_token_here'"
        return
    fi

    info "Restarting Home Assistant..."
    response=$(curl -s -o /dev/null -w "%{http_code}" \
        -X POST "${HA_URL}/api/services/homeassistant/restart" \
        -H "Authorization: Bearer ${HA_TOKEN}" \
        -H "Content-Type: application/json")

    if [[ "${response}" == "200" ]]; then
        info "Restart triggered. HA will be back in ~1-2 min."
    else
        error "Restart failed (HTTP ${response}). Check your token."
    fi
}

# === Main ===
case "${1:-deploy}" in
    deploy)
        deploy
        ;;
    restart)
        restart
        ;;
    all)
        deploy
        restart
        ;;
    watch)
        info "Watching for changes (Ctrl+C to stop)..."
        if ! command -v fswatch &>/dev/null; then
            error "fswatch not installed. Run: brew install fswatch"
        fi
        deploy
        fswatch -o "${LOCAL_PATH}" | while read -r; do
            info "Change detected, syncing..."
            deploy
        done
        ;;
    *)
        echo "Usage: $0 {deploy|restart|all|watch}"
        echo ""
        echo "  deploy   - Sync files to HA (default)"
        echo "  restart  - Restart Home Assistant"
        echo "  all      - Sync + restart"
        echo "  watch    - Auto-sync on file changes"
        exit 1
        ;;
esac
