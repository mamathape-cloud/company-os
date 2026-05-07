import { NextRequest, NextResponse } from "next/server";
import { signToken, hashPassword } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { userSchema } from "@/lib/validations/user";
import Company from "@/models/Company";
import User from "@/models/User";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const parsed = userSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? "Validation failed" },
        { status: 400 }
      );
    }

    const existingSuperadmin = await User.findOne({ role: "superadmin", isDeleted: false });
    if (existingSuperadmin) {
      return NextResponse.json({ success: false, error: "Superadmin already exists" }, { status: 400 });
    }

    const company = await Company.findOne({ isDeleted: false });
    if (!company) {
      return NextResponse.json({ success: false, error: "Company setup is required first" }, { status: 400 });
    }

    const passwordHash = await hashPassword(parsed.data.password);
    const user = await User.create({
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
      mobile: parsed.data.mobile,
      role: "superadmin",
      isActive: true,
      companyId: company._id
    });

    const token = signToken({
      userId: user._id.toString(),
      role: user.role,
      companyId: company._id.toString()
    });

    const response = NextResponse.json(
      {
        success: true,
        data: { name: user.name, email: user.email, role: user.role }
      },
      { status: 201 }
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
    return NextResponse.json({ success: false, error: "Failed to create admin user" }, { status: 500 });
  }
}
