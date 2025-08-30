import mongoose from "mongoose";

const readingSchema = new mongoose.Schema({
  stationId: { type: mongoose.Schema.Types.ObjectId, ref: "Station", required: true },
  ts: { type: Date, default: Date.now, index: true },
  metrics: {
    tide_m: Number,
    wind_mps: Number,
    rain_mm: Number,
    salinity_ppt: Number,
    turbidity_NTU: Number
  }
}, { timestamps: true });

export default mongoose.model("Reading", readingSchema);
