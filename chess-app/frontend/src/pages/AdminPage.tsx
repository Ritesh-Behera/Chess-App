import { useEffect, useState, useCallback } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { AppUser, GameRecord } from "../types/user";

interface Stats {
  users: number;
  admins: number;
  games: number;
  finished: number;
  inProgress: number;
}

type Tab = "overview" | "users" | "games";

export default function AdminPage() {
  const { user: me } = useAuth();
  const [tab, setTab] = useState<Tab>("overview");
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [games, setGames] = useState<GameRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, u, g] = await Promise.all([
        api.get<Stats>("/api/admin/stats"),
        api.get<{ users: AppUser[] }>("/api/admin/users"),
        api.get<{ games: GameRecord[] }>("/api/admin/games"),
      ]);
      setStats(s);
      setUsers(u.users);
      setGames(g.games);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load admin data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const changeRole = async (id: number, role: "admin" | "user") => {
    try {
      await api.patch(`/api/admin/users/${id}/role`, { role });
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update role.");
    }
  };

  const removeUser = async (id: number) => {
    if (!confirm("Delete this user and all of their saved games?")) return;
    try {
      await api.delete(`/api/admin/users/${id}`);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      setGames((prev) => prev.filter((g) => g.user_id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete user.");
    }
  };

  const removeGame = async (id: number) => {
    if (!confirm("Delete this saved game?")) return;
    try {
      await api.delete(`/api/admin/games/${id}`);
      setGames((prev) => prev.filter((g) => g.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete game.");
    }
  };

  const resetEverything = async () => {
    if (
      !confirm(
        "This deletes every saved game and every non-admin account, resetting the app to a clean slate. Continue?"
      )
    )
      return;
    setResetting(true);
    try {
      await api.post("/api/admin/reset");
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reset failed.");
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl">Admin</h1>
          <p className="text-sm text-ink-muted">Manage players and saved games.</p>
        </div>
        <button
          type="button"
          onClick={resetEverything}
          disabled={resetting}
          className="px-3 py-2 rounded-md bg-garnet text-white text-sm font-medium hover:brightness-110 disabled:opacity-50 transition"
        >
          {resetting ? "Resetting…" : "Reset all data"}
        </button>
      </div>

      <div className="flex gap-1 border-b border-black/5 dark:border-white/5">
        {(["overview", "users", "games"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={[
              "px-3 py-2 text-sm font-medium capitalize border-b-2 -mb-px transition-colors",
              tab === t ? "border-brass text-ink" : "border-transparent text-ink-faint hover:text-ink-muted",
            ].join(" ")}
          >
            {t}
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-garnet bg-garnet/10 rounded-md px-3 py-2">{error}</p>}

      {loading ? (
        <p className="text-sm text-ink-faint">Loading…</p>
      ) : (
        <>
          {tab === "overview" && stats && (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <StatCard label="Players" value={stats.users} />
              <StatCard label="Admins" value={stats.admins} />
              <StatCard label="Saved games" value={stats.games} />
              <StatCard label="Finished" value={stats.finished} />
              <StatCard label="In progress" value={stats.inProgress} />
            </div>
          )}

          {tab === "users" && (
            <div className="rounded-panel bg-surface-raised shadow-panel overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-ink-faint border-b border-black/5 dark:border-white/5">
                    <th className="px-4 py-2.5 font-medium">Player</th>
                    <th className="px-4 py-2.5 font-medium">Email</th>
                    <th className="px-4 py-2.5 font-medium">Role</th>
                    <th className="px-4 py-2.5 font-medium">Joined</th>
                    <th className="px-4 py-2.5" />
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-ink-faint">
                        No players yet.
                      </td>
                    </tr>
                  )}
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-black/5 dark:border-white/5 last:border-0">
                      <td className="px-4 py-2.5 font-medium">{u.name}</td>
                      <td className="px-4 py-2.5 text-ink-muted">{u.email}</td>
                      <td className="px-4 py-2.5">
                        <select
                          value={u.role}
                          onChange={(e) => changeRole(u.id, e.target.value as "admin" | "user")}
                          disabled={u.id === me?.id}
                          className="bg-surface-sunken rounded px-2 py-1 text-sm disabled:opacity-50"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-4 py-2.5 text-ink-muted">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <button
                          type="button"
                          onClick={() => removeUser(u.id)}
                          disabled={u.id === me?.id}
                          className="text-garnet hover:underline disabled:opacity-40 disabled:no-underline text-xs font-medium"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === "games" && (
            <div className="rounded-panel bg-surface-raised shadow-panel overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-ink-faint border-b border-black/5 dark:border-white/5">
                    <th className="px-4 py-2.5 font-medium">Players</th>
                    <th className="px-4 py-2.5 font-medium">Owner</th>
                    <th className="px-4 py-2.5 font-medium">Result</th>
                    <th className="px-4 py-2.5 font-medium">Moves</th>
                    <th className="px-4 py-2.5 font-medium">Saved</th>
                    <th className="px-4 py-2.5" />
                  </tr>
                </thead>
                <tbody>
                  {games.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-6 text-center text-ink-faint">
                        No saved games yet.
                      </td>
                    </tr>
                  )}
                  {games.map((g) => (
                    <tr key={g.id} className="border-b border-black/5 dark:border-white/5 last:border-0">
                      <td className="px-4 py-2.5 font-medium">
                        {g.white_name} vs {g.black_name}
                      </td>
                      <td className="px-4 py-2.5 text-ink-muted">{g.owner_email}</td>
                      <td className="px-4 py-2.5">{g.result}</td>
                      <td className="px-4 py-2.5">{g.move_count}</td>
                      <td className="px-4 py-2.5 text-ink-muted">
                        {new Date(g.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <button
                          type="button"
                          onClick={() => removeGame(g.id)}
                          className="text-garnet hover:underline text-xs font-medium"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-panel bg-surface-raised shadow-panel px-4 py-3">
      <p className="text-2xl font-display">{value}</p>
      <p className="text-xs text-ink-faint mt-0.5">{label}</p>
    </div>
  );
}
