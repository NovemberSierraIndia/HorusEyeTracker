"use client";

import { useSession, signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function UserInfo({ collapsed }: { collapsed?: boolean }) {
  const { data: session } = useSession();

  if (!session?.user) return null;

  return (
    <div className={`px-4 py-3 border-t border-border flex items-center gap-3 ${collapsed ? "justify-center px-2" : ""}`}>
      {session.user.image && (
        <img
          src={session.user.image}
          alt=""
          className="w-8 h-8 rounded-full shrink-0"
        />
      )}
      {!collapsed && (
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-text-primary truncate">
            {session.user.name}
          </p>
          <p className="text-xs text-text-muted truncate">{session.user.email}</p>
        </div>
      )}
      {!collapsed && (
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="p-1.5 rounded-lg text-text-muted hover:text-racing-red hover:bg-racing-red/10 transition-colors shrink-0"
          title="Sign out"
        >
          <LogOut size={16} />
        </button>
      )}
    </div>
  );
}
