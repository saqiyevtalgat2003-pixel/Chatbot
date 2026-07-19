import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient, isAllowedUser } from "@/lib/supabase-server";

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      if (!isAllowedUser(data.user.user_metadata)) {
        // Wrong GitHub account — immediately sign out and bounce with an error.
        await supabase.auth.signOut();
        return NextResponse.redirect(
          `${origin}/login?error=${encodeURIComponent(
            "Бұл GitHub аккаунтқа рұқсат жоқ"
          )}`
        );
      }
      return NextResponse.redirect(`${origin}/dashboard`);
    }
  }

  return NextResponse.redirect(
    `${origin}/login?error=${encodeURIComponent("Кіру сәтсіз аяқталды")}`
  );
}
