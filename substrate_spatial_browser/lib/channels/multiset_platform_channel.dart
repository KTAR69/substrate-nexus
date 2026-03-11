import 'package:flutter/services.dart';

class MultisetPlatformChannel {
  static const MethodChannel _channel =
      MethodChannel('com.substrate.multiset/vps');

  /// Start a VPS tracking session.
  /// [apiKey] is the MultiSet AI API key.
  /// [anchorId] is optional — if provided, attempts to resolve an existing anchor.
  Future<bool> startVPSSession({
    required String apiKey,
    String? anchorId,
  }) async {
    try {
      final result = await _channel.invokeMethod<bool>('startVPSSession', {
        'apiKey': apiKey,
        'anchorId': anchorId,
      });
      return result ?? false;
    } on PlatformException catch (e) {
      print('[MultisetChannel] startVPSSession error: ${e.message}');
      return false;
    }
  }

  /// Stop the active VPS tracking session.
  Future<void> stopVPSSession() async {
    try {
      await _channel.invokeMethod('stopVPSSession');
    } on PlatformException catch (e) {
      print('[MultisetChannel] stopVPSSession error: ${e.message}');
    }
  }

  /// Get the current VPS pose estimate.
  /// Returns a map with keys: lat, lng, alt, accuracy_m, yaw, pitch, roll.
  /// Returns null if no pose is available.
  Future<Map<String, double>?> getCurrentPose() async {
    try {
      final result =
          await _channel.invokeMapMethod<String, double>('getCurrentPose');
      return result;
    } on PlatformException catch (e) {
      print('[MultisetChannel] getCurrentPose error: ${e.message}');
      return null;
    }
  }

  /// Create a new spatial anchor at the current pose.
  /// Returns the anchor ID string on success, null on failure.
  Future<String?> createAnchor() async {
    try {
      return await _channel.invokeMethod<String>('createAnchor');
    } on PlatformException catch (e) {
      print('[MultisetChannel] createAnchor error: ${e.message}');
      return null;
    }
  }
}
