import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import '../providers/hub_connection_provider.dart';
import '../models/hub_connection.dart';

class HubConnectionScreen extends StatefulWidget {
  const HubConnectionScreen({super.key});

  @override
  State<HubConnectionScreen> createState() => _HubConnectionScreenState();
}

class _HubConnectionScreenState extends State<HubConnectionScreen> {
  bool _isScanning = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Theme.of(context).colorScheme.surface,
      appBar: AppBar(
        title: const Text(
          'HUB CONNECTION',
          style: TextStyle(fontSize: 13, letterSpacing: 2.0),
        ),
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: Consumer<HubConnectionProvider>(
        builder: (context, provider, _) {
          if (provider.isHubConnected) {
            return _buildConnectedState(provider);
          }
          if (_isScanning) {
            return _buildScannerState(provider);
          }
          return _buildDiscoveryState(provider);
        },
      ),
    );
  }

  Widget _buildConnectedState(HubConnectionProvider provider) {
    final hub = provider.connectedHub!;
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.hub, size: 80, color: Color(0xFF76FF03)),
            const SizedBox(height: 24),
            const Text(
              'HUB CONNECTED',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: Color(0xFF76FF03),
                letterSpacing: 2.0,
              ),
            ),
            const SizedBox(height: 16),
            const Text('DID:', style: TextStyle(color: Colors.grey)),
            Text(
              hub.hubDID,
              style: const TextStyle(fontSize: 16, color: Colors.white),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            const Text('Host:', style: TextStyle(color: Colors.grey)),
            Text(
              '${hub.hostAddress}:${hub.port}',
              style: const TextStyle(fontSize: 16, color: Colors.white),
            ),
            const SizedBox(height: 48),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.red.withOpacity(0.2),
                foregroundColor: Colors.red,
                side: const BorderSide(color: Colors.red),
                padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
              ),
              onPressed: () => provider.disconnect(),
              child: const Text('DISCONNECT'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDiscoveryState(HubConnectionProvider provider) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.radar, size: 80, color: Colors.amber),
            const SizedBox(height: 24),
            const Text(
              'DISCOVERING HUBS',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: Colors.amber,
                letterSpacing: 2.0,
              ),
            ),
            const SizedBox(height: 16),
            const CircularProgressIndicator(color: Colors.amber),
            const SizedBox(height: 48),
            if (provider.discoveredHub != null)
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  border: Border.all(color: Colors.amber),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Column(
                  children: [
                    const Text(
                      'FOUND HUB',
                      style: TextStyle(
                        color: Colors.amber,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(provider.discoveredHub!.serviceName),
                    Text('${provider.discoveredHub!.hostAddress}:${provider.discoveredHub!.port}'),
                    const SizedBox(height: 16),
                    ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.amber.withOpacity(0.2),
                        foregroundColor: Colors.amber,
                        side: const BorderSide(color: Colors.amber),
                      ),
                      onPressed: () {
                        setState(() => _isScanning = true);
                      },
                      child: const Text('SCAN DID QR CODE'),
                    ),
                  ],
                ),
              )
            else
              const Text(
                'Scanning mDNS for _substrate-hub._tcp services...',
                style: TextStyle(color: Colors.grey),
                textAlign: TextAlign.center,
              ),
            if (provider.error != null)
              Padding(
                padding: const EdgeInsets.only(top: 24.0),
                child: Text(
                  'Error: ${provider.error}',
                  style: const TextStyle(color: Colors.red),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildScannerState(HubConnectionProvider provider) {
    return Stack(
      children: [
        MobileScanner(
          onDetect: (capture) {
            final List<Barcode> barcodes = capture.barcodes;
            for (final barcode in barcodes) {
              if (barcode.rawValue != null) {
                provider.completeTrustHandshake(barcode.rawValue!);
                setState(() => _isScanning = false);
                break;
              }
            }
          },
        ),
        Positioned(
          bottom: 48,
          left: 0,
          right: 0,
          child: Center(
            child: ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.black54,
                foregroundColor: Colors.white,
              ),
              onPressed: () => setState(() => _isScanning = false),
              child: const Text('CANCEL SCAN'),
            ),
          ),
        ),
      ],
    );
  }
}
