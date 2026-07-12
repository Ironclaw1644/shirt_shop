import { NextResponse, type NextRequest } from "next/server";
import { requireStaff } from "@/lib/auth/getSessionProfile";
import { uploadProductImage } from "@/lib/storage/upload";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  // auth gate — admin / staff only
  if (!(await requireStaff())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Bad form data" }, { status: 400 });
  }
  const file = formData.get("file");
  const slug = (formData.get("slug") as string) ?? null;
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  try {
    const result = await uploadProductImage({ file, slug });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
