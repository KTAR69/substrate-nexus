FROM mcr.microsoft.com/devcontainers/rust:1-1-bullseye

# Install Substrate dependencies
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
    clang \
    libclang-dev \
    protobuf-compiler

# Set Environment Variable for RocksDB/Bindgen
ENV LIBCLANG_PATH=/usr/lib/llvm-11/lib
