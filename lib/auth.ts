import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export interface AuthTokenPayload {
  userId: string;
  role: "superadmin" | "admin" | "user";
  companyId: string;
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not set");
  }
  return secret;
}

export function signToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: "7d" });
}

export function verifyToken(token: string): AuthTokenPayload | null {
  try {
    const decoded = jwt.verify(token, getJwtSecret()) as jwt.JwtPayload;
    if (!decoded.userId || !decoded.role || !decoded.companyId) {
      return null;
    }
    return {
      userId: String(decoded.userId),
      role: decoded.role as AuthTokenPayload["role"],
      companyId: String(decoded.companyId)
    };
  } catch {
    return null;
  }
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function comparePassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
