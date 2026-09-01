export interface PiecePalette {
  primary: string;
  secondary: string;
  outline: string;
}

export interface PieceThemeOption {
  id: string;
  label: string;
  swatch: string;
  white: PiecePalette;
  black: PiecePalette;
}

// Each option is a ready-made, high-contrast coordinated set. White and black
// sides can be picked independently in the UI — these are just sensible pairings.
export const PIECE_THEMES: PieceThemeOption[] = [
  {
    id: "classic",
    label: "Classic Ivory & Ebony",
    swatch: "linear-gradient(135deg, #f5efdf 50%, #2a241d 50%)",
    white: { primary: "#f7f1e2", secondary: "#d8c8a2", outline: "#2b2016" },
    black: { primary: "#2b2420", secondary: "#4a4139", outline: "#0f0c09" },
  },
  {
    id: "gold-silver",
    label: "Gold & Silver",
    swatch: "linear-gradient(135deg, #e7c265 50%, #c7ccd6 50%)",
    white: { primary: "#f0d488", secondary: "#b8862f", outline: "#5c3f0d" },
    black: { primary: "#c3c9d4", secondary: "#7d8494", outline: "#2c313b" },
  },
  {
    id: "neon",
    label: "Vibrant Neon",
    swatch: "linear-gradient(135deg, #58f0d7 50%, #ff4fd8 50%)",
    white: { primary: "#5df0da", secondary: "#0f9e8a", outline: "#053b33" },
    black: { primary: "#ff5fdb", secondary: "#a11f8a", outline: "#3e0a34" },
  },
  {
    id: "forest",
    label: "Forest",
    swatch: "linear-gradient(135deg, #bfe0a1 50%, #234425 50%)",
    white: { primary: "#c9e6ab", secondary: "#7fa860", outline: "#233a1c" },
    black: { primary: "#27431f", secondary: "#4c6b3d", outline: "#0f1c0b" },
  },
  {
    id: "ocean",
    label: "Ocean",
    swatch: "linear-gradient(135deg, #9fd8e6 50%, #0d3b52 50%)",
    white: { primary: "#a9e0ec", secondary: "#4691a8", outline: "#123542" },
    black: { primary: "#0e3d55", secondary: "#1f6580", outline: "#051820" },
  },
  {
    id: "ruby-sapphire",
    label: "Ruby & Sapphire",
    swatch: "linear-gradient(135deg, #e0555a 50%, #3457c9 50%)",
    white: { primary: "#e5686d", secondary: "#a72128", outline: "#420c0f" },
    black: { primary: "#354fb8", secondary: "#1e2f7e", outline: "#0c1440" },
  },
];

export const DEFAULT_WHITE_THEME = "classic";
export const DEFAULT_BLACK_THEME = "classic";
