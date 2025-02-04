export const COLORS = {
  black: "#002b36",
  blue: "#268bd2",
  cyan: "#2aa198",
  green: "#859900",
  purple: "#6c71c4",
  red: "#dc322f",
  white: "#fdf6e3",
  yellow: "#b58900",
} as const;

export type ColorName = keyof typeof COLORS;

export interface ColoredText {
  text: string;
  color?: ColorName | string;
  href?: string;
  deleteDelay?: number;
}

export type ContentItem = string | ColoredText | (string | ColoredText)[];

export interface TerminalLine {
  type:
    | "input"
    | "output"
    | "progress"
    | "percentage-output"
    | "disappearing-input";
  content: ContentItem | ContentItem[];
  prompt?: string;
  typeDelay?: number;
  charDelay?: number;
  deleteDelay?: number;
  progressDuration?: number;
  finishDelay?: number;
  percentages?: { start: number; end: number; duration?: number }[];
}
