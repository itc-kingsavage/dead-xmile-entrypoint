// src/utils/colors.js

const colors = {
    reset: "\x1b[0m",

    black: "\x1b[30m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m",
    white: "\x1b[37m",

    bold: "\x1b[1m",
    dim: "\x1b[2m",
    underline: "\x1b[4m",
    blink: "\x1b[5m",

    bgBlack: "\x1b[40m",
    bgRed: "\x1b[41m",
    bgGreen: "\x1b[42m",
    bgYellow: "\x1b[43m",
    bgBlue: "\x1b[44m",
    bgMagenta: "\x1b[45m",
    bgCyan: "\x1b[46m",
    bgWhite: "\x1b[47m",

    colorize(text, color) {
        return `${color}${text}${this.reset}`;
    },

    redText(text) {
        return this.colorize(text, this.red);
    },

    greenText(text) {
        return this.colorize(text, this.green);
    },

    yellowText(text) {
        return this.colorize(text, this.yellow);
    },

    cyanText(text) {
        return this.colorize(text, this.cyan);
    }
};

export default colors;
