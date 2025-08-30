import express from "express";
import Reading from "../models/Reading.js";
const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const reading = await Reading.create(req.body);
    res.json(reading);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/", async (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  res.json(await Reading.find().sort({ ts: -1 }).limit(limit));
});

router.get("/station/:id", async (req, res) => {
  res.json(await Reading.find({ stationId: req.params.id }).sort({ ts: -1 }).limit(100));
});

export default router;
