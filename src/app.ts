// app.ts

import express, { Application, Request, Response } from "express";
import router from "./Routes/routes";
import globalErrorHandler from "./Middleware/globalErrorHandler";
import notFound from "./Middleware/notFound";
import cookieParser from "cookie-parser";
import cors from "cors";

const app: Application = express();
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
  res.send({
    Message: "Socket.io Server Running",
  });
});

app.use("/api/v1", router);
app.use(globalErrorHandler);
app.use(notFound);
// global.onlineUsers= new Map();

export default app;
