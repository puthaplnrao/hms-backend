const path = require("path");
const rfs = require("rotating-file-stream");

// Create a rotating write stream
const accessLogStream = rfs.createStream(
  (time, index) => {
    if (!time) return "access.log"; // fallback

    const year = time.getFullYear();
    const month = String(time.getMonth() + 1).padStart(2, "0");
    const day = String(time.getDate()).padStart(2, "0");

    return `access-${year}-${month}-${day}.log`;
  },
  {
    interval: "1d", // rotate daily
    path: path.join(__dirname, "logs"),
    maxFiles: 7, // optional: keep only last 7 logs
    compress: "gzip", // compress older logs
  }
);

module.exports = accessLogStream;
