use crate::{mock::*, Config, Error, Event};
use frame_support::traits::Currency;
use frame_support::{assert_noop, assert_ok, BoundedVec};

#[test]
fn register_consultant_works() {
    new_test_ext().execute_with(|| {
        System::set_block_number(1);
        let _ = Balances::deposit_creating(&1, 100);
        let name = b"Alice".to_vec();
        assert_ok!(Consulting::register_consultant(
            RuntimeOrigin::signed(1),
            name.clone()
        ));

        let expected_name: BoundedVec<u8, <Test as Config>::MaxNameLength> =
            BoundedVec::try_from(name).unwrap();
        assert_eq!(Consulting::consultants(1), expected_name);
        System::assert_last_event(Event::ConsultantRegistered(1).into());
    });
}

#[test]
fn register_consultant_fails_already_registered() {
    new_test_ext().execute_with(|| {
        System::set_block_number(1);
        let _ = Balances::deposit_creating(&1, 100);
        let name = b"Alice".to_vec();
        assert_ok!(Consulting::register_consultant(
            RuntimeOrigin::signed(1),
            name.clone()
        ));
        assert_noop!(
            Consulting::register_consultant(RuntimeOrigin::signed(1), name),
            Error::<Test>::AlreadyRegistered
        );
    });
}

#[test]
fn register_consultant_fails_name_too_long() {
    new_test_ext().execute_with(|| {
        System::set_block_number(1);
        let _ = Balances::deposit_creating(&1, 100);
        let name = vec![0u8; 65]; // MaxNameLength is 64 in mock.rs
        assert_noop!(
            Consulting::register_consultant(RuntimeOrigin::signed(1), name),
            Error::<Test>::NameTooLong
        );
    });
}

#[test]
fn verify_consultant_works() {
    new_test_ext().execute_with(|| {
        System::set_block_number(1);
        let _ = Balances::deposit_creating(&1, 100);
        let name = b"Alice".to_vec();
        assert_ok!(Consulting::register_consultant(
            RuntimeOrigin::signed(1),
            name
        ));

        // Verifier is 1 in mock, but register uses 1, so let's use another account for verifier if needed.
        // Wait, mock.rs says: type VerifierOrigin = frame_system::EnsureSigned<u64>;
        // But doesn't enforce WHICH signed account.
        // Ah, in lib.rs: `type VerifierOrigin: EnsureOrigin<Self::RuntimeOrigin>;`
        // In mock.rs: `type VerifierOrigin = frame_system::EnsureSigned<u64>;`
        // This generic `EnsureSigned` allows ANY signed origin.
        // Usually we want `EnsureSignedBy<StartProvider, ...>`.
        // For now, any signed origin will pass `ensure_origin`.
        // Let's verify this behavior.

        assert_ok!(Consulting::verify_consultant(RuntimeOrigin::signed(2), 1));
        assert!(Consulting::verified_consultants(1));
        System::assert_last_event(Event::ConsultantVerified(1).into());
    });
}

#[test]
fn verify_consultant_fails_not_registered() {
    new_test_ext().execute_with(|| {
        System::set_block_number(1);
        assert_noop!(
            Consulting::verify_consultant(RuntimeOrigin::signed(2), 1),
            Error::<Test>::NotRegistered
        );
    });
}

#[test]
fn verify_consultant_fails_already_verified() {
    new_test_ext().execute_with(|| {
        System::set_block_number(1);
        let _ = Balances::deposit_creating(&1, 100);
        let name = b"Alice".to_vec();
        assert_ok!(Consulting::register_consultant(
            RuntimeOrigin::signed(1),
            name
        ));
        assert_ok!(Consulting::verify_consultant(RuntimeOrigin::signed(2), 1));

        assert_noop!(
            Consulting::verify_consultant(RuntimeOrigin::signed(2), 1),
            Error::<Test>::AlreadyVerified
        );
    });
}
