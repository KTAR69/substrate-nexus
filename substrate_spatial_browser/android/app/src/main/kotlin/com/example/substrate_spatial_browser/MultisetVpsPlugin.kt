package com.example.substrate_spatial_browser

import io.flutter.embedding.engine.plugins.FlutterPlugin
import io.flutter.plugin.common.MethodCall
import io.flutter.plugin.common.MethodChannel
import io.flutter.plugin.common.MethodChannel.MethodCallHandler
import io.flutter.plugin.common.MethodChannel.Result

class MultisetVpsPlugin : FlutterPlugin, MethodCallHandler {
    private lateinit var channel: MethodChannel

    override fun onAttachedToEngine(binding: FlutterPlugin.FlutterPluginBinding) {
        channel = MethodChannel(
            binding.binaryMessenger,
            "com.substrate.multiset/vps"
        )
        channel.setMethodCallHandler(this)
    }

    override fun onMethodCall(call: MethodCall, result: Result) {
        when (call.method) {
            "startVPSSession" -> {
                // Phase 5: Stub returns true
                // Phase 6: Initialize MultiSet Android SDK with call.argument("apiKey")
                result.success(true)
            }
            "stopVPSSession" -> {
                // Phase 6: Terminate MultiSet SDK session
                result.success(null)
            }
            "getCurrentPose" -> {
                // Phase 5: Return mock pose data for development
                // Phase 6: Return real pose from MultiSet SDK
                result.success(mapOf(
                    "lat" to 29.4241,
                    "lng" to -98.4936,
                    "alt" to 195.2,
                    "accuracy_m" to 0.05,
                    "yaw" to 0.0,
                    "pitch" to 0.0,
                    "roll" to 0.0
                ))
            }
            "createAnchor" -> {
                // Phase 5: Return stub anchor ID
                // Phase 6: Create real anchor via MultiSet Android SDK
                result.success("multiset-anchor-stub-${System.currentTimeMillis()}")
            }
            else -> result.notImplemented()
        }
    }

    override fun onDetachedFromEngine(binding: FlutterPlugin.FlutterPluginBinding) {
        channel.setMethodCallHandler(null)
    }
}
