import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getAllUsersStats } from "@/lib/lesson-db";
import { supabase } from "@/integrations/supabase/client";
import {
  Users,
  Shield,
  ShieldOff,
  Flame,
  Bookmark,
  Loader2,
  Crown,
  UserX,
  BarChart3,
} from "lucide-react";

export const Route = createFileRoute("/admin/users")({
  component: UsersPage,
});

type UserRow = {
  id: string;
  email: string | null;
  displayName: string | null;
  createdAt: string;
  role: string;
  completedCount: number;
  bookmarkCount: number;
};

function UsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    setLoading(true);
    const data = await getAllUsersStats();
    setUsers(data as UserRow[]);
    setLoading(false);
  }

  async function toggleAdmin(userId: string, currentRole: string) {
    setBusy(userId);
    try {
      if (currentRole === "admin") {
        await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", "admin");
        await supabase.from("user_roles").insert({ user_id: userId, role: "user" });
      } else {
        await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", "user");
        await supabase.from("user_roles").insert({ user_id: userId, role: "admin" });
      }
      await loadUsers();
    } catch (e) {
      console.error("Toggle admin failed:", e);
    } finally {
      setBusy(null);
    }
  }

  const totalUsers = users.length;
  const adminCount = users.filter((u) => u.role === "admin").length;
  const totalCompleted = users.reduce((s, u) => s + u.completedCount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground text-sm gap-2">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading users…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MiniStat icon={<Users className="h-4 w-4" />} label="Total users" value={totalUsers} />
        <MiniStat icon={<Crown className="h-4 w-4" />} label="Admins" value={adminCount} />
        <MiniStat
          icon={<Flame className="h-4 w-4" />}
          label="Total completions"
          value={totalCompleted}
        />
        <MiniStat
          icon={<BarChart3 className="h-4 w-4" />}
          label="Avg progress"
          value={totalUsers > 0 ? Math.round(totalCompleted / totalUsers) : 0}
        />
      </div>

      {/* Users table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border text-sm font-semibold flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          All Users ({totalUsers})
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-muted-foreground">
                <th className="text-left px-4 py-2 font-medium">User</th>
                <th className="text-left px-4 py-2 font-medium">Role</th>
                <th className="text-center px-4 py-2 font-medium">Completed</th>
                <th className="text-center px-4 py-2 font-medium">Bookmarks</th>
                <th className="text-left px-4 py-2 font-medium">Joined</th>
                <th className="text-right px-4 py-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="font-medium">{u.displayName || "—"}</div>
                    <div className="text-xs text-muted-foreground">{u.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${u.role === "admin" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}
                    >
                      {u.role === "admin" ? (
                        <Shield className="h-3 w-3" />
                      ) : (
                        <UserX className="h-3 w-3" />
                      )}
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center gap-1 text-xs">
                      <Flame className="h-3 w-3 text-green-500" />
                      {u.completedCount}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center gap-1 text-xs">
                      <Bookmark className="h-3 w-3 text-amber-500" />
                      {u.bookmarkCount}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => toggleAdmin(u.id, u.role)}
                      disabled={busy === u.id || u.email === "anandu2109@gmail.com"}
                      className={`text-xs inline-flex items-center gap-1 px-2 py-1 rounded-md border ${u.role === "admin" ? "border-destructive/40 text-destructive hover:bg-destructive/5" : "border-primary/40 text-primary hover:bg-primary/5"} disabled:opacity-50`}
                      title={
                        u.email === "anandu2109@gmail.com" ? "Super admin cannot be demoted" : ""
                      }
                    >
                      {busy === u.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : u.role === "admin" ? (
                        <ShieldOff className="h-3 w-3" />
                      ) : (
                        <Shield className="h-3 w-3" />
                      )}
                      {u.role === "admin" ? "Remove admin" : "Make admin"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function MiniStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="mt-2 text-2xl font-bold">{value}</div>
    </div>
  );
}
