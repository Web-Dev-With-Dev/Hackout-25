import express from "express";
import Station from "../models/Station.js";
const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const station = await Station.create(req.body);
    res.json(station);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/", async (req, res) => {
  res.json(await Station.find());
});

router.get("/:id", async (req, res) => {
  res.json(await Station.findById(req.params.id));
});

router.put("/:id", async (req, res) => {
  res.json(await Station.findByIdAndUpdate(req.params.id, req.body, { new: true }));
});

router.delete("/:id", async (req, res) => {
  res.json(await Station.findByIdAndDelete(req.params.id));
});

export default router;
