import mongoose from "mongoose";

const stationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ["tide", "weather", "pollution"], required: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  meta: { type: Object } 
}, { timestamps: true });

export default mongoose.model("Station", stationSchema);
