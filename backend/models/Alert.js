import mongoose from "mongoose";

const alertSchema = new mongoose.Schema({
  area: String,
  center: {
    lat: Number,
    lng: Number
  },
  kind: { type: String, enum: ["storm", "surge", "pollution"], required: true },
  severity: { type: String, enum: ["low", "med", "high"], required: true },
  ts: { type: Date, default: Date.now },
  summary: String,
  details: Object,
  acknowledged: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model("Alert", alertSchema);
