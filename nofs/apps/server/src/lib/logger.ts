import pino from "pino";
import { join } from "node:path";

const isProduction = process.env.NODE_ENV === "production";

export const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  redact: [
    "req.headers.authorization",
    "req.headers.cookie",
    "res.headers['set-cookie']",
  ],
  ...(isProduction
    ? {}
    : {
        transport: {
          target: require.resolve('pino-pretty'),
          options: { colorize: true },
        },
      }),
});



// import pino from 'pino';

// export const logger = pino({
//   // ... your other options
//   transport: {
//     // 💡 FIXED: Passing the module via require ensures the thread-stream worker 
//     // resolves it globally instead of appending a local /dist/ path on Windows
//     target: require.resolve('pino-pretty'), 
//     options: {
//       colorize: true,
//       translateTime: 'SYS:standard',
//       // ... your other pino-pretty configurations
//     },
//   },
// });
