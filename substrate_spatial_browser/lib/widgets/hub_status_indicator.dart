import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/hub_connection.dart';
import '../providers/hub_connection_provider.dart';
import '../screens/hub_connection_screen.dart';

class HubStatusIndicator extends StatelessWidget {
  const HubStatusIndicator({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<HubConnectionProvider>(
      builder: (context, provider, _) {
        Color indicatorColor;
        IconData icon;

        switch (provider.state) {
          case HubConnectionState.connected:
            indicatorColor = const Color(0xFF76FF03);
            icon = Icons.hub;
            break;
          case HubConnectionState.discovering:
          case HubConnectionState.found:
          case HubConnectionState.verifying:
            indicatorColor = Colors.amber;
            icon = Icons.radar;
            break;
          case HubConnectionState.error:
            indicatorColor = Colors.red;
            icon = Icons.hub_outlined;
            break;
          case HubConnectionState.disconnected:
          default:
            indicatorColor = Colors.grey;
            icon = Icons.hub_outlined;
        }

        return IconButton(
          icon: Icon(icon, color: indicatorColor),
          onPressed: () => Navigator.push(
            context,
            MaterialPageRoute(builder: (_) => const HubConnectionScreen()),
          ),
        );
      },
    );
  }
}
