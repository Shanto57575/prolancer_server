import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
// import { auth } from "./app/utils/auth";
import express, { Application } from "express";
import router from "./app/routes/router";
import cookieParser from "cookie-parser";
import { envConfig } from "./app/config/envConfig";
import { notFound } from "./app/middlewares/notFound";
import { globalErrorHandler } from "./app/middlewares/globalErrorHandler";
// import { toNodeHandler } from "better-auth/node";

const app: Application = express();

// app.use("/api/auth/:path*", toNodeHandler(auth));

app.use(
  express.json({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    verify: (req: any, _res, buf) => {
      req.rawBody = buf;
    },
  })
);

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  cors({
    origin: envConfig.FRONTEND_URL || "*",
    credentials: true,
  })
);

app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: false,
  })
);

app.use(compression());
app.use(morgan("dev"));

app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Prolancer API is running 🚀",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/v1", router);

app.use(notFound);
app.use(globalErrorHandler);

export default app;
