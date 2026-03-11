import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/spatial_synapse.dart';

class MultisetRestService {
  final String apiKey;
  static const String _baseUrl = 'https://api.multiset.ai/v1';

  MultisetRestService({required this.apiKey});

  /// Sync a spatial anchor with MultiSet metadata server.
  Future<bool> syncAnchor({
    required String anchorId,
    required double lat,
    required double lng,
    required double alt,
    required Map<String, dynamic> metadata,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$_baseUrl/anchors'),
        headers: {
          'Authorization': 'Bearer $apiKey',
          'Content-Type': 'application/json',
        },
        body: jsonEncode({
          'anchor_id': anchorId,
          'position': {'lat': lat, 'lng': lng, 'alt': alt},
          'metadata': metadata,
        }),
      );
      return response.statusCode == 200 || response.statusCode == 201;
    } catch (e) {
      print('[MultisetRest] syncAnchor error: $e');
      return false;
    }
  }

  /// Query nearby anchors within [radiusMeters] of given coordinates.
  Future<List<Map<String, dynamic>>> queryNearbyAnchors({
    required double lat,
    required double lng,
    double radiusMeters = 500.0,
  }) async {
    try {
      final response = await http.get(
        Uri.parse(
          '$_baseUrl/anchors/nearby?lat=$lat&lng=$lng&radius=$radiusMeters',
        ),
        headers: {'Authorization': 'Bearer $apiKey'},
      );
      if (response.statusCode != 200) return [];
      final data = jsonDecode(response.body) as Map<String, dynamic>;
      return List<Map<String, dynamic>>.from(data['anchors'] ?? []);
    } catch (e) {
      print('[MultisetRest] queryNearbyAnchors error: $e');
      return [];
    }
  }
}
