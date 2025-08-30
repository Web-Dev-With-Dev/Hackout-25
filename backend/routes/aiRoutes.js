import express from "express";
import { generateTidePredictions, analyzeTideData, analyzeAlertPatterns } from "../services/aiModelService.js";

const router = express.Router();

/**
 * @route GET /api/ai/predictions
 * @desc Get tide predictions for the next X hours
 * @access Public
 */
router.get("/predictions", async (req, res) => {
  try {
    const hours = parseInt(req.query.hours) || 24;
    const stationId = req.query.stationId;
    
    const predictions = await generateTidePredictions(hours, stationId);
    res.json(predictions);
  } catch (err) {
    console.error('Error generating tide predictions:', err);
    res.status(500).json({ error: err.message || 'Failed to generate tide predictions' });
  }
});

/**
 * @route GET /api/ai/analysis
 * @desc Analyze tide data for anomalies and patterns
 * @access Public
 */
router.get("/analysis", async (req, res) => {
  try {
    const stationId = req.query.stationId;
    const days = parseInt(req.query.days) || 7;
    
    const analysis = await analyzeTideData(stationId, days);
    res.json(analysis);
  } catch (err) {
    console.error('Error analyzing tide data:', err);
    res.status(500).json({ error: err.message || 'Failed to analyze tide data' });
  }
});

/**
 * @route GET /api/ai/alert-patterns
 * @desc Analyze alert patterns and provide insights
 * @access Public
 */
router.get("/alert-patterns", async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    
    const patterns = await analyzeAlertPatterns(days);
    res.json(patterns);
  } catch (err) {
    console.error('Error analyzing alert patterns:', err);
    res.status(500).json({ error: err.message || 'Failed to analyze alert patterns' });
  }
});

export default router;