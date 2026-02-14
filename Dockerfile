# Stage 1: Base
FROM python:3.10-slim-bullseye AS base

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=off \
    PIP_DISABLE_PIP_VERSION_CHECK=on \
    PIP_DEFAULT_TIMEOUT=100

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    pkg-config \
    libhdf5-dev \
    libgl1 \
    libglib2.0-0 \
    libavcodec-dev \
    libavformat-dev \
    libavdevice-dev \
    libavutil-dev \
    libswresample-dev \
    libswscale-dev \
    libavfilter-dev \
    && rm -rf /var/lib/apt/lists/*

# Stage 2: Development
FROM base AS development

COPY requirements.txt .

# Install core build-time dependencies
RUN pip install --no-cache-dir Cython setuptools wheel

# Install all major dependencies from requirements.txt
# Note: py-feat installation might still be tricky, but settle dependencies first
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Stage 3: Production
FROM base AS production

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY src/ ./src/

CMD ["streamlit", "run", "src/ui/app.py"]
