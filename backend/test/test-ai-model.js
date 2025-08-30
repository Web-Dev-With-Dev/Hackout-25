import { generateTidePredictions, analyzeTideData, analyzeAlertPatterns } from '../services/aiModelService.js';

console.log('Testing AI Model Integration...');

// Test tide predictions
console.log('Testing tide predictions...');
generateTidePredictions('STATION001')
  .then(predictions => {
    console.log('Tide predictions successful!');
    console.log(`Received ${predictions.length} prediction points`);
  })
  .catch(err => {
    console.error('Tide predictions failed:', err.message);
  });

// Test tide data analysis
console.log('\nTesting tide data analysis...');
analyzeTideData()
  .then(analysis => {
    console.log('Tide data analysis successful!');
    console.log(`Analysis contains ${analysis.anomalies.length} anomalies`);
    console.log(`Risk level: ${analysis.riskLevel}`);
  })
  .catch(err => {
    console.error('Tide data analysis failed:', err.message);
  });

// Test alert pattern analysis
console.log('\nTesting alert pattern analysis...');
analyzeAlertPatterns()
  .then(patterns => {
    console.log('Alert pattern analysis successful!');
    console.log(`Total alerts analyzed: ${patterns.totalAlerts}`);
    console.log(`Most common alert type: ${patterns.mostCommonType}`);
  })
  .catch(err => {
    console.error('Alert pattern analysis failed:', err.message);
  });