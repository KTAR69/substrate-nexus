#!/bin/bash
sed -i '/<<<<<<< HEAD/d' pallets/depin-desci/src/lib.rs
sed -i '/=======/d' pallets/depin-desci/src/lib.rs
sed -i '/>>>>>>> 873e7c9 (perf(pallet-depin-desci): Optimize AccountIpNfts storage from O(N) to O(1))/d' pallets/depin-desci/src/lib.rs
