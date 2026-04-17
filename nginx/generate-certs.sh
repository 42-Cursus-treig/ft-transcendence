#!/bin/sh
set -e

CERT_DIR="/etc/nginx/certs"
CERT_FILE="$CERT_DIR/selfsigned.crt"
KEY_FILE="$CERT_DIR/selfsigned.key"

if [ ! -f "$CERT_FILE" ] || [ ! -f "$KEY_FILE" ]; then
    echo "[nginx] No TLS certificates found, generating self-signed pair..."
    mkdir -p "$CERT_DIR"
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout "$KEY_FILE" \
        -out "$CERT_FILE" \
        -subj "/C=FR/ST=Occitanie/L=Montpellier/O=42/OU=ft_transcendence/CN=localhost" \
        2>/dev/null
    echo "[nginx] Certificates generated."
else
    echo "[nginx] Using existing TLS certificates."
fi

exec nginx -g "daemon off;"