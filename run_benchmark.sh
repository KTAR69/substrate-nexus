#!/bin/bash
set -e

echo "Running tests to make sure everything passes..."
cargo test -p pallet-depin-desci
