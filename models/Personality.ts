// @/models/Personality.ts
import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IPersonality extends Document {
  userId: Types.ObjectId;
  kreatifitas: number;
  keberanian: number;
  empati: number;
  kerjaSama: number;
  tanggungJawab: number;
  hobiDanMinat: string;
  createdAt: Date;
  updatedAt: Date;
}

const PersonalitySchema: Schema<IPersonality> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    kreatifitas: { type: Number },
    keberanian: { type: Number },
    empati: { type: Number },
    kerjaSama: { type: Number },
    tanggungJawab: { type: Number },
    hobiDanMinat: { type: String },
  },
  { timestamps: true },
);

const Personality: Model<IPersonality> =
  mongoose.models.Personality ||
  mongoose.model<IPersonality>("Personality", PersonalitySchema);

export default Personality;
