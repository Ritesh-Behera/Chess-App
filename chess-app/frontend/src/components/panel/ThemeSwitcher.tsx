import { useTheme } from "../../context/ThemeContext";

export default function ThemeSwitcher() {
  const { mode, toggleMode } = useTheme();
  const isDark = mode === "dark";

  return (
    <button
      type="button"
      onClick={toggleMode}
      role="switch"
      aria-checked={isDark}
      aria-label="Toggle dark mode"
      className="relative inline-flex h-8 w-14 items-center rounded-full bg-surface-sunken transition-colors shrink-0"
    >
      <span
        className={[
          "inline-block h-6 w-6 transform rounded-full bg-brass shadow transition-transform flex items-center justify-center text-[0.65rem] text-white",
          isDark ? "translate-x-7" : "translate-x-1",
        ].join(" ")}
      >
        {isDark ? "🌙" : "☀"}
      </span>
    </button>
  );
}
