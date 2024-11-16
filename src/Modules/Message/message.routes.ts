import express from "express";
import { messageController } from "./messageController";
import auth from "../../Middleware/auth";
import { UserRole } from "@prisma/client";

const router = express.Router();

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
router.post(
  "/sendimg",
  auth(UserRole.user, UserRole.admin),
  messageController.sendMessageWithImage
);
router.get(
  "/contact/:fromId",
  auth(UserRole.user, UserRole.admin),
  messageController.getInitialContactsWithMessage
);

export const messageRoute = router;
