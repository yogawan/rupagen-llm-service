// app/api/notes/route.ts  (app router route handler)
import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  const { userId } = getAuth(req); // <-- inilah userId (string) atau undefined
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // lanjutkan logic backend (simpan catatan, dsb)
  return NextResponse.json({ ok: true, userId });
}
