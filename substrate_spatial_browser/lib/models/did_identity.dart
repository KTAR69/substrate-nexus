class DIDIdentity {
  final String did;
  final String didMethod;   // 'key' | 'substrate'
  final String? publicKey;
  final String? substrateAddress;

  const DIDIdentity({
    required this.did,
    required this.didMethod,
    this.publicKey,
    this.substrateAddress,
  });

  bool get isKeyDID => didMethod == 'key';
  bool get isSubstrateDID => didMethod == 'substrate';

  factory DIDIdentity.fromDIDString(String did) {
    if (did.startsWith('did:key:')) {
      return DIDIdentity(
        did: did,
        didMethod: 'key',
        publicKey: did.replaceFirst('did:key:', ''),
      );
    } else if (did.startsWith('did:substrate:')) {
      return DIDIdentity(
        did: did,
        didMethod: 'substrate',
        substrateAddress: did.replaceFirst('did:substrate:', ''),
      );
    }
    throw FormatException('Unsupported DID method: $did');
  }

  @override
  String toString() => did;
}
