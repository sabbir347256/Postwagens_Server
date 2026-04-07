import { NextFunction, Request, Response } from "express";
import { CatchAsync } from "../../utils/CatchAsync";
import { SendResponse } from "../../utils/SendResponse";
import { blockedService } from "./userBlocked.service";
import jwt, { JwtPayload } from "jsonwebtoken";

const blockUser = CatchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { blockedId } = req.body;

    if (!blockedId) {
      return SendResponse(res, {
        success: false,
        statusCode: 400,
        message: "Missing blocked user ID",
        data: "",
      });
    }

    const blockerUser = req.user as JwtPayload;
    const blockerID = blockerUser.userId;

    const result = await blockedService.blockUser(blockerID, blockedId);

    SendResponse(res, {
      success: true,
      statusCode: 200,
      message: "User blocked successfully",
      data: result,
    });
  },
);

const unblockUser = CatchAsync(async (req: Request, res: Response) => {
  const { blockedId } = req.body;

  if (!blockedId) {
    return SendResponse(res, {
      success: false,
      statusCode: 400,
      message: "Missing blocked user ID",
      data: "",
    });
  }

  const blockerUser = req.user as JwtPayload;
  const blockerID = blockerUser.userId;

  const result = await blockedService.unblockUser(blockerID, blockedId);

  SendResponse(res, {
    success: true,
    statusCode: 200,
    message: "User unblocked successfully",
    data: result,
  });
});

const getAllBlockedUsers = async (req: Request, res: Response) => {
  try {
    const blockerUser = req.user as JwtPayload;
    const blockerID = blockerUser.userId;

    const blockedUsers = await blockedService.getBlockedUsersByUser(blockerID);

    return res.status(200).json({
      success: true,
      message: `${blockedUsers.length} users blocked`,
      data: blockedUsers,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const blockedController = {
  blockUser,
  unblockUser,
  getAllBlockedUsers,
};
