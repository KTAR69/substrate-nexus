import 'package:flutter_test/flutter_test.dart';
import 'package:substrate_spatial_browser/models/spatial_synapse.dart';

void main() {
  group('SpatialSynapse', () {
    test('handles empty map correctly with fallbacks', () {
      final synapse = SpatialSynapse.fromMap({});

      expect(synapse.uuid, '');
      expect(synapse.subject, 'UNKNOWN');
      expect(synapse.createdAt, '');
      expect(synapse.spatialAnchor.environmentType, 'unknown');
      expect(synapse.efficacyScore, isNull);
      expect(synapse.patternTags, isEmpty);
      expect(synapse.emitterDID, '');
    });

    test('handles missing keys and null values gracefully', () {
      final map = {
        'uuid': null,
        'subject': null,
        'created_at': null,
        'analysis': null,
        'parties': null,
        'spatial_anchor': null,
      };

      final synapse = SpatialSynapse.fromMap(map);

      expect(synapse.uuid, '');
      expect(synapse.subject, 'UNKNOWN');
      expect(synapse.createdAt, '');
      expect(synapse.efficacyScore, isNull);
      expect(synapse.patternTags, isEmpty);
      expect(synapse.emitterDID, '');
      expect(synapse.spatialAnchor.vpsProvider, 'multiset_ai');
    });

    test('parses fully populated map correctly', () {
      final map = {
        'uuid': '1234-5678',
        'subject': 'Test Event',
        'created_at': '2023-10-27T10:00:00Z',
        'spatial_anchor': {
          'vps_provider': 'custom_vps',
          'anchor_id': 'anchor_1',
          'environment_type': 'indoor',
          'coordinates': {'lat': 10.0, 'lng': 20.0, 'alt': 5.0, 'accuracy_m': 2.0},
        },
        'analysis': [
          {
            'body': {
              'efficacy_score': 0.85,
              'pattern_tags': ['tag1', 'tag2'],
            }
          }
        ],
        'parties': [
          {'role': 'emitter', 'did': 'did:key:z6Mk...'},
        ]
      };

      final synapse = SpatialSynapse.fromMap(map);

      expect(synapse.uuid, '1234-5678');
      expect(synapse.subject, 'Test Event');
      expect(synapse.createdAt, '2023-10-27T10:00:00Z');
      expect(synapse.efficacyScore, 0.85);
      expect(synapse.patternTags, ['tag1', 'tag2']);
      expect(synapse.emitterDID, 'did:key:z6Mk...');

      expect(synapse.spatialAnchor.vpsProvider, 'custom_vps');
      expect(synapse.spatialAnchor.anchorId, 'anchor_1');
      expect(synapse.spatialAnchor.environmentType, 'indoor');
      expect(synapse.spatialAnchor.coordinates.lat, 10.0);
    });
  });
}
