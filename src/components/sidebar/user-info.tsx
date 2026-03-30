"use client";

import { useSession } from "next-auth/react";

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
        <div className="min-w-0">
          <p className="text-sm font-medium text-text-primary truncate">
            {session.user.name}
          </p>
          <p className="text-xs text-text-muted truncate">{session.user.email}</p>
        </div>
      )}
    </div>
  );
}
