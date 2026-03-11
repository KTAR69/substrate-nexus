import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/metabolic_state.dart';
import '../models/network_event.dart';

class MetabolicStateProvider extends ChangeNotifier {
  final FirebaseFirestore _db = FirebaseFirestore.instance;

  MetabolicState _state = MetabolicState.empty();
  MetabolicState get state => _state;

  bool _isLoading = true;
  bool get isLoading => _isLoading;

  String? _error;
  String? get error => _error;

  StreamSubscription<DocumentSnapshot>? _stateSub;

  void startListening() {
    _stateSub = _db
        .collection('metabolic_state')
        .doc('current')
        .snapshots()
        .listen(
      (snapshot) {
        if (snapshot.exists) {
          _state = MetabolicState.fromFirestore(snapshot);
          _isLoading = false;
          _error = null;
        }
        notifyListeners();
      },
      onError: (Object err) {
        _error = err.toString();
        _isLoading = false;
        notifyListeners();
      },
    );
  }

  Stream<List<NetworkEvent>> get eventFeedStream {
    return _db
        .collection('event_stream')
        .orderBy('timestamp', descending: true)
        .limit(10)
        .snapshots()
        .map(
          (snapshot) =>
              snapshot.docs.map(NetworkEvent.fromFirestore).toList(),
        );
  }

  @override
  void dispose() {
    _stateSub?.cancel();
    super.dispose();
  }
}
