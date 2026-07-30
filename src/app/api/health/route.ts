import { NextResponse } from "next/server";

import { getPublicHealthStatus } from "@/server/health";

export function GET() {
  return NextResponse.json(getPublicHealthStatus(), {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
