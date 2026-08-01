/**
 * Initialize Zero-Trust Mesh Services
 * Creates service identities, policies, and baseline data
 */

import { identityService } from '../lib/identity/service';
import { policyEngine } from '../lib/policies/engine';
import { lateralMovementDetector } from '../lib/detection/lateral-movement';
import { riskEngine } from '../lib/risk/engine';

async function initializeServices(): Promise<void> {
  console.log('\n🔐 [Zero-Trust Mesh] Initializing Services...\n');

  // Step 1: Register Mock Services
  console.log('📋 Step 1: Registering microservices...');
  identityService.registerMockServices();

  const services = identityService.getAllServices();
  console.log(`✓ Registered ${services.length} services\n`);

  services.forEach((svc) => {
    const { token, error } = identityService.createToken(svc.serviceId);
    if (!error) {
      console.log(`  • ${svc.serviceName}: ${token?.substring(0, 30)}...`);
    }
  });

  // Step 2: Initialize Policies
  console.log('\n📋 Step 2: Setting up security policies...');
  const policies = policyEngine.getAllPolicies();
  console.log(`✓ Initialized ${policies.length} security policies\n`);

  policies.forEach((policy) => {
    console.log(`  • ${policy.source} → ${policy.destination}`);
    console.log(`    Methods: ${policy.allowedMethods.join(', ')}`);
    console.log(`    Max Requests/min: ${policy.maxRequestsPerMinute}`);
    console.log(`    Max Risk Score: ${policy.maxRiskScore}\n`);
  });

  // Step 3: Establish baseline communication paths
  console.log('📋 Step 3: Establishing baseline communication paths...');
  const baselines = [
    ['frontend-service', 'orders-service'],
    ['orders-service', 'payments-service'],
    ['orders-service', 'users-service'],
    ['orders-service', 'database-service'],
    ['payments-service', 'database-service'],
    ['auth-service', 'users-service'],
    ['frontend-service', 'auth-service'],
  ];

  baselines.forEach(([source, dest]) => {
    riskEngine.recordCommunication(source, dest, '/');
    console.log(`  • ${source} → ${dest}`);
  });

  console.log(`✓ Established ${baselines.length} baseline paths\n`);

  // Step 4: Display Summary
  console.log('========================================');
  console.log('✓ ZERO-TRUST MESH INITIALIZED');
  console.log('========================================\n');

  console.log('System Ready:');
  console.log('  • Proxy Server: Ready on port 4000');
  console.log(`  • Protected Services: ${services.length}`);
  console.log(`  • Security Policies: ${policies.length}`);
  console.log(`  • Baseline Paths: ${baselines.length}`);
  console.log('\nFeatures:');
  console.log('  ✓ Cryptographic Identity');
  console.log('  ✓ Token Validation');
  console.log('  ✓ Policy Enforcement');
  console.log('  ✓ Risk Scoring');
  console.log('  ✓ Lateral Movement Detection');
  console.log('  ✓ Audit Logging');
  console.log('  ✓ Real-time WebSocket Events');
  console.log('  ✓ Attack Simulation');

  console.log('\n🚀 Dashboard: http://localhost:3000');
  console.log('📊 Health Check: http://localhost:4000/health');
  console.log('🔌 API: http://localhost:4000/api/\n');

  console.log('Next Steps:');
  console.log('  1. Start the dev server: npm run dev');
  console.log('  2. Open http://localhost:3000 in your browser');
  console.log('  3. Navigate to the Attack Simulator tab');
  console.log('  4. Execute sample attacks to see security in action\n');
}

// Run initialization
initializeServices().catch((error) => {
  console.error('❌ Initialization error:', error);
  process.exit(1);
});
