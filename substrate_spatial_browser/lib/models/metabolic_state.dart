import 'package:cloud_firestore/cloud_firestore.dart';

class MetabolicState {
  final double networkLoadPct;
  final double? efficacyScore;
  final int daoEpoch;
  final double defiIndex;
  final int activeNodes;
  final int activeAgents;
  final String lastEventType;
  final double reinforcementDelta;

  MetabolicState({
    required this.networkLoadPct,
    this.efficacyScore,
    required this.daoEpoch,
    required this.defiIndex,
    required this.activeNodes,
    required this.activeAgents,
    required this.lastEventType,
    required this.reinforcementDelta,
  });

  factory MetabolicState.empty() {
    return MetabolicState(
      networkLoadPct: 0.0,
      daoEpoch: 0,
      defiIndex: 0.0,
      activeNodes: 0,
      activeAgents: 0,
      lastEventType: 'UNKNOWN',
      reinforcementDelta: 0.0,
    );
  }

  factory MetabolicState.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>? ?? {};
    return MetabolicState(
      networkLoadPct: (data['network_load_pct'] as num?)?.toDouble() ?? 0.0,
      efficacyScore: (data['efficacy_score'] as num?)?.toDouble(),
      daoEpoch: (data['dao_governance_epoch'] as num?)?.toInt() ?? 0,
      defiIndex: (data['defi_metabolic_index'] as num?)?.toDouble() ?? 0.0,
      activeNodes: (data['active_nodes'] as num?)?.toInt() ?? 0,
      activeAgents: (data['active_agents'] as num?)?.toInt() ?? 0,
      lastEventType: data['last_event_type'] as String? ?? 'UNKNOWN',
      reinforcementDelta: (data['reinforcement_delta'] as num?)?.toDouble() ?? 0.0,
    );
  }
}
