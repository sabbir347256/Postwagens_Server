import express from "express";
import { checkAuth } from "../../middlewares/auth.middleware";
import { Role } from "../users/user.interface";
import { reportUser } from "./userReport.controller";
const router = express.Router();

router.post("/userReport", checkAuth(...Object.values(Role)),reportUser);

export const userReport = router;
