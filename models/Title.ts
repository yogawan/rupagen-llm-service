// @/models/Title.ts
import mongoose, { Document, Model, Schema } from "mongoose";

export interface ITitle {
  userId: mongoose.Types.ObjectId;
  title: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ITitleDocument extends ITitle, Document {}

const TitleSchema: Schema<ITitleDocument> = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true, trim: true },
  },
  { timestamps: true },
);

const Title: Model<ITitleDocument> =
  (mongoose.models.Title as Model<ITitleDocument>) ||
  mongoose.model<ITitleDocument>("Title", TitleSchema);

export default Title;
