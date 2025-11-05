// @/models/Stats.ts
import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IStats extends Document {
  userId: Types.ObjectId;
  streakActive: boolean;
  streakCount: number;
  point: number;
  xp: number;
  liga: "Perak" | "Silver" | "Emas";
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
      default: true,
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
    liga: {
      type: String,
      enum: ["Perak", "Silver", "Emas"],
      default: "Perak",
    },
  },
  {
    timestamps: true,
  },
);

StatsSchema.pre("save", function (next) {
  const stats = this as IStats;

  // kalau pertama kali create, skip
  if (!stats.updatedAt) return next();

  const lastUpdate = new Date(stats.updatedAt);
  const now = new Date();

  const diffTime = now.getTime() - lastUpdate.getTime();
  const diffDays = diffTime / (1000 * 60 * 60 * 24);

  // lebih dari atau sama dengan 1 hari tanpa update
  if (diffDays >= 1) {
    stats.streakActive = false;
    stats.streakCount = 0;
  }

  next();
});

const Stats: Model<IStats> =
  mongoose.models.Stats || mongoose.model<IStats>("Stats", StatsSchema);

export default Stats;
