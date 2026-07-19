"use client";

import { useRouter } from "next/navigation";

export default function SignOutButton() {
  const router = useRouter();

  async function signOut() {
    await fetch("/api/auth/signout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={signOut}
      className="text-muted hover:text-text text-xs font-sans border border-border rounded-sm px-3 py-1.5 transition-colors"
    >
      Шығу
    </button>
  );
}
