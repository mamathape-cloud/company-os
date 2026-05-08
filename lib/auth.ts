import bcrypt from "bcryptjs";

export type { AuthTokenPayload } from "@/lib/jwt";
export { signToken, verifyToken } from "@/lib/jwt";

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function comparePassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
