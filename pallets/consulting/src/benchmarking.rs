use super::*;

#[allow(unused)]
use crate::Pallet as Consulting;
use frame_benchmarking::v2::*;
use frame_system::RawOrigin;
use frame_support::traits::{Get, Currency};

#[benchmarks]
mod benchmarks {
	use super::*;

	#[benchmark]
	fn register_consultant() {
		let caller: T::AccountId = whitelisted_caller();
		let deposit = T::RegistrationDeposit::get();
		let _ = T::Currency::make_free_balance_be(&caller, deposit * 100u32.into());
		let name = vec![0u8; T::MaxNameLength::get() as usize];

		#[extrinsic_call]
		register_consultant(RawOrigin::Signed(caller.clone()), name);

		assert!(Consultants::<T>::contains_key(&caller));
	}

	#[benchmark]
	fn verify_consultant() {
		let consultant: T::AccountId = account("consultant", 0, 0);
		let deposit = T::RegistrationDeposit::get();
		let _ = T::Currency::make_free_balance_be(&consultant, deposit * 100u32.into());

		let name = vec![0u8; T::MaxNameLength::get() as usize];
		Consulting::<T>::register_consultant(RawOrigin::Signed(consultant.clone()).into(), name).unwrap();
		
		let verifier: T::AccountId = whitelisted_caller();

		#[extrinsic_call]
		verify_consultant(RawOrigin::Signed(verifier), consultant.clone());

		assert!(VerifiedConsultants::<T>::get(&consultant));
	}

	impl_benchmark_test_suite!(Consulting, crate::mock::new_test_ext(), crate::mock::Test);
}
