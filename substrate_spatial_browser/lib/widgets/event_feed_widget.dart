import 'package:flutter/material.dart';
import '../models/network_event.dart';

class EventFeedWidget extends StatelessWidget {
  final Stream<List<NetworkEvent>> eventStream;

  const EventFeedWidget({super.key, required this.eventStream});

  String _formatTime(DateTime time) {
    return '${time.hour.toString().padLeft(2, '0')}:${time.minute.toString().padLeft(2, '0')}:${time.second.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<List<NetworkEvent>>(
      stream: eventStream,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(
            child: Padding(
              padding: EdgeInsets.all(16.0),
              child: CircularProgressIndicator(color: Color(0xFF76FF03)),
            ),
          );
        }

        if (snapshot.hasError) {
          return Padding(
            padding: const EdgeInsets.all(16.0),
            child: Text(
              'Error loading events: ${snapshot.error}',
              style: const TextStyle(color: Colors.red),
            ),
          );
        }

        final events = snapshot.data ?? [];
        if (events.isEmpty) {
          return const Padding(
            padding: EdgeInsets.all(16.0),
            child: Text(
              'No recent neural events.',
              style: TextStyle(color: Colors.grey, fontStyle: FontStyle.italic),
            ),
          );
        }

        return ListView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: events.length,
          itemBuilder: (context, index) {
            final event = events[index];
            return Container(
              margin: const EdgeInsets.only(bottom: 8),
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFF1E1E1E),
                border: Border(
                  left: BorderSide(
                    color: _getEfficacyColor(event.efficacyScore),
                    width: 3,
                  ),
                ),
                borderRadius: BorderRadius.circular(4),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        event.type,
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 12,
                        ),
                      ),
                      Text(
                        _formatTime(event.timestamp),
                        style: const TextStyle(
                          color: Colors.grey,
                          fontSize: 10,
                        ),
                      ),
                    ],
                  ),
                  if (event.efficacyScore != null || event.patternTags.isNotEmpty)
                    const SizedBox(height: 8),
                  Wrap(
                    spacing: 4,
                    runSpacing: 4,
                    children: [
                      if (event.efficacyScore != null)
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: _getEfficacyColor(event.efficacyScore).withOpacity(0.2),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(
                            'Score: ${event.efficacyScore!.toStringAsFixed(2)}',
                            style: TextStyle(
                              fontSize: 9,
                              color: _getEfficacyColor(event.efficacyScore),
                            ),
                          ),
                        ),
                      ...event.patternTags.map((tag) => Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: Colors.grey.withOpacity(0.2),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Text(
                              '#$tag',
                              style: const TextStyle(
                                fontSize: 9,
                                color: Colors.white70,
                              ),
                            ),
                          )),
                    ],
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  Color _getEfficacyColor(double? score) {
    if (score == null) return Colors.grey;
    if (score >= 0.8) return const Color(0xFF76FF03);
    if (score >= 0.5) return Colors.amber;
    return Colors.red;
  }
}
