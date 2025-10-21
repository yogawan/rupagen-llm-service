// @/models/Personalization.ts
import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IPersonalization extends Document {
  userId: Types.ObjectId;
  waktuBelajar: string;
  kekurangan: string[];
  kelebihan: string[];
  ceritaSingkat: string;
  createdAt: Date;
  updatedAt: Date;
}

const PersonalizationSchema = new Schema<IPersonalization>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    waktuBelajar: {
      type: String,
      required: true,
      trim: true,
    },
    kekurangan: {
      type: [String],
      default: [],
    },
    kelebihan: {
      type: [String],
      default: [],
    },
    ceritaSingkat: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

const Personalization: Model<IPersonalization> =
  mongoose.models.Personalization ||
  mongoose.model<IPersonalization>("Personalization", PersonalizationSchema);

export default Personalization;
