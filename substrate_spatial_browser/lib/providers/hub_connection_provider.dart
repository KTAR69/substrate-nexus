import 'dart:async';
import 'package:flutter/foundation.dart';
import '../models/hub_connection.dart';
import '../services/hub_discovery_service.dart';

class HubConnectionProvider extends ChangeNotifier {
  final HubDiscoveryService _discoveryService = HubDiscoveryService();

  HubConnectionState _state = HubConnectionState.disconnected;
  DiscoveredHub? _discoveredHub;
  ConnectedHub? _connectedHub;
  String? _error;
  StreamSubscription? _discoverySub;

  HubConnectionState get state => _state;
  DiscoveredHub? get discoveredHub => _discoveredHub;
  ConnectedHub? get connectedHub => _connectedHub;
  bool get isHubConnected => _state == HubConnectionState.connected;
  bool get isStandaloneMode => !isHubConnected;
  String? get error => _error;

  void startDiscovery() {
    _setState(HubConnectionState.discovering);
    _discoveryService.startDiscovery();
    _discoverySub = _discoveryService.hubStream.listen((hub) {
      _discoveredHub = hub;
      _setState(HubConnectionState.found);
    });
  }

  /// Called after user scans Hub DID QR code.
  /// [scannedDID] is the did:substrate string from the QR code.
  Future<void> completeTrustHandshake(String scannedDID) async {
    if (_discoveredHub == null) return;
    _setState(HubConnectionState.verifying);

    if (!scannedDID.startsWith('did:substrate:')) {
      _error = 'Invalid Hub DID: must be did:substrate format';
      _setState(HubConnectionState.error);
      return;
    }

    // Trust handshake complete — establish PESO session
    // Phase 6: Full PESO session negotiation with Substrate RPC
    // Phase 5: Optimistic connection after DID format validation
    _connectedHub = ConnectedHub(
      hubDID: scannedDID,
      hostAddress: _discoveredHub!.hostAddress,
      port: _discoveredHub!.port,
      connectedAt: DateTime.now(),
    );
    _setState(HubConnectionState.connected);
  }

  void disconnect() {
    _connectedHub = null;
    _discoveredHub = null;
    _setState(HubConnectionState.disconnected);
    startDiscovery();
  }

  void _setState(HubConnectionState newState) {
    _state = newState;
    notifyListeners();
  }

  @override
  void dispose() {
    _discoverySub?.cancel();
    _discoveryService.stopDiscovery();
    super.dispose();
  }
}
