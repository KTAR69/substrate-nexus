#![cfg_attr(not(feature = "std"), no_std)]

pub use pallet::*;

pub mod weights;

#[cfg(feature = "runtime-benchmarks")]
mod benchmarking;

#[cfg(test)]
mod mock;
#[cfg(test)]
mod tests;

#[frame_support::pallet]
pub mod pallet {
    use crate::weights::WeightInfo;
    use frame_support::pallet_prelude::*;
    use frame_support::traits::{Currency, EnsureOrigin, ReservableCurrency};
    use frame_system::pallet_prelude::*;
    use sp_std::vec::Vec;

    #[pallet::pallet]
    pub struct Pallet<T>(_);

    #[pallet::config]
    pub trait Config: frame_system::Config {
        type RuntimeEvent: From<Event<Self>> + IsType<<Self as frame_system::Config>::RuntimeEvent>;

        /// The maximum length of a consultant's name.
        #[pallet::constant]
        type MaxNameLength: Get<u32>;

        /// The deposit required to register as a consultant.
        #[pallet::constant]
        type RegistrationDeposit: Get<BalanceOf<Self>>;

        /// The currency trait for handling deposits.
        type Currency: ReservableCurrency<Self::AccountId>;

        /// Origin check for registration. Allows XCM or other origins to be configured.
        type RegistrationOrigin: EnsureOrigin<Self::RuntimeOrigin, Success = Self::AccountId>;

        /// Origin check for the AI Gatekeeper / Verifier.
        type VerifierOrigin: EnsureOrigin<Self::RuntimeOrigin>;

        /// Type representing the weight of this pallet
        type WeightInfo: WeightInfo;
    }

    pub type BalanceOf<T> =
        <<T as Config>::Currency as Currency<<T as frame_system::Config>::AccountId>>::Balance;

    #[pallet::storage]
    #[pallet::getter(fn consultants)]
    pub type Consultants<T: Config> =
        StorageMap<_, Blake2_128Concat, T::AccountId, BoundedVec<u8, T::MaxNameLength>, ValueQuery>;

    #[pallet::storage]
    #[pallet::getter(fn verified_consultants)]
    pub type VerifiedConsultants<T: Config> =
        StorageMap<_, Blake2_128Concat, T::AccountId, bool, ValueQuery>;

    #[pallet::event]
    #[pallet::generate_deposit(pub(super) fn deposit_event)]
    pub enum Event<T: Config> {
        ConsultantRegistered(T::AccountId),
        ConsultantVerified(T::AccountId),
    }

    #[pallet::error]
    pub enum Error<T> {
        AlreadyRegistered,
        NameTooLong,
        NotRegistered,
        AlreadyVerified,
    }

    #[pallet::call]
    impl<T: Config> Pallet<T> {
        #[pallet::call_index(0)]
        #[pallet::weight(T::WeightInfo::register_consultant())]
        pub fn register_consultant(origin: OriginFor<T>, name: Vec<u8>) -> DispatchResult {
            // Check that the extrinsic origin is allowed (Signed, XCM, etc.)
            let who = T::RegistrationOrigin::ensure_origin(origin)?;

            if Consultants::<T>::contains_key(&who) {
                return Err(Error::<T>::AlreadyRegistered.into());
            }

            // Convert Vec to BoundedVec
            let bounded_name: BoundedVec<u8, T::MaxNameLength> =
                name.try_into().map_err(|_| Error::<T>::NameTooLong)?;

            // Reserve the deposit
            let deposit = T::RegistrationDeposit::get();
            T::Currency::reserve(&who, deposit)?;

            Consultants::<T>::insert(&who, bounded_name);

            Self::deposit_event(Event::ConsultantRegistered(who));
            Ok(())
        }

        #[pallet::call_index(1)]
        #[pallet::weight(T::WeightInfo::verify_consultant())]
        pub fn verify_consultant(origin: OriginFor<T>, consultant: T::AccountId) -> DispatchResult {
            // Only the authorized verifier (AI Gatekeeper) can call this
            T::VerifierOrigin::ensure_origin(origin)?;

            if !Consultants::<T>::contains_key(&consultant) {
                return Err(Error::<T>::NotRegistered.into());
            }

            if VerifiedConsultants::<T>::get(&consultant) {
                return Err(Error::<T>::AlreadyVerified.into());
            }

            VerifiedConsultants::<T>::insert(&consultant, true);

            Self::deposit_event(Event::ConsultantVerified(consultant));
            Ok(())
        }
    }
}
