import express from "express";
import Alert from "../models/Alert.js";
const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const alert = await Alert.create(req.body);
    res.json(alert);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/", async (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  res.json(await Alert.find().sort({ ts: -1 }).limit(limit));
});

router.put("/:id/ack", async (req, res) => {
  res.json(await Alert.findByIdAndUpdate(req.params.id, { acknowledged: true }, { new: true }));
});

router.delete("/:id", async (req, res) => {
  res.json(await Alert.findByIdAndDelete(req.params.id));
});

export default router;
