import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/spatial_synapse.dart';

class SpatialQueryService {
  final String atlasDataApiBaseUrl;
  final String atlasApiKey;
  final String dataSource;
  final String database;
  final String collection;

  SpatialQueryService({
    required this.atlasDataApiBaseUrl,
    required this.atlasApiKey,
    this.dataSource = 'Cluster0',
    this.database = 'substrate_network',
    this.collection = 'vcons',
  });

  /// Query vCon Synapses near the given coordinates within [radiusMeters].
  /// Uses MongoDB 2dsphere $geoWithin + $centerSphere query.
  Future<List<SpatialSynapse>> queryNearbySynapses({
    required double lat,
    required double lng,
    double radiusMeters = 500.0,
  }) async {
    // Earth radius in miles for MongoDB $centerSphere (uses radians)
    const earthRadiusMeters = 6378137.0;
    final radiusRadians = radiusMeters / earthRadiusMeters;

    final queryBody = jsonEncode({
      'collection': collection,
      'database': database,
      'dataSource': dataSource,
      'filter': {
        'spatial_anchor.geo': {
          '\$geoWithin': {
            '\$centerSphere': [
              [lng, lat], // GeoJSON is [longitude, latitude]
              radiusRadians,
            ],
          },
        },
      },
      'sort': {'created_at': -1},
      'limit': 20,
      'projection': {
        'uuid': 1,
        'subject': 1,
        'created_at': 1,
        'spatial_anchor': 1,
        'analysis': 1,
        'parties': 1,
      },
    });

    try {
      final response = await http.post(
        Uri.parse('$atlasDataApiBaseUrl/action/find'),
        headers: {
          'Content-Type': 'application/json',
          'api-key': atlasApiKey,
        },
        body: queryBody,
      );

      if (response.statusCode != 200) {
        print('[SpatialQuery] Error ${response.statusCode}: ${response.body}');
        return [];
      }

      final data = jsonDecode(response.body) as Map<String, dynamic>;
      final documents = data['documents'] as List? ?? [];
      return documents
          .whereType<Map<String, dynamic>>()
          .map(SpatialSynapse.fromMap)
          .toList();
    } catch (e) {
      print('[SpatialQuery] queryNearbySynapses error: $e');
      return [];
    }
  }
}
