import mongoose, { Schema, Document, Types } from "mongoose";

export interface IProgress extends Document {
  userId: Types.ObjectId;
  moduls: {
    nama: string;
    bagian: {
      nama: string;
      deskripsi: string;
      progress: number;
      terkunci: boolean;
    }[];
  }[];
}

const ProgressSchema = new Schema<IProgress>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    moduls: [
      {
        nama: { type: String, required: true },
        bagian: [
          {
            nama: { type: String, required: true },
            deskripsi: { type: String, required: true },
            progress: { type: Number, default: 0 },
            terkunci: { type: Boolean, default: true },
          },
        ],
      },
    ],
  },
  { timestamps: true },
);

export default mongoose.models.Progress ||
  mongoose.model<IProgress>("Progress", ProgressSchema);
