

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import axios from 'axios';
import { promisify } from 'util';

// Get current file directory with ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to Python scripts
const ANALYSIS_DIR = path.join(__dirname, '..', '..', 'analysis');
const TIDE_PREDICTION_SCRIPT = path.join(ANALYSIS_DIR, 'tide_prediction_model.py');
const ALERT_THRESHOLD_SCRIPT = path.join(ANALYSIS_DIR, 'alert_threshold_optimization.py');
const ALERT_PATTERN_SCRIPT = path.join(ANALYSIS_DIR, 'alert_pattern_analysis.py');

// Flag to track if environment has been verified
let environmentVerified = false;


async function verifyPythonEnvironment() {
  if (environmentVerified) return true;
  
  try {
    const pythonExecutable = process.platform === 'win32' ? 'python' : 'python3';
    
    // Check if Python is installed
    const checkPython = spawn(pythonExecutable, ['--version']);
    
    return new Promise((resolve, reject) => {
      let versionOutput = '';
      let errorOutput = '';
      
      checkPython.stdout.on('data', (data) => {
        versionOutput += data.toString();
      });
      
      checkPython.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });
      
      checkPython.on('close', (code) => {
        if (code !== 0) {
          console.error(`Python check failed: ${errorOutput}`);
          return reject(new Error('Python is not installed or not in PATH'));
        }
        
        console.log(`Python environment verified: ${versionOutput.trim()}`);
        environmentVerified = true;
        resolve(true);
      });
      
      checkPython.on('error', (error) => {
        console.error('Failed to start Python process:', error);
        reject(new Error('Failed to start Python process'));
      });
    });
  } catch (error) {
    console.error('Error verifying Python environment:', error);
    throw new Error(`Python environment verification failed: ${error.message}`);
  }
}


async function generateTidePredictions(hours = 24, stationId = null) {
  try {
    // For testing purposes, generate mock predictions
    // In production, this would call the Python model
    const now = new Date();
    const predictions = [];
    
    for (let i = 0; i < hours; i++) {
      const timestamp = new Date(now.getTime() + i * 60 * 60 * 1000);
      
      // Generate a sine wave pattern with some randomness
      const baseHeight = 1.5; // Base tide height in meters
      const amplitude = 0.7; // Tide amplitude
      const period = 12.4; // Approximate tidal period in hours
      
      // Calculate height using sine wave with some randomness
      const height = baseHeight + 
                     amplitude * Math.sin((i / period) * 2 * Math.PI) + 
                     (Math.random() * 0.2 - 0.1); // Add small random variation
      
      predictions.push({
        timestamp: timestamp.toISOString(),
        height: parseFloat(height.toFixed(2)),
        type: height > baseHeight ? 'high' : 'low'
      });
    }
    
    return predictions;
  } catch (error) {
    console.error('Error generating tide predictions:', error);
    throw error;
  }
}


async function getOptimizedThresholds() {
  try {
    // For testing purposes, return mock optimized thresholds
    // In production, this would call the Python model
    return {
      HIGH_TIDE: 2.3,
      STORM_SURGE: 2.8,
      COASTAL_FLOODING: 3.2,
      WIND_SPEED: 13.5,
      RAINFALL: 8.5,
      TURBIDITY: 22.5
    };
  } catch (error) {
    console.error('Error getting optimized thresholds:', error);
    throw error;
  }
}


async function analyzeTideData(stationId, days = 7) {
  try {
    // For testing purposes, return mock analysis
    // In production, this would call the Python model
    
    // Mock tide data for testing
    const tideData = Array.from({ length: days * 24 }, (_, i) => {
      const now = new Date();
      const timestamp = new Date(now.getTime() - (i * 60 * 60 * 1000));
      const height = 1.5 + Math.sin(i / 12 * Math.PI) * 0.7 + (Math.random() * 0.2 - 0.1);
      return { timestamp: timestamp.toISOString(), height, stationId };
    });
    
    
    const heights = tideData.map(reading => reading.height);
    const avg = heights.reduce((sum, h) => sum + h, 0) / heights.length;
    const max = Math.max(...heights);
    const min = Math.min(...heights);
    const range = max - min;
    
    
    const anomalies = tideData.filter(reading => {
      return Math.abs(reading.height - avg) > range * 0.4;
    });
    
    return {
      statistics: {
        average: parseFloat(avg.toFixed(2)),
        maximum: parseFloat(max.toFixed(2)),
        minimum: parseFloat(min.toFixed(2)),
        range: parseFloat(range.toFixed(2))
      },
      anomalies: anomalies.map(a => ({
        timestamp: a.timestamp,
        height: a.height,
        deviation: parseFloat((a.height - avg).toFixed(2))
      })),
      trend: range > 1.5 ? 'high_variability' : 'stable',
      riskLevel: max > 3.0 ? 'high' : max > 2.5 ? 'medium' : 'low'
    };
  } catch (error) {
    console.error('Error analyzing tide data:', error);
    throw error;
  }
}

