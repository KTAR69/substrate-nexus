#![cfg_attr(not(feature = "std"), no_std)]

pub use pallet::*;

extern crate alloc;

#[frame_support::pallet]
pub mod pallet {
	use frame_support::pallet_prelude::*;
	use frame_system::pallet_prelude::*;
    use alloc::vec::Vec;

    // --- DePIN Structs ---
    // Note: Structs are defined for documentation/interface standards but encoded as bytes in extrinsics
    // to avoid DecodeWithMemTracking derive issues in this environment.
    #[derive(Encode, Decode, TypeInfo, MaxEncodedLen, Default, Clone, PartialEq, Eq, Debug)]
    pub struct GeospatialData {
        pub lat: u64,
        pub long: u64,
        pub alt: u64,
    }

    #[derive(Encode, Decode, TypeInfo, MaxEncodedLen, Default, Clone, PartialEq, Eq, Debug)]
    pub struct AtmosphericData {
        pub temp: u32,
        pub humidity: u32,
        pub pressure: u32,
    }

    #[derive(Encode, Decode, TypeInfo, MaxEncodedLen, Default, Clone, PartialEq, Eq, Debug)]
    pub struct TrustHeader {
        pub source_id: u64,
        pub timestamp: u64,
    }

    #[derive(Encode, Decode, TypeInfo, MaxEncodedLen, Default, Clone, PartialEq, Eq, Debug)]
    pub struct SensoryData {
        pub location: GeospatialData,
        pub atmosphere: AtmosphericData,
        pub header: TrustHeader,
    }

    #[derive(Encode, Decode, TypeInfo, MaxEncodedLen, Default, Clone, PartialEq, Eq, Debug)]
    pub struct VConContainer {
        // Removed #[codec(compact)] on BoundedVec to avoid derive issues
        pub parties: BoundedVec<u8, ConstU32<256>>,
        pub dialog_hash: [u8; 32],
        pub analysis_hash: [u8; 32],
        pub attachments_root: [u8; 32],
    }

	#[pallet::pallet]
	pub struct Pallet<T>(_);

	#[pallet::config]
	pub trait Config: frame_system::Config {
		type RuntimeEvent: From<Event<Self>> + IsType<<Self as frame_system::Config>::RuntimeEvent>;
	}

    // --- Storage ---

	#[pallet::storage]
    #[pallet::getter(fn sensory_readings)]
	pub type SensoryReadings<T: Config> = StorageMap<
        _,
        Blake2_128Concat,
        T::AccountId,
        BoundedVec<u8, ConstU32<10240>>,
        ValueQuery
    >;

    #[pallet::storage]
    #[pallet::getter(fn conversational_proofs)]
    pub type ConversationalProofs<T: Config> = StorageMap<
        _,
        Identity,
        [u8; 32], // Hash of the VCon
        (T::AccountId, BlockNumberFor<T>),
        OptionQuery
    >;

    #[pallet::storage]
    #[pallet::getter(fn ip_nft_ownership)]
    pub type IpNftOwnership<T: Config> = StorageMap<
        _,
        Identity,
        [u8; 32], // CID / Data Hash
        T::AccountId,
        OptionQuery
    >;

	#[pallet::event]
	#[pallet::generate_deposit(pub(super) fn deposit_event)]
	pub enum Event<T: Config> {
		SensoryDataSubmitted { who: T::AccountId, data_len: u32 },
        VConProofSubmitted { who: T::AccountId, hash: [u8; 32] },
        ResearchDataAttested { who: T::AccountId, cid: [u8; 32] },
	}

	#[pallet::error]
	pub enum Error<T> {
		DataTooLarge,
        ProofAlreadyExists,
        IpNftAlreadyClaimed,
	}

	#[pallet::call]
	impl<T: Config> Pallet<T> {
		#[pallet::call_index(0)]
		#[pallet::weight(Weight::from_parts(10_000, 0))]
		pub fn submit_sensory_data(
            origin: OriginFor<T>,
            // We take raw bytes to bypass struct trait requirements in the runtime check
            // The sender should encode the SensoryData struct
            data: Vec<u8>
        ) -> DispatchResult {
			let who = ensure_signed(origin)?;

            // Validate length (simple check)
            let bounded: BoundedVec<u8, ConstU32<10240>> = BoundedVec::try_from(data.clone())
                .map_err(|_| Error::<T>::DataTooLarge)?;

            // We could try to decode here to validate, but for now we just store
            // let _decoded: SensoryData = Decode::decode(&mut &data[..]).map_err(|_| DispatchError::Other("Invalid encoding"))?;

            SensoryReadings::<T>::insert(&who, bounded);

			Self::deposit_event(Event::SensoryDataSubmitted { who, data_len: data.len() as u32 });
			Ok(())
		}

        #[pallet::call_index(1)]
        #[pallet::weight(Weight::from_parts(10_000, 0))]
        pub fn submit_vcon_proof(
            origin: OriginFor<T>,
            // We only need the hash for the proof, the vcon container data can be stored off-chain or passed as bytes if needed
            hash: [u8; 32]
        ) -> DispatchResult {
            let who = ensure_signed(origin)?;

            ensure!(!ConversationalProofs::<T>::contains_key(hash), Error::<T>::ProofAlreadyExists);

            let block_number = <frame_system::Pallet<T>>::block_number();
            ConversationalProofs::<T>::insert(hash, (who.clone(), block_number));

            Self::deposit_event(Event::VConProofSubmitted { who, hash });
            Ok(())
        }

        #[pallet::call_index(2)]
        #[pallet::weight(Weight::from_parts(10_000, 0))]
        pub fn attest_research_data(
            origin: OriginFor<T>,
            cid: [u8; 32]
        ) -> DispatchResult {
            let who = ensure_signed(origin)?;

            ensure!(!IpNftOwnership::<T>::contains_key(cid), Error::<T>::IpNftAlreadyClaimed);

            IpNftOwnership::<T>::insert(cid, who.clone());

            Self::deposit_event(Event::ResearchDataAttested { who, cid });
            Ok(())
        }
	}
}
