enum HubConnectionState {
  disconnected,
  discovering,
  found,
  verifying,
  connected,
  error,
}

class DiscoveredHub {
  final String serviceName;
  final String hostAddress;
  final int port;
  final String? didQRUrl;

  const DiscoveredHub({
    required this.serviceName,
    required this.hostAddress,
    required this.port,
    this.didQRUrl,
  });
}

class ConnectedHub {
  final String hubDID;       // did:substrate:hub-...
  final String hostAddress;
  final int port;
  final DateTime connectedAt;

  const ConnectedHub({
    required this.hubDID,
    required this.hostAddress,
    required this.port,
    required this.connectedAt,
  });

  String get baseUrl => 'http://$hostAddress:$port';
}
