import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { googleLoginUrl } from "../../api/client";
import ThemeSwitcher from "../panel/ThemeSwitcher";

export default function Header() {
  const { user, loading, logout } = useAuth();
  const location = useLocation();

  return (
    <header className="border-b border-black/5 dark:border-white/5">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <span className="font-display text-xl sm:text-2xl tracking-tight">Endgame</span>
        </Link>

        <nav className="flex items-center gap-3 sm:gap-4">
          {user?.role === "admin" && (
            <Link
              to="/admin"
              className={[
                "text-sm font-medium px-2 py-1 rounded transition-colors",
                location.pathname.startsWith("/admin")
                  ? "text-brass"
                  : "text-ink-muted hover:text-ink",
              ].join(" ")}
            >
              Admin
            </Link>
          )}

          <ThemeSwitcher />

          {!loading &&
            (user ? (
              <div className="flex items-center gap-2">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt=""
                    className="w-8 h-8 rounded-full ring-1 ring-black/10"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="w-8 h-8 rounded-full bg-brass/30 flex items-center justify-center text-xs font-semibold">
                    {user.name?.[0]?.toUpperCase() ?? "?"}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => logout()}
                  className="text-sm text-ink-muted hover:text-ink transition-colors"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <a
                href={googleLoginUrl}
                className="text-sm font-medium px-3 py-1.5 rounded-md bg-brass text-white hover:brightness-110 transition"
              >
                Sign in
              </a>
            ))}
        </nav>
      </div>
    </header>
  );
}
