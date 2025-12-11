// src/utils/logger.js
import colors from "./colors.js";

const timestamp = () => {
  const now = new Date();
  return now.toISOString().replace("T", " ").split(".")[0];
};

const logger = {
  info: (msg) => {
    console.log(`${colors.cyanText("[INFO]")} ${colors.dim(`[${timestamp()}]`)} ${msg}`);
  },
  success: (msg) => {
    console.log(`${colors.greenText("[SUCCESS]")} ${colors.dim(`[${timestamp()}]`)} ${msg}`);
  },
  warn: (msg) => {
    console.log(`${colors.yellowText("[WARNING]")} ${colors.dim(`[${timestamp()}]`)} ${msg}`);
  },
  error: (msg) => {
    console.log(`${colors.redText("[ERROR]")} ${colors.dim(`[${timestamp()}]`)} ${msg}`);
  },
  custom: (tag, color, msg) => {
    const tagStyled = colors.colorize(`[${tag}]`, color);
    console.log(`${tagStyled} ${colors.dim(`[${timestamp()}]`)} ${msg}`);
  },
};

// named exports
export const info = logger.info;
export const success = logger.success;
export const warn = logger.warn;
export const error = logger.error;
export const custom = logger.custom;

// default export
export default logger;
