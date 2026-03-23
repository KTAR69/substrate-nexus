import 'package:flutter_test/flutter_test.dart';
import 'package:substrate_spatial_browser/models/hub_connection.dart';

void main() {
  group('ConnectedHub', () {
    test('baseUrl generation is correct', () {
      final hub = ConnectedHub(
        hubDID: 'did:substrate:hub-test',
        hostAddress: '192.168.1.10',
        port: 8080,
        connectedAt: DateTime.now(),
      );

      expect(hub.baseUrl, 'http://192.168.1.10:8080');
    });
  });

  group('DiscoveredHub', () {
    test('initialization works properly', () {
      final hub = DiscoveredHub(
        serviceName: '_substrate-hub._tcp',
        hostAddress: '192.168.1.100',
        port: 9000,
        didQRUrl: 'http://test.com/qr',
      );

      expect(hub.serviceName, '_substrate-hub._tcp');
      expect(hub.hostAddress, '192.168.1.100');
      expect(hub.port, 9000);
      expect(hub.didQRUrl, 'http://test.com/qr');
    });
  });
}
