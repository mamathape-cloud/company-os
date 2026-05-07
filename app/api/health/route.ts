import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Company from "@/models/Company";

export async function GET() {
  try {
    await connectDB();
    const company = await Company.findOne({ isDeleted: false }).select("name");
    const setup = Boolean(company);

    return NextResponse.json({
      success: true,
      data: {
        setup,
        ...(setup ? { companyName: company?.name ?? "" } : {})
      }
    });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to check setup status" }, { status: 500 });
  }
}
