import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { companySchema } from "@/lib/validations/company";
import Company from "@/models/Company";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const existingCompany = await Company.findOne({ isDeleted: false });
    if (existingCompany) {
      return NextResponse.json({ success: false, error: "Company already configured" }, { status: 400 });
    }

    const body = await request.json();
    const parsed = companySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.issues[0]?.message ?? "Validation failed"
        },
        { status: 400 }
      );
    }

    const payload = parsed.data;
    const company = await Company.create({
      ...payload,
      logo: payload.logo || undefined,
      gst: payload.gst || undefined,
      cin: payload.cin || undefined,
      website: payload.website || undefined
    });

    return NextResponse.json({ success: true, data: company }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to create company" }, { status: 500 });
  }
}
