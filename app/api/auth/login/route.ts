import { NextRequest, NextResponse } from "next/server";
import { comparePassword, signToken } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { loginSchema } from "@/lib/validations/user";
import User from "@/models/User";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Invalid email or password" }, { status: 400 });
    }

    const user = await User.findOne({
      email: parsed.data.email.toLowerCase(),
      isActive: true,
      isDeleted: false
    });

    if (!user) {
      return NextResponse.json({ success: false, error: "Invalid email or password" }, { status: 401 });
    }

    const validPassword = await comparePassword(parsed.data.password, user.passwordHash);
    if (!validPassword) {
      return NextResponse.json({ success: false, error: "Invalid email or password" }, { status: 401 });
    }

    const token = await signToken({
      userId: user._id.toString(),
      role: user.role,
      companyId: user.companyId.toString()
    });

    const response = NextResponse.json(
      {
        success: true,
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            mobile: user.mobile
          }
        }
      },
      { status: 200 }
    );

    response.cookies.set("token", token, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7
    });

    return response;
  } catch {
    return NextResponse.json({ success: false, error: "Login failed" }, { status: 500 });
  }
}
