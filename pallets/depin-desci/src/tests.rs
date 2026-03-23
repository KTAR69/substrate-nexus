use crate::{mock::*, Error, Event, SensoryReadings, ConversationalProofs, AccountVCons, IpNftOwnership, AccountIpNfts, GeospatialData, AtmosphericData, TrustHeader};
use frame_support::{assert_noop, assert_ok, BoundedVec};

#[test]
fn get_node_state_works() {
	new_test_ext().execute_with(|| {
		System::set_block_number(1);
        let account = 1;

		// 1. Submit Sensory Data
		let lat = 100;
		let long = 200;
		let alt = 50;
		let temp = 2500;
		let humidity = 60;
		let pressure = 101325;
		let signature = vec![1, 2, 3];
        let bounded_sig: BoundedVec<u8, frame_support::traits::ConstU32<65>> = signature.try_into().unwrap();
		let timestamp = 123456789;

		assert_ok!(DepinDesci::submit_sensory_data(RuntimeOrigin::signed(account), lat, long, alt, temp, humidity, pressure, bounded_sig.clone(), timestamp));

        // 2. Submit vCon Proof
        let vcon_hash = frame_system::Pallet::<Test>::parent_hash(); // Just use parent hash as a dummy hash
        assert_ok!(DepinDesci::submit_vcon_proof(RuntimeOrigin::signed(account), vcon_hash));

        // 3. Attest Research Data
        // Create a different hash for cid to avoid collision with vcon_hash if needed, though they are in different storages.
        let cid = Default::default(); // Using default hash
        assert_ok!(DepinDesci::attest_research_data(RuntimeOrigin::signed(account), cid));

        // 4. Get Node State
        let node_state = DepinDesci::get_node_state(account);

        // 5. Assertions
        assert_eq!(node_state.sensory_data.len(), 1);
        assert_eq!(node_state.sensory_data[0].0, GeospatialData { lat, long, alt });
        assert_eq!(node_state.sensory_data[0].1, AtmosphericData { temp, humidity, pressure });
        assert_eq!(node_state.sensory_data[0].2, TrustHeader { source: account, signature: bounded_sig, timestamp });

        assert_eq!(node_state.conversational_proofs.len(), 1);
        assert_eq!(node_state.conversational_proofs[0], vcon_hash);

        assert_eq!(node_state.ip_nfts.len(), 1);
        assert_eq!(node_state.ip_nfts[0], cid);
	});
}

#[test]
fn submit_sensory_data_works() {
	new_test_ext().execute_with(|| {
		// Go past genesis block so events get deposited
		System::set_block_number(1);

		let lat = 100;
		let long = 200;
		let alt = 50;
		let temp = 2500;
		let humidity = 60;
		let pressure = 101325;
		let signature = vec![1, 2, 3];
        let bounded_sig: BoundedVec<u8, frame_support::traits::ConstU32<65>> = signature.try_into().unwrap();
		let timestamp = 123456789;

		assert_ok!(DepinDesci::submit_sensory_data(RuntimeOrigin::signed(1), lat, long, alt, temp, humidity, pressure, bounded_sig.clone(), timestamp));

		let count = crate::SensoryReadingsCount::<Test>::get(1);
		assert_eq!(count, 1);
		let reading = SensoryReadings::<Test>::get(1, 0).unwrap();
		assert_eq!(reading.0, GeospatialData { lat, long, alt });
		assert_eq!(reading.1, AtmosphericData { temp, humidity, pressure });
		assert_eq!(reading.2, TrustHeader { source: 1, signature: bounded_sig, timestamp });

		System::assert_last_event(Event::SensoryDataSubmitted { who: 1 }.into());
	});
}

#[test]
fn submit_sensory_data_overflow_fails() {
	new_test_ext().execute_with(|| {
		System::set_block_number(1);

		let lat = 100;
		let long = 200;
		let alt = 50;
		let temp = 2500;
		let humidity = 60;
		let pressure = 101325;
		let signature = vec![1, 2, 3];
		let bounded_sig: BoundedVec<u8, frame_support::traits::ConstU32<65>> = signature.try_into().unwrap();
		let timestamp = 123456789;

		// Insert 100 readings
		for _ in 0..100 {
			assert_ok!(DepinDesci::submit_sensory_data(RuntimeOrigin::signed(1), lat, long, alt, temp, humidity, pressure, bounded_sig.clone(), timestamp));
		}

		// The 101st reading should fail with StorageOverflow
		assert_noop!(
			DepinDesci::submit_sensory_data(RuntimeOrigin::signed(1), lat, long, alt, temp, humidity, pressure, bounded_sig.clone(), timestamp),
			Error::<Test>::StorageOverflow
		);
	});
}

