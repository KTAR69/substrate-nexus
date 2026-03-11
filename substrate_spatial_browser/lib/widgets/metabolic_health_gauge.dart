import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:flutter_animate/flutter_animate.dart';

class MetabolicHealthGauge extends StatelessWidget {
  final double networkLoadPct;
  final double? efficacyScore;

  const MetabolicHealthGauge({
    super.key,
    required this.networkLoadPct,
    this.efficacyScore,
  });

  Color _getLoadColor(double load) {
    if (load < 0.6) return const Color(0xFF76FF03);
    if (load <= 0.85) return Colors.amber;
    return Colors.red;
  }

  Color _getEfficacyColor(double score) {
    if (score >= 0.8) return const Color(0xFF76FF03);
    if (score >= 0.5) return Colors.amber;
    return Colors.red;
  }

  @override
  Widget build(BuildContext context) {
    final loadColor = _getLoadColor(networkLoadPct);

    return AspectRatio(
      aspectRatio: 1,
      child: Stack(
        alignment: Alignment.center,
        children: [
          PieChart(
            PieChartData(
              startDegreeOffset: 270,
              sectionsSpace: 0,
              centerSpaceRadius: 40,
              sections: [
                PieChartSectionData(
                  color: loadColor,
                  value: networkLoadPct * 100,
                  radius: 12,
                  showTitle: false,
                ),
                PieChartSectionData(
                  color: Colors.grey.withOpacity(0.2),
                  value: (1 - networkLoadPct) * 100,
                  radius: 12,
                  showTitle: false,
                ),
              ],
            ),
          ).animate().fadeIn(duration: 500.ms),
          if (efficacyScore != null)
            PieChart(
              PieChartData(
                startDegreeOffset: 270,
                sectionsSpace: 0,
                centerSpaceRadius: 24,
                sections: [
                  PieChartSectionData(
                    color: _getEfficacyColor(efficacyScore!),
                    value: efficacyScore! * 100,
                    radius: 8,
                    showTitle: false,
                  ),
                  PieChartSectionData(
                    color: Colors.grey.withOpacity(0.2),
                    value: (1 - efficacyScore!) * 100,
                    radius: 8,
                    showTitle: false,
                  ),
                ],
              ),
            ).animate().fadeIn(duration: 500.ms, delay: 200.ms),
          Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'LOAD',
                style: TextStyle(
                  fontSize: 10,
                  color: loadColor,
                  fontWeight: FontWeight.bold,
                ),
              ),
              Text(
                '${(networkLoadPct * 100).toInt()}%',
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ).animate().fadeIn(duration: 500.ms, delay: 400.ms),
        ],
      ),
    );
  }
}
