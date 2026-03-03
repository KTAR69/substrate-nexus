with open("pallets/depin-desci/src/lib.rs", "r") as f:
    content = f.read()

content = content.replace("use frame_system::pallet_prelude::*;", "use frame_system::pallet_prelude::*;\n\tuse sp_std::vec::Vec;")

with open("pallets/depin-desci/src/lib.rs", "w") as f:
    f.write(content)
