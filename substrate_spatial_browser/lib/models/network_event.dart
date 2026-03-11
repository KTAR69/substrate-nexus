import 'package:cloud_firestore/cloud_firestore.dart';

class NetworkEvent {
  final String id;
  final String type;
  final DateTime timestamp;
  final double? efficacyScore;
  final List<String> patternTags;

  NetworkEvent({
    required this.id,
    required this.type,
    required this.timestamp,
    this.efficacyScore,
    required this.patternTags,
  });

  factory NetworkEvent.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>? ?? {};

    DateTime parsedTimestamp = DateTime.now();
    if (data['timestamp'] is Timestamp) {
      parsedTimestamp = (data['timestamp'] as Timestamp).toDate();
    } else if (data['timestamp'] is String) {
      parsedTimestamp = DateTime.tryParse(data['timestamp'] as String) ?? DateTime.now();
    }

    final rawTags = data['pattern_tags'];
    final tags = <String>[];
    if (rawTags is List) {
      tags.addAll(rawTags.whereType<String>());
    }

    return NetworkEvent(
      id: doc.id,
      type: data['type'] as String? ?? 'UNKNOWN',
      timestamp: parsedTimestamp,
      efficacyScore: (data['efficacy_score'] as num?)?.toDouble(),
      patternTags: tags,
    );
  }
}
