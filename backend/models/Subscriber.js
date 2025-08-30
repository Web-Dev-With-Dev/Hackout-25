import mongoose from "mongoose";

const subscriberSchema = new mongoose.Schema({
  email: { type: String },
  phone: { type: String },
  area: { type: String },
  kinds: [{ type: String, enum: ["storm", "surge", "pollution"] }]
}, { timestamps: true });

export default mongoose.model("Subscriber", subscriberSchema);
