FROM python:3.11-slim AS base

WORKDIR /app

# OpenCV のシステム依存ライブラリ (Debian Bookworm/Trixie 対応)
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# -----------------
# Development Stage -> Used for CI testing and local development
# -----------------
FROM base AS development

COPY pyproject.toml .
RUN pip install --no-cache-dir -e ".[dev]"

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

# -----------------
# Production Stage -> Final optimized image without dev dependencies
# -----------------
FROM base AS production

COPY pyproject.toml .
RUN pip install --no-cache-dir .

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
