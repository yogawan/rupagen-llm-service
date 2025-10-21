// @/models/Stats.ts
import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IStats extends Document {
  userId: Types.ObjectId;
  streakActive: boolean;
  streakCount: number;
  point: number;
  xp: number;
  createdAt: Date;
  updatedAt: Date;
}

const StatsSchema = new Schema<IStats>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    streakActive: {
      type: Boolean,
      default: false,
    },
    streakCount: {
      type: Number,
      default: 0,
    },
    point: {
      type: Number,
      default: 0,
    },
    xp: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

const Stats: Model<IStats> =
  mongoose.models.Stats || mongoose.model<IStats>("Stats", StatsSchema);

export default Stats;
