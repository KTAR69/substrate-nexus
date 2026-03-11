class SpatialCoordinates {
  final double lat;
  final double lng;
  final double alt;
  final double accuracyM;

  const SpatialCoordinates({
    required this.lat,
    required this.lng,
    required this.alt,
    required this.accuracyM,
  });

  factory SpatialCoordinates.fromMap(Map<String, dynamic> map) {
    return SpatialCoordinates(
      lat: (map['lat'] as num?)?.toDouble() ?? 0.0,
      lng: (map['lng'] as num?)?.toDouble() ?? 0.0,
      alt: (map['alt'] as num?)?.toDouble() ?? 0.0,
      accuracyM: (map['accuracy_m'] as num?)?.toDouble() ?? 1.0,
    );
  }
}

class SpatialAnchor {
  final String vpsProvider;
  final String anchorId;
  final SpatialCoordinates coordinates;
  final String environmentType;
  final String emitterDID;
  final String? hubDID;
  final DateTime? createdAt;

  const SpatialAnchor({
    required this.vpsProvider,
    required this.anchorId,
    required this.coordinates,
    required this.environmentType,
    required this.emitterDID,
    this.hubDID,
    this.createdAt,
  });

  factory SpatialAnchor.fromMap(Map<String, dynamic> map) {
    return SpatialAnchor(
      vpsProvider: map['vps_provider'] as String? ?? 'multiset_ai',
      anchorId: map['anchor_id'] as String? ?? '',
      coordinates: SpatialCoordinates.fromMap(
        map['coordinates'] as Map<String, dynamic>? ?? {},
      ),
      environmentType: map['environment_type'] as String? ?? 'unknown',
      emitterDID: map['emitter_did'] as String? ?? '',
      hubDID: map['hub_did'] as String?,
      createdAt: map['created_at'] != null
          ? DateTime.tryParse(map['created_at'] as String)
          : null,
    );
  }
}

class SpatialSynapse {
  final String uuid;
  final String subject;
  final String createdAt;
  final SpatialAnchor spatialAnchor;
  final double? efficacyScore;
  final List<String> patternTags;
  final String emitterDID;

  const SpatialSynapse({
    required this.uuid,
    required this.subject,
    required this.createdAt,
    required this.spatialAnchor,
    this.efficacyScore,
    required this.patternTags,
    required this.emitterDID,
  });

  factory SpatialSynapse.fromMap(Map<String, dynamic> map) {
    final analysis = map['analysis'] as List?;
    final latestAnalysis = analysis?.isNotEmpty == true
        ? analysis!.last as Map<String, dynamic>?
        : null;
    final analysisBody =
        latestAnalysis?['body'] as Map<String, dynamic>? ?? {};

    final rawTags = analysisBody['pattern_tags'];
    final tags = <String>[];
    if (rawTags is List) tags.addAll(rawTags.whereType<String>());

    return SpatialSynapse(
      uuid: map['uuid'] as String? ?? '',
      subject: map['subject'] as String? ?? 'UNKNOWN',
      createdAt: map['created_at'] as String? ?? '',
      spatialAnchor: SpatialAnchor.fromMap(
        map['spatial_anchor'] as Map<String, dynamic>? ?? {},
      ),
      efficacyScore: (analysisBody['efficacy_score'] as num?)?.toDouble(),
      patternTags: tags,
      emitterDID: (map['parties'] as List?)
              ?.whereType<Map<String, dynamic>>()
              .firstWhere(
                (p) => p['role'] != null,
                orElse: () => {},
              )['did'] as String? ??
          '',
    );
  }
}
