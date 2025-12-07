import { Model, Types } from "mongoose";

export interface IMessage {
  _id?: string;
  senderId: Types.ObjectId;
  content: string;
  attachments?: {
    name: string;
    url: string;
    type: string;
    size?: number;
  }[];
  createdAt?: Date;
}

export interface IChatRoom {
  jobId: Types.ObjectId;
  clientId: Types.ObjectId;
  freelancerId: Types.ObjectId;
  messages: IMessage[];
  status: "active" | "archived";
  createdAt?: Date;
  updatedAt?: Date;
}

export type ChatRoomModel = Model<IChatRoom>;
