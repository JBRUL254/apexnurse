#!/usr/bin/env bash
set -o errexit  # exit on error

echo "🚀 Starting ApexNurse backend..."
uvicorn app.main:app --host 0.0.0.0 --port $PORT
