import { generateKeyPairSync, sign, verify } from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';

interface ServiceIdentity {
  serviceId: string;
  serviceName: string;
  keyId: string;
  algorithm: 'Ed25519' | 'RSA';
  publicKey: string;
  privateKey: string;
  status: 'ACTIVE' | 'INACTIVE' | 'REVOKED';
  createdAt: Date;
  expiresAt?: Date;
  keyVersion: number;
  totpSecret: string;
}

interface ServiceToken {
  sub: string;
  service_id: string;
  iss: string;
  aud: string;
  iat: number;
  exp: number;
  jti: string;
  key_id: string;
  key_version: number;
}

class IdentityService {
  private identities: Map<string, ServiceIdentity> = new Map();
  private revokedTokens: Set<string> = new Set();
  private seenTokenIds: Set<string> = new Set();

  /**
   * Generate a new cryptographic identity for a service
   */
  generateServiceIdentity(
    serviceId: string,
    serviceName: string,
    algorithm: 'Ed25519' | 'RSA' = 'RSA'
  ): ServiceIdentity {
    const { publicKey, privateKey } = generateKeyPairSync(
      algorithm === 'Ed25519' ? 'ed25519' : 'rsa',
      algorithm === 'Ed25519'
        ? {}
        : {
            modulusLength: 2048,
            publicKeyEncoding: { type: 'spki', format: 'pem' },
            privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
          }
    );

    const identity: ServiceIdentity = {
      serviceId,
      serviceName,
      keyId: `${serviceId}-key-${Date.now()}`,
      algorithm,
      publicKey: publicKey.toString(),
      privateKey: privateKey.toString(),
      status: 'ACTIVE',
      createdAt: new Date(),
      keyVersion: 1,
      totpSecret: randomBytes(20).toString('hex'),
    };

    this.identities.set(serviceId, identity);
    console.log(`[Identity Service] Generated identity for ${serviceName}`);

    return identity;
  }

  /**
   * Get service identity
   */
  getIdentity(serviceId: string): ServiceIdentity | undefined {
    return this.identities.get(serviceId);
  }

  /**
   * Rotate service keys (increment version)
   */
  rotateKeys(serviceId: string): ServiceIdentity | null {
    const identity = this.identities.get(serviceId);
    if (!identity) return null;

    const { publicKey, privateKey } = generateKeyPairSync(
      identity.algorithm === 'Ed25519' ? 'ed25519' : 'rsa',
      identity.algorithm === 'Ed25519'
        ? {}
        : {
            modulusLength: 2048,
            publicKeyEncoding: { type: 'spki', format: 'pem' },
            privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
          }
    );

    identity.publicKey = publicKey.toString();
    identity.privateKey = privateKey.toString();
    identity.keyVersion += 1;
    identity.keyId = `${serviceId}-key-${Date.now()}`;

    console.log(`[Identity Service] Rotated keys for ${serviceId} to version ${identity.keyVersion}`);

    return identity;
  }

  /**
   * Revoke service identity
   */
  revokeIdentity(serviceId: string): void {
    const identity = this.identities.get(serviceId);
    if (identity) {
      identity.status = 'REVOKED';
      console.log(`[Identity Service] Revoked identity for ${serviceId}`);
    }
  }

  /**
   * Disable service (temporary)
   */
  disableService(serviceId: string): void {
    const identity = this.identities.get(serviceId);
    if (identity) {
      identity.status = 'INACTIVE';
      console.log(`[Identity Service] Disabled service ${serviceId}`);
    }
  }

  /**
   * Enable service
   */
  enableService(serviceId: string): void {
    const identity = this.identities.get(serviceId);
    if (identity) {
      identity.status = 'ACTIVE';
      console.log(`[Identity Service] Enabled service ${serviceId}`);
    }
  }

