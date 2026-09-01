import { useSearchParams } from "react-router-dom";
import { googleLoginUrl } from "../api/client";

const ERRORS: Record<string, string> = {
  auth_failed: "Sign-in didn't go through. Please try again.",
  google_not_configured:
    "Google sign-in isn't configured on the server yet. Add GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET to backend/.env.",
};

export default function LoginPage() {
  const [params] = useSearchParams();
  const error = params.get("error");

  return (
    <div className="max-w-sm mx-auto px-4 py-20 text-center space-y-6">
      <div>
        <h1 className="font-display text-3xl mb-2">Sign in</h1>
        <p className="text-sm text-ink-muted">
          Sign in to save your games and, if you're an admin, manage players and matches.
        </p>
      </div>

      {error && (
        <p className="text-sm text-garnet bg-garnet/10 rounded-md px-3 py-2">
          {ERRORS[error] || "Something went wrong signing in."}
        </p>
      )}

      <a
        href={googleLoginUrl}
        className="inline-flex items-center gap-2 justify-center w-full px-4 py-2.5 rounded-md bg-surface-raised shadow-panel font-medium hover:bg-brass/10 transition"
      >
        <GoogleMark />
        Continue with Google
      </a>
    </div>
  );
}

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.62Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.96v2.33A9 9 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.95 10.7A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.17.28-1.7V4.97H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.03l2.99-2.33Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.97l2.99 2.33C4.66 5.17 6.65 3.58 9 3.58Z"
      />
    </svg>
  );
}
