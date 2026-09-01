import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center space-y-3">
      <h1 className="font-display text-3xl">Page not found</h1>
      <p className="text-sm text-ink-muted">That square is off the board.</p>
      <Link to="/" className="inline-block text-brass font-medium hover:underline">
        Back to the game
      </Link>
    </div>
  );
}