#[test]
fn submit_vcon_proof_works() {
    new_test_ext().execute_with(|| {
        System::set_block_number(1);
        let hash = frame_system::Pallet::<Test>::parent_hash(); // Just use parent hash as a dummy hash

        assert_ok!(DepinDesci::submit_vcon_proof(RuntimeOrigin::signed(1), hash));

        assert!(ConversationalProofs::<Test>::contains_key(hash));
        let count = crate::AccountVConsCount::<Test>::get(1);
        assert_eq!(count, 1);
        let proof = AccountVCons::<Test>::get(1, 0).unwrap();
        assert_eq!(proof, hash);

        System::assert_last_event(Event::VConProofSubmitted { who: 1, hash }.into());
    });
}

#[test]
fn submit_duplicate_vcon_proof_fails() {
    new_test_ext().execute_with(|| {
        System::set_block_number(1);
        let hash = frame_system::Pallet::<Test>::parent_hash();

        assert_ok!(DepinDesci::submit_vcon_proof(RuntimeOrigin::signed(1), hash));
        assert_noop!(
            DepinDesci::submit_vcon_proof(RuntimeOrigin::signed(1), hash),
            Error::<Test>::VConAlreadyExists
        );
    });
}

#[test]
fn submit_vcon_proof_storage_overflow_fails() {
    new_test_ext().execute_with(|| {
        System::set_block_number(1);

        // Insert 100 unique hashes to reach max capacity (ConstU32<100>)
        for i in 0..100 {
            let hash = sp_core::H256::from_low_u64_be(i as u64);
            assert_ok!(DepinDesci::submit_vcon_proof(RuntimeOrigin::signed(1), hash));
        }

        // The 101st insertion should fail due to storage overflow
        let overflow_hash = sp_core::H256::from_low_u64_be(100);
        assert_noop!(
            DepinDesci::submit_vcon_proof(RuntimeOrigin::signed(1), overflow_hash),
            Error::<Test>::StorageOverflow
        );
    });
}

#[test]
fn attest_research_data_works() {
    new_test_ext().execute_with(|| {
        System::set_block_number(1);
        let cid = frame_system::Pallet::<Test>::parent_hash();

        assert_ok!(DepinDesci::attest_research_data(RuntimeOrigin::signed(1), cid));

        assert!(IpNftOwnership::<Test>::contains_key(cid));
        let count = crate::AccountIpNftsCount::<Test>::get(1);
        assert_eq!(count, 1);
        let nft = AccountIpNfts::<Test>::get(1, 0).unwrap();
        assert_eq!(nft, cid);

        System::assert_last_event(Event::ResearchAttested { who: 1, cid }.into());
    });
}

#[test]
fn attest_duplicate_research_data_fails() {
    new_test_ext().execute_with(|| {
        System::set_block_number(1);
        let cid = frame_system::Pallet::<Test>::parent_hash();

        assert_ok!(DepinDesci::attest_research_data(RuntimeOrigin::signed(1), cid));
        assert_noop!(
            DepinDesci::attest_research_data(RuntimeOrigin::signed(1), cid),
            Error::<Test>::IpNftAlreadyExists
        );
    });
}

#[test]
fn attest_research_data_storage_overflow_fails() {
    new_test_ext().execute_with(|| {
        System::set_block_number(1);

        // Fill up to max capacity (100 is ConstU32<100> in the pallet)
        for i in 0..100 {
            let mut cid = [0u8; 32];
            cid[0] = i as u8;
            let hash = sp_core::H256::from(cid);
            assert_ok!(DepinDesci::attest_research_data(RuntimeOrigin::signed(1), hash.into()));
        }

        // Try to add one more to trigger overflow
        let mut cid_overflow = [0u8; 32];
        cid_overflow[0] = 101;
        let hash_overflow = sp_core::H256::from(cid_overflow);

        assert_noop!(
            DepinDesci::attest_research_data(RuntimeOrigin::signed(1), hash_overflow.into()),
            Error::<Test>::StorageOverflow
        );
    });
}

#[test]
fn get_node_state_empty_works() {
	new_test_ext().execute_with(|| {
		System::set_block_number(1);
        let account = 1;

        // Get Node State for unused account
        let node_state = DepinDesci::get_node_state(account);

        // Assertions for empty state
        assert_eq!(node_state.sensory_data.len(), 0);
        assert_eq!(node_state.conversational_proofs.len(), 0);
        assert_eq!(node_state.ip_nfts.len(), 0);
	});
}
