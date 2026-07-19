import { NextRequest, NextResponse } from "next/server";
import { replaceFolder, type UploadFile } from "@/lib/github";

export const maxDuration = 60;

export async function POST(
  req: NextRequest,
  { params }: { params: { owner: string; repo: string } }
) {
  try {
    const body = await req.json();
    const branch: string = body.branch || "main";
    const folderPath: string = body.folderPath ?? "";
    const files: UploadFile[] = body.files || [];
    const message: string =
      body.message || `Update ${folderPath || "/"} via git-dashboard`;

    if (!Array.isArray(files) || files.length === 0) {
      return NextResponse.json({ error: "Файлдар жіберілмеді" }, { status: 400 });
    }

    const result = await replaceFolder(
      params.owner,
      params.repo,
      branch,
      folderPath,
      files,
      message
    );

    return NextResponse.json({ ok: true, ...result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
