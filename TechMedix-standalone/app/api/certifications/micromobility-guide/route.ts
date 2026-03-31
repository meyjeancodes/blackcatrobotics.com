import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      filename: "BCR-Micromobility-Tech-Certification-v1.pdf",
      status: "pending",
      message: "PDF asset will be served at this endpoint when uploaded to /public/docs/.",
    },
    { status: 200 }
  );
}
