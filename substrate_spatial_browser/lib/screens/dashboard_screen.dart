import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/metabolic_state_provider.dart';
import '../providers/hub_connection_provider.dart';
import '../providers/did_identity_provider.dart';
import '../widgets/metabolic_health_gauge.dart';
import '../widgets/vitals_grid.dart';
import '../widgets/event_feed_widget.dart';
import '../widgets/hub_status_indicator.dart';
import 'spatial_browser_screen.dart';
import 'identity_screen.dart';

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Theme.of(context).colorScheme.surface,
      appBar: AppBar(
        title: const Text(
          'SUBSTRATE NETWORK',
          style: TextStyle(fontSize: 13, letterSpacing: 2.0),
        ),
        backgroundColor: Colors.transparent,
        elevation: 0,
        actions: [
          const HubStatusIndicator(),
          IconButton(
            icon: const Icon(Icons.qr_code),
            onPressed: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const IdentityScreen()),
            ),
          ),
          IconButton(
            icon: const Icon(Icons.view_in_ar),
            onPressed: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const SpatialBrowserScreen()),
            ),
          ),
        ],
      ),
      body: Consumer<MetabolicStateProvider>(
        builder: (context, provider, _) {
          if (provider.isLoading) {
            return const Center(
              child: CircularProgressIndicator(color: Color(0xFF76FF03)),
            );
          }
          if (provider.error != null) {
            return Center(
              child: Text('CONNECTION ERROR: ${provider.error}',
                  style: const TextStyle(color: Colors.red)),
            );
          }
          final state = provider.state;
          return SingleChildScrollView(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Consumer<HubConnectionProvider>(
                  builder: (context, hubProvider, _) {
                    if (hubProvider.isHubConnected) {
                      return Container(
                        padding: const EdgeInsets.all(8),
                        margin: const EdgeInsets.only(bottom: 16),
                        decoration: BoxDecoration(
                          border: Border.all(color: const Color(0xFF00E5FF)),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.hub, color: Color(0xFF00E5FF), size: 16),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                'HUB CONNECTED: ${hubProvider.connectedHub?.hubDID ?? ""}',
                                style: const TextStyle(
                                  fontSize: 10,
                                  color: Color(0xFF00E5FF),
                                  letterSpacing: 1.0,
                                ),
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          ],
                        ),
                      );
                    }
                    return const SizedBox.shrink();
                  },
                ),
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      flex: 2,
                      child: MetabolicHealthGauge(
                        networkLoadPct: state.networkLoadPct,
                        efficacyScore: state.efficacyScore,
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(flex: 3, child: VitalsGrid(state: state)),
                  ],
                ),
                const SizedBox(height: 24),
                const Text(
                  'NEURAL EVENT STREAM',
                  style: TextStyle(
                    fontSize: 11,
                    letterSpacing: 3.0,
                    color: Color(0xFF76FF03),
                  ),
                ),
                const SizedBox(height: 8),
                EventFeedWidget(eventStream: provider.eventFeedStream),
              ],
            ),
          );
        },
      ),
    );
  }
}
