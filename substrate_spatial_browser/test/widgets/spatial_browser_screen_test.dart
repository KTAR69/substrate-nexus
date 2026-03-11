import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:substrate_spatial_browser/screens/spatial_browser_screen.dart';

void main() {
  testWidgets('SpatialBrowserScreen shows loading state initially', (WidgetTester tester) async {
    await tester.pumpWidget(const MaterialApp(
      home: SpatialBrowserScreen(),
    ));

    expect(find.byType(CircularProgressIndicator), findsOneWidget);
    expect(find.text('SCANNING LOCAL COORDINATES...'), findsOneWidget);
  });
}
