// @/models/History.ts
import mongoose, { Document, Model, Schema } from "mongoose";

export interface IMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface IHistory {
  titleId: mongoose.Types.ObjectId;
  messages: IMessage[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IHistoryDocument extends IHistory, Document {}

const MessageSchema = new Schema<IMessage>(
  {
    role: {
      type: String,
      enum: ["user", "assistant", "system"],
      required: true,
    },
    content: { type: String, required: true },
  },
  { _id: false },
);

const HistorySchema: Schema<IHistoryDocument> = new Schema(
  {
    titleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Title",
      required: true,
    },
    messages: [MessageSchema],
  },
  { timestamps: true },
);

const History: Model<IHistoryDocument> =
  (mongoose.models.History as Model<IHistoryDocument>) ||
  mongoose.model<IHistoryDocument>("History", HistorySchema);

export default History;
