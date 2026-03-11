import 'package:flutter/material.dart';
import '../models/metabolic_state.dart';

class VitalsGrid extends StatelessWidget {
  final MetabolicState state;

  const VitalsGrid({super.key, required this.state});

  Widget _buildMetricCard(String label, dynamic value, {String? suffix}) {
    return Container(
      padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: const Color(0xFF1E1E1E),
        borderRadius: BorderRadius.circular(4),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            label.toUpperCase(),
            style: const TextStyle(
              fontSize: 9,
              color: Colors.grey,
              letterSpacing: 0.5,
            ),
          ),
          const SizedBox(height: 4),
          if (value is num)
            TweenAnimationBuilder<num>(
              tween: Tween<num>(begin: 0, end: value),
              duration: const Duration(milliseconds: 500),
              builder: (context, val, child) {
                final displayValue = val is double ? val.toStringAsFixed(2) : val.toInt().toString();
                return Text(
                  '$displayValue${suffix ?? ''}',
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                );
              },
            )
          else
            Text(
              value.toString(),
              style: const TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return GridView.count(
      crossAxisCount: 2,
      crossAxisSpacing: 8,
      mainAxisSpacing: 8,
      childAspectRatio: 1.5,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      children: [
        _buildMetricCard('DAO Epoch', state.daoEpoch),
        _buildMetricCard('DeFi Index', state.defiIndex),
        _buildMetricCard('Active Nodes', state.activeNodes),
        _buildMetricCard('Active Agents', state.activeAgents),
        _buildMetricCard('Last Event Type', state.lastEventType),
        _buildMetricCard('Reinforcement Delta', state.reinforcementDelta),
      ],
    );
  }
}
