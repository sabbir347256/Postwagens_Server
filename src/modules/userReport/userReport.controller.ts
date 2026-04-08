import { Request, Response } from "express";
import BlockedUserModel from "../userBlocked/userBlocked.model";
import ReportedUserModel from "./userReport.model";
import Post from "../post/post.model";
import Listing from "../listing/listing.model";
import User from "../users/user.model";
import { JwtPayload } from "jsonwebtoken";
import { Follow } from "../follow/follow.model";

// export const reportUser = async (req: Request, res: Response) => {
//   try {
//     const { type, id, report, blockedId } = req.body;
//     let userToReport: any;
//     let targetBlockedId: string | undefined;

//     if (type === "post") {
//       userToReport = await Post.findById(id);
//       targetBlockedId = userToReport?.userId;
//     } else if (type === "listing") {
//       userToReport = await Listing.findById(id);
//       targetBlockedId = userToReport?.sellerId;
//     } else if (type === "user") {
//       userToReport = await User.findById(id);
//       targetBlockedId = id;
//     }

//     if (!userToReport) {
//       return res.status(404).json({ message: `${type} not found` });
//     }

//     const reportedUser = new ReportedUserModel({
//       id,
//       type,
//       report,
//       blockedId,
//       userId: targetBlockedId,
//     });

//     await reportedUser.save();

//     if (blockedId) {
//       const blockerUser = req.user as JwtPayload;
//       const blockerID = blockerUser.userId;

//       const blockUser = new BlockedUserModel({
//         blockerUserid: blockerID,
//         blockedUserid: targetBlockedId,
//         isBlocked: true,
//       });

//       await blockUser.save();

//       const followRelationship = await Follow.findOne({
//         follower: blockerID,
//       });

//       if (followRelationship) {
//         await Follow.deleteOne({ _id: followRelationship._id });

//         return res
//           .status(200)
//           .json({
//             message: "User reported, blocked, and follow relationship removed",
//           });
//       }

//       return res
//         .status(200)
//         .json({ message: "User reported and blocked successfully" });
//     }

//     return res.status(200).json({ message: "User reported successfully" });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// };


export const reportUser = async (req: Request, res: Response) => {
  try {
    const { type, id, report, blockedId } = req.body;
     let reportType;
    let userToReport: any;
    let targetBlockedId: string | undefined;

    // Step 1: Check the type and find the target user
    if (type === "post") {
      reportType = 'post'
      userToReport = await Post.findById(id);
      targetBlockedId = userToReport?.userId;
    } else if (type === "listing") {
      reportType = 'listing'
      userToReport = await Listing.findById(id);
      targetBlockedId = userToReport?.sellerId;
    } else if (type === "user") {
      reportType ='user'
      userToReport = await User.findById(id);
      targetBlockedId = id;
    }

    if (!userToReport) {
      return res.status(404).json({ message: `${type} not found` });
    }

    // Step 2: Check if the user has already reported this user within 30 minutes
    const blockerUser = req.user as JwtPayload;
    const blockerID = blockerUser.userId;

    const lastReported = await ReportedUserModel.findOne({
      userId: targetBlockedId,
      report: report,  // Assuming you're passing the report reason here.
      // userId: blockerID,
      createdAt: { $gte: new Date(Date.now() - 30 * 60 * 1000) } // Check if the last report was within the last 30 minutes
    });

    if (lastReported) {
      return res.status(400).json({
        message: `You can only report this ${reportType} once every 30 minutes.`
      });
    }

    // Step 3: Save the report in the database
    const reportedUser = new ReportedUserModel({
      id,
      type,
      report,
      blockedId,
      userId: targetBlockedId,
    });

    await reportedUser.save();

    // Step 4: Handle blocking and follow relationship removal
    if (blockedId) {
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

        return res.status(200).json({
          message: "User reported, blocked, and follow relationship removed",
        });
      }

      return res.status(200).json({ message: "User reported and blocked successfully" });
    }

    return res.status(200).json({ message: "User reported successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};