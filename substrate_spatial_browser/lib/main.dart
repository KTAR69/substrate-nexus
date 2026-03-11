import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:provider/provider.dart';
import 'firebase_options.dart';
import 'providers/metabolic_state_provider.dart';
import 'providers/hub_connection_provider.dart';
import 'providers/did_identity_provider.dart';
import 'screens/dashboard_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);
  await FirebaseAuth.instance.signInAnonymously();
  runApp(const SubstrateSpatialBrowser());
}

class SubstrateSpatialBrowser extends StatelessWidget {
  const SubstrateSpatialBrowser({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(
          create: (_) => DIDIdentityProvider()..initialize(),
        ),
        ChangeNotifierProvider(
          create: (_) => HubConnectionProvider()..startDiscovery(),
        ),
        ChangeNotifierProvider(
          create: (_) => MetabolicStateProvider()..startListening(),
        ),
      ],
      child: MaterialApp(
        title: 'Substrate Network',
        theme: ThemeData.dark().copyWith(
          colorScheme: const ColorScheme.dark(
            primary: Color(0xFF76FF03),
            secondary: Color(0xFF00E5FF),
            surface: Color(0xFF0A0A0A),
          ),
        ),
        home: const DashboardScreen(),
      ),
    );
  }
}
