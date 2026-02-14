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

RUN pip install --no-cache-dir Cython setuptools wheel

# Install core stack with tight pins
# Use numpy < 1.24 to satisfy nltools
RUN pip install --no-cache-dir \
    "numpy==1.23.5" \
    "pandas>=2.0.0,<2.1.0" \
    "scipy>=1.10.0,<1.11.0" \
    "scikit-learn>=1.2.0,<1.4.0" \
    "h5py>=3.8.0,<3.10.0" \
    "seaborn>=0.12.0" \
    "scikit-image>=0.20.0"

# Install other py-feat dependencies
# Explicitly add xgboost
RUN pip install --no-cache-dir \
    tqdm celluloid easing-functions kornia av xgboost \
    torch torchvision --extra-index-url https://download.pytorch.org/whl/cpu

# Install nltools and py-feat with --no-deps
RUN pip install --no-cache-dir nltools==0.5.1 && \
    pip install --no-cache-dir py-feat==0.6.2 --no-deps

# ENSURE matplotlib is >= 3.8.0 at the end to satisfy nilearn
RUN pip install --no-cache-dir "matplotlib>=3.8.0"

# Now install remaining app dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Stage 3: Production
FROM base AS production

COPY requirements.txt .
RUN pip install --no-cache-dir "numpy==1.23.5" "pandas>=2.0.0,<2.1.0" && \
    pip install --no-cache-dir -r requirements.txt

COPY src/ ./src/

CMD ["streamlit", "run", "src/ui/app.py"]
