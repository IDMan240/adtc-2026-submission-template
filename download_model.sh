#!/bin/bash

# Download your model weight file.
#
# Rules:
# - Must be idempotent (safe to run multiple times).
# - Must download without any credentials (public URL only).
# - The output path must match `runtime.model_path` in metadata.json.

set -eou pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MODEL_DIR="$HERE/model"
MODEL_FILE="$MODEL_DIR/SmolLM2-135M-Instruct-Q4_K_M.gguf"

# The official public Hugging Face URL for your chosen model
MODEL_URL="https://huggingface.co/bartowski/SmolLM2-135M-Instruct-GGUF/resolve/main/SmolLM2-135M-Instruct-Q4_K_M.gguf"

mkdir -p "$MODEL_DIR"

if [ -f "$MODEL_FILE" ]; then
    echo "Model already present at $MODEL_FILE - skipping download."
    exit 0
fi

echo "Downloading $MODEL_URL -> $MODEL_FILE (~80 MB)..."

if command -v curl > /dev/null 2>&1; then
    curl -L --fail --progress-bar -o "$MODEL_FILE.partial" "$MODEL_URL"
elif command -v wget > /dev/null 2>&1; then
    wget --show-progress -O "$MODEL_FILE.partial" "$MODEL_URL"
else
    echo "Error: neither curl nor wget found" >&2
    exit 1
fi

mv "$MODEL_FILE.partial" "$MODEL_FILE"
echo "Download complete!"