/**
 * Analyze alert patterns to identify trends
 * @param {Number} days - Number of days of alert data to analyze
 * @returns {Promise<Object>} - Analysis results
 */
async function analyzeAlertPatterns(days = 30) {
  try {
    
    const alertTypes = ['HIGH_TIDE', 'STORM_SURGE', 'COASTAL_FLOODING', 'WIND_SPEED', 'RAINFALL', 'TURBIDITY'];
    const severities = ['low', 'medium', 'high'];
    
    const alertData = Array.from({ length: days * 3 }, (_, i) => {
      const now = new Date();
      const timestamp = new Date(now.getTime() - (i * 8 * 60 * 60 * 1000));
      return {
        id: `alert-${i}`,
        type: alertTypes[Math.floor(Math.random() * alertTypes.length)],
        severity: severities[Math.floor(Math.random() * severities.length)],
        timestamp: timestamp.toISOString(),
        acknowledged: Math.random() > 0.3
      };
    });
    
   
    const typeCount = {};
    alertData.forEach(alert => {
      typeCount[alert.type] = (typeCount[alert.type] || 0) + 1;
    });
    
    
    const severityCount = {};
    alertData.forEach(alert => {
      severityCount[alert.severity] = (severityCount[alert.severity] || 0) + 1;
    });
    
   
    const acknowledged = alertData.filter(a => a.acknowledged).length;
    const ackRate = (acknowledged / alertData.length) * 100;
    
    return {
      totalAlerts: alertData.length,
      byType: typeCount,
      bySeverity: severityCount,
      acknowledgmentRate: parseFloat(ackRate.toFixed(2)),
      mostCommonType: Object.entries(typeCount).sort((a, b) => b[1] - a[1])[0]?.[0] || 'none',
      recommendations: [
        'Monitor high severity alerts more closely',
        'Improve acknowledgment rate for faster response',
        'Focus on most common alert types for system optimization'
      ]
    };
  } catch (error) {
    console.error('Error analyzing alert patterns:', error);
    throw error;
  }
}


async function runPythonScript(scriptPath, args = []) {
  return new Promise((resolve, reject) => {
    try {
      // Check if the script exists
      if (!fs.existsSync(scriptPath)) {
        return reject(new Error(`Python script not found: ${scriptPath}`));
      }
      
      // Validate Python environment
      const pythonExecutable = process.platform === 'win32' ? 'python' : 'python3';
      
      // Set timeout for long-running scripts (5 minutes)
      const timeout = setTimeout(() => {
        if (pythonProcess && !pythonProcess.killed) {
          pythonProcess.kill();
          reject(new Error('Python script execution timed out after 5 minutes'));
        }
      }, 5 * 60 * 1000);
      
     
      const pythonProcess = spawn(pythonExecutable, [scriptPath, ...args]);
      
      let output = '';
      let errorOutput = '';
      
     
      pythonProcess.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      
      pythonProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });
      
      
      pythonProcess.on('close', (code) => {
        clearTimeout(timeout);
        if (code !== 0) {
          return reject(new Error(`Python script exited with code ${code}: ${errorOutput}`));
        }
        
       
        try {
          const jsonOutput = JSON.parse(output);
          resolve(jsonOutput);
        } catch (e) {
          
          resolve(output);
        }
      });
      
     
      pythonProcess.on('error', (error) => {
        clearTimeout(timeout);
        reject(new Error(`Failed to execute Python script: ${error.message}`));
      });
    } catch (error) {
      reject(new Error(`Unexpected error running Python script: ${error.message}`));
    }
  });
}

export {
  generateTidePredictions,
  getOptimizedThresholds,
  analyzeTideData,
  analyzeAlertPatterns
};
