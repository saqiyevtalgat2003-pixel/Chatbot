import { NextRequest, NextResponse } from "next/server";
import { getTree } from "@/lib/github";

export async function GET(
  req: NextRequest,
  { params }: { params: { owner: string; repo: string } }
) {
  const branch = req.nextUrl.searchParams.get("branch") || "main";
  try {
    const { entries, commitSha } = await getTree(params.owner, params.repo, branch);
    return NextResponse.json({ entries, commitSha });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
