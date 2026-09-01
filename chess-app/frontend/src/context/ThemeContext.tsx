import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  DEFAULT_BLACK_THEME,
  DEFAULT_WHITE_THEME,
  PIECE_THEMES,
  PieceThemeOption,
} from "../lib/pieceThemes";

type Mode = "light" | "dark";

interface ThemeContextValue {
  mode: Mode;
  toggleMode: () => void;
  whitePieceThemeId: string;
  blackPieceThemeId: string;
  setWhitePieceThemeId: (id: string) => void;
  setBlackPieceThemeId: (id: string) => void;
  whitePalette: PieceThemeOption["white"];
  blackPalette: PieceThemeOption["black"];
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function readInitialMode(): Mode {
  if (typeof window === "undefined") return "light";
  const stored = window.localStorage.getItem("chess:mode");
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<Mode>(readInitialMode);
  const [whitePieceThemeId, setWhitePieceThemeId] = useState(
    () => window.localStorage.getItem("chess:whiteTheme") || DEFAULT_WHITE_THEME
  );
  const [blackPieceThemeId, setBlackPieceThemeId] = useState(
    () => window.localStorage.getItem("chess:blackTheme") || DEFAULT_BLACK_THEME
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", mode === "dark");
    window.localStorage.setItem("chess:mode", mode);
  }, [mode]);

  useEffect(() => {
    window.localStorage.setItem("chess:whiteTheme", whitePieceThemeId);
  }, [whitePieceThemeId]);

  useEffect(() => {
    window.localStorage.setItem("chess:blackTheme", blackPieceThemeId);
  }, [blackPieceThemeId]);

  const whiteTheme = PIECE_THEMES.find((t) => t.id === whitePieceThemeId) || PIECE_THEMES[0];
  const blackTheme = PIECE_THEMES.find((t) => t.id === blackPieceThemeId) || PIECE_THEMES[0];

  const value: ThemeContextValue = {
    mode,
    toggleMode: () => setMode((m) => (m === "light" ? "dark" : "light")),
    whitePieceThemeId,
    blackPieceThemeId,
    setWhitePieceThemeId,
    setBlackPieceThemeId,
    whitePalette: whiteTheme.white,
    blackPalette: blackTheme.black,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
