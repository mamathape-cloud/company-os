import { SignJWT, jwtVerify } from "jose";

export interface AuthTokenPayload {
  userId: string;
  role: "superadmin" | "admin" | "user";
  companyId: string;
}

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not set");
  }
  return new TextEncoder().encode(secret);
}

export async function signToken(payload: AuthTokenPayload): Promise<string> {
  return new SignJWT({
    userId: payload.userId,
    role: payload.role,
    companyId: payload.companyId
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getJwtSecret());
}

export async function verifyToken(token: string): Promise<AuthTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    if (!payload.userId || !payload.role || !payload.companyId) {
      return null;
    }
    return {
      userId: String(payload.userId),
      role: payload.role as AuthTokenPayload["role"],
      companyId: String(payload.companyId)
    };
  } catch {
    return null;
  }
}
