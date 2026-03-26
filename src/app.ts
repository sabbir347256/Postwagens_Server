import express, { Application, Response} from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import env from "./config/env";
import './config/passport.config';
import { router } from "./routes";
import { globalErrorHandler } from "./middlewares/globalErrorHandler";
import { NotFound } from "./middlewares/NotFound";

const app: Application = express();

app.set('trust proxy', 1);
app.use(cors());
app.use(express.json());
app.use(morgan("combined"));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
// app.use(safeSanitizeMiddleware);

// THROTTLING
const limiter = rateLimit({
  windowMs: env.REQUEST_RATE_LIMIT_TIME * 60 * 1000, // Assuming time in minutes from env
  max: env.REQUEST_RATE_LIMIT,
  message: {
    success: false,
    statusCode: 400,
    message: 'Too many requests, please try again later.',
  },
});

app.use(limiter);

// GLOBAL ROUTES
app.use('/api/v1', router);

// Routes
app.get("/", (_, res: Response) => {
  res.json({
    status: "success",
    message: "I am alive! 🎉",
  })
});

// NO ROUTE MATCH
app.use(NotFound);

// GLOBAL ERROR HANDLER
app.use(globalErrorHandler);

export default app;
