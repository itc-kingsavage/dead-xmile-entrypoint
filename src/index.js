// src/index.js
import { startServer } from "./server.js";
import { logInfo } from "./utils/logger.js";
import colors from "./utils/colors.js";

logInfo(`${colors.CYAN}Booting DEAD-XMILE Scanner...${colors.RESET}`);

startServer();
