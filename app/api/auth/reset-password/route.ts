import { NextRequest, NextResponse } from "next/server";
import { hashPassword } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { resetPasswordBodySchema } from "@/lib/validations/user";
import User from "@/models/User";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = resetPasswordBodySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? "Validation failed" },
        { status: 400 }
      );
    }

    await connectDB();

    const { token, password } = parsed.data;
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: new Date() },
      isDeleted: false,
      isActive: true
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Reset link is invalid or has expired" },
        { status: 400 }
      );
    }

    user.passwordHash = await hashPassword(password);
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save();

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to reset password" }, { status: 500 });
  }
}
