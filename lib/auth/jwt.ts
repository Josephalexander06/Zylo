import { SignJWT, jwtVerify, type JWTPayload } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'zylo-super-secret-jwt-key-2026-minimum-32-chars-long';
const secretKey = new TextEncoder().encode(JWT_SECRET);

export interface TokenUserPayload extends JWTPayload {
  userId: string;
  email: string;
  role: 'ADMIN' | 'STAFF' | 'CUSTOMER';
  fullName: string;
}

export async function signToken(payload: {
  userId: string;
  email: string;
  role: 'ADMIN' | 'STAFF' | 'CUSTOMER';
  fullName: string;
}): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secretKey);
}

export async function verifyToken(token: string): Promise<TokenUserPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return payload as TokenUserPayload;
  } catch {
    return null;
  }
}

