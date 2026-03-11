import 'package:flutter/foundation.dart';
import '../models/did_identity.dart';
import '../services/did_service.dart';

class DIDIdentityProvider extends ChangeNotifier {
  final DIDService _service = DIDService();
  DIDIdentity? _identity;
  bool _isLoading = true;

  DIDIdentity? get identity => _identity;
  bool get isLoading => _isLoading;
  String get did => _identity?.did ?? 'Generating...';

  Future<void> initialize() async {
    _identity = await _service.getOrCreateIdentity();
    _isLoading = false;
    notifyListeners();
  }
}
