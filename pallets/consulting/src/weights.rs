#![allow(unused_parens)]
#![allow(unused_imports)]
#![allow(clippy::unnecessary_cast)]

use frame_support::{traits::Get, weights::{Weight, constants::RocksDbWeight}};
use sp_std::marker::PhantomData;

pub trait WeightInfo {
	fn register_consultant() -> Weight;
	fn verify_consultant() -> Weight;
}

pub struct SubstrateWeight<T>(PhantomData<T>);
impl<T: frame_system::Config> WeightInfo for SubstrateWeight<T> {
	fn register_consultant() -> Weight {
		Weight::from_parts(10_000, 0)
			.saturating_add(T::DbWeight::get().reads(1u64))
			.saturating_add(T::DbWeight::get().writes(1u64))
	}
	fn verify_consultant() -> Weight {
		Weight::from_parts(10_000, 0)
			.saturating_add(T::DbWeight::get().reads(2u64))
			.saturating_add(T::DbWeight::get().writes(1u64))
	}
}

impl WeightInfo for () {
	fn register_consultant() -> Weight {
		Weight::from_parts(10_000, 0)
	}
	fn verify_consultant() -> Weight {
		Weight::from_parts(10_000, 0)
	}
}
