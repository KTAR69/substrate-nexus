import 'package:flutter/material.dart';
import '../models/spatial_synapse.dart';

class SynapseCardWidget extends StatelessWidget {
  final SpatialSynapse synapse;
  final double userLat;
  final double userLng;

  const SynapseCardWidget({
    super.key,
    required this.synapse,
    required this.userLat,
    required this.userLng,
  });

  String _truncateDID(String did) {
    if (did.length <= 20) return did;
    return '${did.substring(0, 10)}...${did.substring(did.length - 8)}';
  }

  double _calculateDistanceMeters(double lat1, double lon1, double lat2, double lon2) {
    // Simple equirectangular approximation for small distances
    var p = 0.017453292519943295;
    var a = 0.5 - _cos((lat2 - lat1) * p)/2 +
            _cos(lat1 * p) * _cos(lat2 * p) *
            (1 - _cos((lon2 - lon1) * p))/2;
    return 12742000 * _asin(_sqrt(a)); // 2 * R; R = 6371 km
  }

  double _cos(double x) {
    // very basic Taylor expansion for math.cos without importing dart:math
    double sum = 1.0;
    double term = 1.0;
    for (int i = 1; i < 10; i++) {
      term *= -x * x / (2 * i * (2 * i - 1));
      sum += term;
    }
    return sum;
  }

  double _sqrt(double x) {
    if (x <= 0) return 0;
    double root = x / 2;
    for (int i = 0; i < 10; i++) {
      root = 0.5 * (root + (x / root));
    }
    return root;
  }

  double _asin(double x) {
    if (x < -1 || x > 1) return 0;
    // basic approximation for math.asin
    double sum = x;
    double term = x;
    for (int i = 1; i < 10; i++) {
      term *= x * x * (2 * i - 1) * (2 * i - 1) / ((2 * i) * (2 * i + 1));
      sum += term / (2 * i + 1);
    }
    return sum;
  }

  Color _getScoreColor(double? score) {
    if (score == null) return Colors.grey;
    if (score >= 0.8) return const Color(0xFF76FF03);
    if (score >= 0.5) return Colors.amber;
    return Colors.red;
  }

  @override
  Widget build(BuildContext context) {
    final distance = _calculateDistanceMeters(
      userLat, userLng,
      synapse.spatialAnchor.coordinates.lat,
      synapse.spatialAnchor.coordinates.lng
    );

    return Card(
      color: const Color(0xFF1E1E1E),
      margin: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      elevation: 4,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(
                    synapse.subject,
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                      color: Colors.white,
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                Text(
                  '${distance.toStringAsFixed(1)}m',
                  style: const TextStyle(
                    color: Color(0xFF00E5FF),
                    fontWeight: FontWeight.bold,
                    fontSize: 14,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                const Icon(Icons.perm_identity, size: 14, color: Colors.grey),
                const SizedBox(width: 4),
                Text(
                  _truncateDID(synapse.emitterDID),
                  style: const TextStyle(color: Colors.grey, fontSize: 12),
                ),
              ],
            ),
            const SizedBox(height: 4),
            Row(
              children: [
                const Icon(Icons.location_on, size: 14, color: Colors.grey),
                const SizedBox(width: 4),
                Text(
                  '${synapse.spatialAnchor.coordinates.lat.toStringAsFixed(4)}, ${synapse.spatialAnchor.coordinates.lng.toStringAsFixed(4)}',
                  style: const TextStyle(color: Colors.grey, fontSize: 12),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Wrap(
              spacing: 6,
              runSpacing: 6,
              children: [
                if (synapse.efficacyScore != null)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: _getScoreColor(synapse.efficacyScore).withOpacity(0.2),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: _getScoreColor(synapse.efficacyScore)),
                    ),
                    child: Text(
                      'Efficacy: ${synapse.efficacyScore!.toStringAsFixed(2)}',
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        color: _getScoreColor(synapse.efficacyScore),
                      ),
                    ),
                  ),
                ...synapse.patternTags.map((tag) => Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.grey.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: Colors.grey.withOpacity(0.5)),
                      ),
                      child: Text(
                        '#$tag',
                        style: const TextStyle(fontSize: 10, color: Colors.white70),
                      ),
                    )),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
