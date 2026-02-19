import winston from "winston";
import * as shadow from "./date_utils_shadow";

const logger = winston.child({ module: "DateUtils" });

export const DATE_FORMAT = "YYYY-MM-DD HH:mm:ss.SSS";
export const formatDate = shadow.formatDate;
export const getPhdTimestamp = shadow.getPhdTimestamp;
