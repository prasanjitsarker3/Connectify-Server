import express from "express";
import { messageController } from "./messageController";
import auth from "../../Middleware/auth";
import { UserRole } from "@prisma/client";

const router = express.Router();
router.get(
  "/user-sidebar",
  auth(UserRole.user, UserRole.admin),
  messageController.getUserForSidebar
);
router.get(
  "/:id",
  auth(UserRole.user, UserRole.admin),
  messageController.getMessage
);

router.post(
  "/send",
  auth(UserRole.user, UserRole.admin),
  messageController.sendMessage
);

export const messageRoute = router;
