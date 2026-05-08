import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { sendPasswordResetEmail } from "@/lib/email";
import { forgotPasswordSchema } from "@/lib/validations/user";
import User from "@/models/User";

const PUBLIC_SUCCESS_MESSAGE = "If this email exists you will receive a reset link shortly";

function getPasswordResetUrl(request: NextRequest, token: string): string {
  const configured = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "");
  if (configured) {
    return `${configured}/reset-password/${token}`;
  }
  return new URL(`/reset-password/${token}`, request.url).toString();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = forgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? "Validation failed" },
        { status: 400 }
      );
    }

    await connectDB();

    const email = parsed.data.email.toLowerCase();
    const user = await User.findOne({
      email,
      isDeleted: false,
      isActive: true
    });

    if (user) {
      const token = crypto.randomBytes(32).toString("hex");
      const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);

      user.resetToken = token;
      user.resetTokenExpiry = resetTokenExpiry;
      await user.save();

      const resetUrl = getPasswordResetUrl(request, token);
      try {
        await sendPasswordResetEmail(user.email, resetUrl);
      } catch {
        // Do not reveal whether email exists; still return generic success.
      }
    }

    return NextResponse.json({ success: true, message: PUBLIC_SUCCESS_MESSAGE });
  } catch {
    return NextResponse.json({ success: false, error: "Request failed" }, { status: 500 });
  }
}
