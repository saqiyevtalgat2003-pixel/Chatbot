import { redirect } from "next/navigation";
import { createSupabaseServerClient, isAllowedUser } from "@/lib/supabase-server";

export default async function Home() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user && isAllowedUser(user.user_metadata)) {
    redirect("/dashboard");
  }
  redirect("/login");
}
