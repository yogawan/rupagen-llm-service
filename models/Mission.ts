// @/models/Mission.ts
import mongoose, { Schema, Document, Types } from "mongoose";

export interface IMission extends Document {
  userId: Types.ObjectId;
  ajakNgobrolDino: boolean;
  lakukanHobimuHariIni: boolean;
  hubungkanAkunmuDenganOrangTua: boolean;
  point: number;
  lastResetDailyWIB?: string | null;
  lastResetMonthly?: Date | null;
  lastPointIncrementWIB?: string | null;
  applyResetAndEvaluate: () => Promise<void>;
}

const MissionSchema = new Schema<IMission>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    ajakNgobrolDino: { type: Boolean, default: false },
    lakukanHobimuHariIni: { type: Boolean, default: false },
    hubungkanAkunmuDenganOrangTua: { type: Boolean, default: false },

    point: { type: Number, default: 0, min: 0, max: 30 },

    lastResetDailyWIB: { type: String, default: null },
    lastResetMonthly: { type: Date, default: () => new Date() },
    lastPointIncrementWIB: { type: String, default: null },
  },
  { timestamps: true },
);

function getCurrentWIBDateString(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });
}

function daysBetween(a: Date, b: Date) {
  const msPerDay = 86400000;
  return Math.floor((a.getTime() - b.getTime()) / msPerDay);
}

// auto reset + auto add point
MissionSchema.methods.applyResetAndEvaluate = async function (this: IMission) {
  const now = new Date();
  const nowWIB = getCurrentWIBDateString();
  let dirty = false;

  // Daily Reset
  if (!this.lastResetDailyWIB || this.lastResetDailyWIB !== nowWIB) {
    this.ajakNgobrolDino = false;
    this.lakukanHobimuHariIni = false;
    this.lastResetDailyWIB = nowWIB;
    dirty = true;
  }

  // Monthly Reset (30 days rolling)
  if (!this.lastResetMonthly) {
    this.lastResetMonthly = now;
    dirty = true;
  } else {
    const diff = daysBetween(now, new Date(this.lastResetMonthly));
    if (diff >= 30) {
      this.point = 0;
      this.lastResetMonthly = now;
      dirty = true;
    }
  }

  // Auto Add Point
  const allTrue =
    this.ajakNgobrolDino &&
    this.lakukanHobimuHariIni &&
    this.hubungkanAkunmuDenganOrangTua;

  if (allTrue && this.lastPointIncrementWIB !== nowWIB) {
    if (this.point < 30) {
      this.point++;
    }
    this.lastPointIncrementWIB = nowWIB;
    dirty = true;
  }

  if (dirty) await this.save();
};

// Auto run when data fetched
MissionSchema.post("findOne", async function (doc: IMission) {
  if (doc) await doc.applyResetAndEvaluate();
});

MissionSchema.post("findOneAndUpdate", async function (doc: IMission) {
  if (doc) await doc.applyResetAndEvaluate();
});

export default mongoose.models.Mission ||
  mongoose.model<IMission>("Mission", MissionSchema);