  /**
   * Create a signed JWT token for a service
   */
  createToken(
    serviceId: string,
    expiresIn: string = '15m',
    audience?: string
  ): { token: string; error?: string } {
    const identity = this.identities.get(serviceId);

    if (!identity) {
      return { token: '', error: 'SERVICE_NOT_FOUND' };
    }

    if (identity.status !== 'ACTIVE') {
      return { token: '', error: 'SERVICE_INACTIVE' };
    }

    const jti = uuidv4();
    const payload: ServiceToken = {
      sub: serviceId,
      service_id: serviceId,
      iss: 'zero-trust-mesh',
      aud: audience || 'zero-trust-mesh',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + this.parseExpiration(expiresIn),
      jti,
      key_id: identity.keyId,
      key_version: identity.keyVersion,
    };

    try {
      const token = jwt.sign(payload, identity.privateKey, {
        algorithm: identity.algorithm === 'Ed25519' ? 'EdDSA' : 'RS256',
        keyid: identity.keyId,
      });

      return { token };
    } catch (error: any) {
      return { token: '', error: error.message };
    }
  }

  /**
   * Validate a token
   */
  validateToken(token: string): { valid: boolean; payload?: ServiceToken; error?: string } {
    try {
      // Check if token is revoked
      const decoded = jwt.decode(token) as any;
      if (!decoded) {
        return { valid: false, error: 'INVALID_TOKEN_FORMAT' };
      }

      if (this.revokedTokens.has(decoded.jti)) {
        return { valid: false, error: 'TOKEN_REVOKED' };
      }

      // Check for replay attack
      if (this.seenTokenIds.has(decoded.jti)) {
        return { valid: false, error: 'TOKEN_REPLAY_DETECTED' };
      }

      const serviceId = decoded.service_id;
      const identity = this.identities.get(serviceId);

      if (!identity) {
        return { valid: false, error: 'SERVICE_NOT_FOUND' };
      }

      if (identity.status !== 'ACTIVE') {
        return { valid: false, error: 'SERVICE_INACTIVE' };
      }

      // Verify signature
      try {
        const payload = jwt.verify(token, identity.publicKey, {
          algorithms: [identity.algorithm === 'Ed25519' ? 'EdDSA' : 'RS256'],
          issuer: 'zero-trust-mesh',
        }) as ServiceToken;

        // Record seen token to prevent replay
        this.seenTokenIds.add(payload.jti);

        return { valid: true, payload };
      } catch (verifyError: any) {
        return { valid: false, error: verifyError.message };
      }
    } catch (error: any) {
      return { valid: false, error: error.message };
    }
  }

  /**
   * Verify MFA TOTP token for service
   */
  verifyMfa(serviceId: string, token: string): boolean {
    const identity = this.identities.get(serviceId);
    if (!identity || !identity.totpSecret) return false;
    
    // In a real implementation this would verify the TOTP.
    // For our mock services, any 6 digit number works as a demo.
    return /^\d{6}$/.test(token);
  }

  /**
   * Get MFA Secret for service (for testing/setup)
   */
  getMfaSecret(serviceId: string): string | undefined {
    return this.identities.get(serviceId)?.totpSecret;
  }

  /**
   * Revoke a specific token
   */
  revokeToken(jti: string): void {
    this.revokedTokens.add(jti);
    console.log(`[Identity Service] Revoked token ${jti}`);
  }

  /**
   * Check if token is revoked
   */
  isTokenRevoked(jti: string): boolean {
    return this.revokedTokens.has(jti);
  }

  /**
   * Get all registered services
   */
  getAllServices(): ServiceIdentity[] {
    return Array.from(this.identities.values());
  }

  /**
   * Register mock services for demo
   */
  registerMockServices(): void {
    const services = [
      { id: 'frontend-service', name: 'Frontend Service' },
      { id: 'orders-service', name: 'Orders Service' },
      { id: 'payments-service', name: 'Payments Service' },
      { id: 'users-service', name: 'Users Service' },
      { id: 'database-service', name: 'Database Service' },
      { id: 'auth-service', name: 'Auth Service' },
    ];

    services.forEach((svc) => {
      this.generateServiceIdentity(svc.id, svc.name);
    });
  }

  /**
   * Parse expiration string to seconds
   */
  private parseExpiration(expiresIn: string): number {
    const units: { [key: string]: number } = {
      s: 1,
      m: 60,
      h: 3600,
      d: 86400,
    };

    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) return 900; // default 15 minutes

    const [, value, unit] = match;
    return parseInt(value) * units[unit];
  }
}

export const identityService = new IdentityService();
