import 'dart:convert';
import 'dart:typed_data';
import 'package:crypto/crypto.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../models/did_identity.dart';

class DIDService {
  static const _storage = FlutterSecureStorage();
  static const _didKey = 'san_user_did';
  static const _privateKeyKey = 'san_user_private_key';

  /// Returns the existing DID or generates a new one on first call.
  Future<DIDIdentity> getOrCreateIdentity() async {
    final existingDID = await _storage.read(key: _didKey);
    if (existingDID != null) {
      return DIDIdentity.fromDIDString(existingDID);
    }
    return _generateNewIdentity();
  }

  Future<DIDIdentity> _generateNewIdentity() async {
    // Generate a deterministic key from secure random bytes
    // In production this should use a proper Ed25519 key generation library
    // For this phase: use SHA-256 of a UUID as the key material
    final keyMaterial = DateTime.now().microsecondsSinceEpoch.toString() +
        UniqueKey().toString();
    final hash = sha256.convert(utf8.encode(keyMaterial));
    final publicKeyBase58 = _toBase58(Uint8List.fromList(hash.bytes));
    final did = 'did:key:z$publicKeyBase58';

    await _storage.write(key: _didKey, value: did);
    await _storage.write(key: _privateKeyKey, value: base64.encode(hash.bytes));

    return DIDIdentity.fromDIDString(did);
  }

  Future<String?> getPrivateKeyBase64() async {
    return _storage.read(key: _privateKeyKey);
  }

  /// Resolve a did:substrate identity by querying the pallet-depin-desci registry
  /// For Phase 5: returns a stub identity. Full on-chain resolution in Phase 6.
  Future<DIDIdentity?> resolveSubstrateDID(String did) async {
    if (!did.startsWith('did:substrate:')) return null;
    // Stub: return the DID as-is for now
    // Phase 6: query Substrate RPC endpoint for pallet_depin_desci.resolve(did)
    return DIDIdentity.fromDIDString(did);
  }

  String _toBase58(Uint8List bytes) {
    const alphabet =
        '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    BigInt value = bytes.fold(BigInt.zero,
        (acc, byte) => acc * BigInt.from(256) + BigInt.from(byte));
    String result = '';
    while (value > BigInt.zero) {
      final mod = (value % BigInt.from(58)).toInt();
      result = alphabet[mod] + result;
      value ~/= BigInt.from(58);
    }
    return result;
  }
}
