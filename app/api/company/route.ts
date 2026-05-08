import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { companySchema } from "@/lib/validations/company";
import Company from "@/models/Company";

async function getAuth(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  return token ? await verifyToken(token) : null;
}

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuth(request);
    if (!auth) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const company = await Company.findOne({ isDeleted: false });
    if (!company) {
      return NextResponse.json({ success: false, error: "Company not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: company });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to fetch company" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await getAuth(request);
    if (!auth) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (auth.role !== "superadmin" && auth.role !== "admin") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = companySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? "Validation failed" },
        { status: 400 }
      );
    }

    await connectDB();
    const updated = await Company.findOneAndUpdate(
      { isDeleted: false },
      {
        ...parsed.data,
        logo: parsed.data.logo || undefined,
        gst: parsed.data.gst || undefined,
        cin: parsed.data.cin || undefined,
        website: parsed.data.website || undefined,
        updatedBy: auth.userId
      },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ success: false, error: "Company not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to update company" }, { status: 500 });
  }
}
