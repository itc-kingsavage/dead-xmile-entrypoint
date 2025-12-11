// src/utils/colors.js
// Single canonical colors utility with helpers used by logger and server

export const RESET = "\x1b[0m";
export const DIM = "\x1b[2m";

export const FG = {
  black: "\x1b[30m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
};

export function colorize(text, color) {
  return `${color}${text}${RESET}`;
}

export function cyanText(text) {
  return colorize(text, FG.cyan);
}
export function greenText(text) {
  return colorize(text, FG.green);
}
export function yellowText(text) {
  return colorize(text, FG.yellow);
}
export function redText(text) {
  return colorize(text, FG.red);
}
export function dim(text) {
  return `${DIM}${text}${RESET}`;
}

// Backwards-compatible object (import default)
const defaultExport = {
  RESET,
  DIM,
  FG,
  colorize,
  cyanText,
  greenText,
  yellowText,
  redText,
  dim,
};
export default defaultExport;
