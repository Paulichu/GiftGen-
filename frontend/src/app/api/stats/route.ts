import { NextResponse } from "next/server";
import { readDb, statsOf } from "@/lib/studio/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const stats = await readDb(statsOf);
  return NextResponse.json(stats);
}
