use crate::{mock::*, Error, Event, SensoryReadings, ConversationalProofs, AccountVCons, IpNftOwnership, AccountIpNfts, GeospatialData, AtmosphericData, TrustHeader};
use frame_support::{assert_noop, assert_ok, BoundedVec};

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

		let readings = SensoryReadings::<Test>::get(1);
		assert_eq!(readings.len(), 1);
		assert_eq!(readings[0].0, GeospatialData { lat, long, alt });
		assert_eq!(readings[0].1, AtmosphericData { temp, humidity, pressure });

		assert_eq!(readings[0].2, TrustHeader { source: 1, signature: bounded_sig, timestamp });

		System::assert_last_event(Event::SensoryDataSubmitted { who: 1 }.into());
	});
}

#[test]
fn submit_vcon_proof_works() {
    new_test_ext().execute_with(|| {
        System::set_block_number(1);
        let hash = frame_system::Pallet::<Test>::parent_hash(); // Just use parent hash as a dummy hash

        assert_ok!(DepinDesci::submit_vcon_proof(RuntimeOrigin::signed(1), hash));

        assert!(ConversationalProofs::<Test>::contains_key(hash));
        let proofs = AccountVCons::<Test>::get(1);
        assert_eq!(proofs.len(), 1);
        assert_eq!(proofs[0], hash);

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
fn attest_research_data_works() {
    new_test_ext().execute_with(|| {
        System::set_block_number(1);
        let cid = frame_system::Pallet::<Test>::parent_hash();

        assert_ok!(DepinDesci::attest_research_data(RuntimeOrigin::signed(1), cid));

        assert!(IpNftOwnership::<Test>::contains_key(cid));
        let nfts = AccountIpNfts::<Test>::get(1);
        assert_eq!(nfts.len(), 1);
        assert_eq!(nfts[0], cid);

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
