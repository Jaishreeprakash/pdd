#!/bin/bash
set -e

echo "=== Starting BurnoutAI Backend ==="
echo "Python: $(python --version)"
echo "PORT: $PORT"
echo "DATABASE_URL set: $([ -n "$DATABASE_URL" ] && echo YES || echo NO)"

echo "=== Testing imports ==="
python -c "
import sys
print('sys.path:', sys.path)
try:
    from config import settings
    print('✅ config OK')
    print('DB URL prefix:', settings.DATABASE_URL[:30])
except Exception as e:
    print('❌ config FAILED:', e)
    sys.exit(1)

try:
    from database import Base, engine, get_db
    print('✅ database OK')
except Exception as e:
    print('❌ database FAILED:', e)
    sys.exit(1)

try:
    import main
    print('✅ main import OK')
except Exception as e:
    print('❌ main FAILED:', e)
    import traceback
    traceback.print_exc()
    sys.exit(1)
"

echo "=== Imports OK — starting uvicorn ==="
exec uvicorn main:app --host 0.0.0.0 --port "$PORT"
