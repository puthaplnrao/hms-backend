const fs = require("fs");
const path = require("path");
const morgan = require("morgan");
const rfs = require("rotating-file-stream");

// Create /logs directory if it doesn't exist
const logDirectory = path.join(__dirname, "../logs");
if (!fs.existsSync(logDirectory)) fs.mkdirSync(logDirectory);

// 🔁 Rotating access log stream
const accessLogStream = rfs.createStream(
  (time, index) => {
    if (!time) return "access.log";
    const year = time.getFullYear();
    const month = String(time.getMonth() + 1).padStart(2, "0");
    const day = String(time.getDate()).padStart(2, "0");
    return `access-${year}-${month}-${day}.log`;
  },
  {
    interval: "1d",
    path: logDirectory,
    maxFiles: 7,
    compress: "gzip",
  }
);

// 📝 Physical log for each request
const requestLogStream = fs.createWriteStream(
  path.join(logDirectory, "request.log"),
  { flags: "a" }
);

// Morgan logger for rotating access logs
const accessLogger = morgan("combined", { stream: accessLogStream });

// Morgan logger for request logs
const requestLogger = morgan(
  (tokens, req, res) => {
    return [
      `[${new Date().toISOString()}]`,
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens["response-time"](req, res),
      "ms",
      `User-Agent: ${req.headers["user-agent"]}`,
      `IP: ${req.ip}`,
    ].join(" | ");
  },
  { stream: requestLogStream }
);

module.exports = {
  accessLogger,
  requestLogger,
};
