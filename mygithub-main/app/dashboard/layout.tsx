import { redirect } from "next/navigation";
import { createSupabaseServerClient, isAllowedUser } from "@/lib/supabase-server";
import SignOutButton from "./sign-out-button";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAllowedUser(user.user_metadata)) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-ink">
      <header className="border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-wire" />
              <span className="w-1.5 h-1.5 rounded-full bg-amber" />
              <span className="w-1.5 h-1.5 rounded-full bg-coral" />
            </div>
            <span className="font-mono text-text text-sm">git-dashboard</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-muted text-xs font-sans">
              {user.user_metadata.user_name || user.email}
            </span>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
