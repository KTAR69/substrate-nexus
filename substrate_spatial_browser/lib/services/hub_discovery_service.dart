import 'dart:async';
import 'package:multicast_dns/multicast_dns.dart';
import '../models/hub_connection.dart';

class HubDiscoveryService {
  static const String _serviceType = '_substrate-hub._tcp';
  final MDnsClient _client = MDnsClient();
  StreamController<DiscoveredHub>? _controller;

  Stream<DiscoveredHub> get hubStream =>
      _controller?.stream ?? const Stream.empty();

  Future<void> startDiscovery() async {
    _controller = StreamController<DiscoveredHub>.broadcast();
    await _client.start();

    _client
        .lookup<PtrResourceRecord>(
          ResourceRecordQuery.serverPointer(_serviceType),
        )
        .listen((PtrResourceRecord ptr) async {
      // Resolve the service name to get host and port
      await for (final SrvResourceRecord srv in _client.lookup<SrvResourceRecord>(
        ResourceRecordQuery.service(ptr.domainName),
      )) {
        await for (final IPAddressResourceRecord ip
            in _client.lookup<IPAddressResourceRecord>(
          ResourceRecordQuery.addressIPv4(srv.target),
        )) {
          _controller?.add(DiscoveredHub(
            serviceName: ptr.domainName,
            hostAddress: ip.address.address,
            port: srv.port,
          ));
        }
      }
    });
  }

  void stopDiscovery() {
    _client.stop();
    _controller?.close();
  }
}
