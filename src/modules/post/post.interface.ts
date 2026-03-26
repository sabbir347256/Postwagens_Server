import { Model, Types } from 'mongoose';
export interface IImageAndVideo {
  type: 'image' | 'video';
  url: string;
}

export type TPost = {
  userId: Types.ObjectId;
  text: string;
  imagesAndVideos?: IImageAndVideo[];
};

export type PostModel = Model<TPost, Record<string, unknown>>;