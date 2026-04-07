import { Request, Response } from "express";
import BlockedUserModel from "../userBlocked/userBlocked.model";
import ReportedUserModel from "./userReport.model";
import Post from "../post/post.model";
import Listing from "../listing/listing.model";
import User from "../users/user.model";
import { JwtPayload } from "jsonwebtoken";
import { Follow } from "../follow/follow.model";

export const reportUser = async (req: Request, res: Response) => {
  try {
    const { type, id, report, blockedId } = req.body;
    let userToReport: any;
    let targetBlockedId: string | undefined;

    if (type === "post") {
      userToReport = await Post.findById(id);
      targetBlockedId = userToReport?.userId;
    } else if (type === "list") {
      userToReport = await Listing.findById(id);
      targetBlockedId = userToReport?.sellerId;
    } else if (type === "user") {
      userToReport = await User.findById(id);
      targetBlockedId = id;
    }

    if (!userToReport) {
      return res.status(404).json({ message: `${type} not found` });
    }

    const existingReport = await ReportedUserModel.findOne({
      type,
      id,
      blockedId,
      userId: targetBlockedId,
    });

    if (existingReport) {
      return res
        .status(400)
        .json({ message: "This user has already been reported." });
    }

    const reportedUser = new ReportedUserModel({
      id,
      type,
      report,
      blockedId,
      userId: targetBlockedId,
    });

    await reportedUser.save();

    if (blockedId) {
      const blockerUser = req.user as JwtPayload;
      const blockerID = blockerUser.userId;

      const existingBlock = await BlockedUserModel.findOne({
        blockerUserid: blockerID,
        blockedUserid: targetBlockedId,
      });

      if (existingBlock) {
        return res
          .status(400)
          .json({ message: "This user has already been blocked." });
      }

      const blockUser = new BlockedUserModel({
        blockerUserid: blockerID,
        blockedUserid: targetBlockedId,
        isBlocked: true,
      });

      await blockUser.save();

      const followRelationship = await Follow.findOne({
        follower: blockerID,
      });

      if (followRelationship) {
        await Follow.deleteOne({ _id: followRelationship._id });

        return res
          .status(200)
          .json({
            message: "User reported, blocked, and follow relationship removed",
          });
      }

      return res
        .status(200)
        .json({ message: "User reported and blocked successfully" });
    }

    return res.status(200).json({ message: "User reported successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
