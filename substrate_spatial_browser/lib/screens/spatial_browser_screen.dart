import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:permission_handler/permission_handler.dart';
import '../models/spatial_synapse.dart';
import '../services/spatial_query_service.dart';
import '../widgets/synapse_card_widget.dart';

class SpatialBrowserScreen extends StatefulWidget {
  const SpatialBrowserScreen({super.key});

  @override
  State<SpatialBrowserScreen> createState() => _SpatialBrowserScreenState();
}

class _SpatialBrowserScreenState extends State<SpatialBrowserScreen> {
  final SpatialQueryService _queryService = SpatialQueryService(
    atlasDataApiBaseUrl: 'https://eu-central-1.aws.data.mongodb-api.com/app/data-mqqxevl/endpoint/data/v1',
    atlasApiKey: 'YOUR_ATLAS_API_KEY', // TODO: Load from secure storage or env
  );

  bool _isLoading = true;
  String? _error;
  Position? _currentPosition;
  List<SpatialSynapse> _synapses = [];

  @override
  void initState() {
    super.initState();
    _initSpatialQuery();
  }

  Future<void> _initSpatialQuery() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final status = await Permission.locationWhenInUse.request();
      if (status.isDenied) {
        setState(() {
          _error = 'Location permission is required to query nearby Synapses.';
          _isLoading = false;
        });
        return;
      }

      final position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );

      setState(() {
        _currentPosition = position;
      });

      // Stub for Phase 5 if MongoDB Atlas API key is not configured yet
      // In a real app, this would use the real SpatialQueryService
      await Future.delayed(const Duration(seconds: 1)); // Simulate network request

      // Mock Data for Phase 5 development to verify UI
      final mockSynapses = [
        SpatialSynapse(
          uuid: 'mock-uuid-1',
          subject: 'SDV_SUMMON_COMMAND',
          createdAt: DateTime.now().toIso8601String(),
          spatialAnchor: SpatialAnchor(
            vpsProvider: 'multiset_ai',
            anchorId: 'mock-anchor-1',
            coordinates: SpatialCoordinates(
              lat: position.latitude + 0.001,
              lng: position.longitude + 0.001,
              alt: position.altitude,
              accuracyM: 0.05,
            ),
            environmentType: 'outdoor',
            emitterDID: 'did:substrate:sdv-eclipse-001',
          ),
          efficacyScore: 0.94,
          patternTags: ['summon_success', 'high_priority', 'grid_a7'],
          emitterDID: 'did:substrate:sdv-eclipse-001',
        ),
      ];

      setState(() {
        _synapses = mockSynapses;
        _isLoading = false;
      });

      /* Real implementation:
      final synapses = await _queryService.queryNearbySynapses(
        lat: position.latitude,
        lng: position.longitude,
      );
      setState(() {
        _synapses = synapses;
        _isLoading = false;
      });
      */
    } catch (e) {
      setState(() {
        _error = 'Error querying synapses: $e';
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Theme.of(context).colorScheme.surface,
      appBar: AppBar(
        title: const Text(
          'SPATIAL SYNAPSE BROWSER',
          style: TextStyle(fontSize: 13, letterSpacing: 2.0),
        ),
        backgroundColor: Colors.transparent,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _initSpatialQuery,
          ),
        ],
      ),
      body: _buildBody(),
    );
  }

  Widget _buildBody() {
    if (_isLoading) {
      return const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            CircularProgressIndicator(color: Color(0xFF00E5FF)),
            SizedBox(height: 16),
            Text(
              'SCANNING LOCAL COORDINATES...',
              style: TextStyle(
                color: Color(0xFF00E5FF),
                letterSpacing: 2.0,
                fontSize: 12,
              ),
            ),
          ],
        ),
      );
    }

    if (_error != null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, color: Colors.red, size: 64),
              const SizedBox(height: 16),
              Text(
                'SPATIAL QUERY FAILED',
                style: const TextStyle(
                  color: Colors.red,
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 2.0,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                _error!,
                style: const TextStyle(color: Colors.white70),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF1E1E1E),
                  foregroundColor: const Color(0xFF00E5FF),
                  side: const BorderSide(color: Color(0xFF00E5FF)),
                ),
                onPressed: _initSpatialQuery,
                child: const Text('RETRY SCAN'),
              ),
            ],
          ),
        ),
      );
    }

    if (_synapses.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.blur_on, color: Colors.grey, size: 64),
            const SizedBox(height: 16),
            const Text(
              'No Synapses detected within 500m',
              style: TextStyle(color: Colors.grey),
            ),
            if (_currentPosition != null) ...[
              const SizedBox(height: 8),
              Text(
                'LAT: ${_currentPosition!.latitude.toStringAsFixed(4)} | LNG: ${_currentPosition!.longitude.toStringAsFixed(4)}',
                style: const TextStyle(color: Colors.grey, fontSize: 10),
              ),
            ],
          ],
        ),
      );
    }

    return Column(
      children: [
        if (_currentPosition != null)
          Container(
            padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
            color: const Color(0xFF1E1E1E),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.my_location, size: 14, color: Color(0xFF00E5FF)),
                const SizedBox(width: 8),
                Text(
                  'LAT: ${_currentPosition!.latitude.toStringAsFixed(4)} | LNG: ${_currentPosition!.longitude.toStringAsFixed(4)}',
                  style: const TextStyle(
                    color: Color(0xFF00E5FF),
                    fontSize: 10,
                    letterSpacing: 1.0,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          ),
        Expanded(
          child: ListView.builder(
            padding: const EdgeInsets.only(top: 8, bottom: 24),
            itemCount: _synapses.length,
            itemBuilder: (context, index) {
              return SynapseCardWidget(
                synapse: _synapses[index],
                userLat: _currentPosition!.latitude,
                userLng: _currentPosition!.longitude,
              );
            },
          ),
        ),
      ],
    );
  }
}
