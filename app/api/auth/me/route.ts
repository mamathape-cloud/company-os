import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Company from "@/models/Company";
import User from "@/models/User";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findById(payload.userId).select("-passwordHash");
    if (!user || user.isDeleted || !user.isActive) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const company = await Company.findById(user.companyId).select("name");

    return NextResponse.json({
      success: true,
      data: {
        user,
        companyName: company?.name ?? ""
      }
    });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to fetch user profile" }, { status: 500 });
  }
}
