const { 
  generateTidePredictions, 
  getOptimizedThresholds, 
  analyzeTideData, 
  analyzeAlertPatterns 
} = require('../services/aiModelService');

const { getCurrentThresholds, updateAlertThresholds } = require('../services/alertService');

async function testAiModelIntegration() {
  console.log('Testing AI Model Integration');
  console.log('==============================');

  try {
    // Test 1: Generate tide predictions
    console.log('\nTest 1: Generate tide predictions');
    const predictions = await generateTidePredictions(12);
    console.log(`Generated ${predictions.length} tide predictions`);
    console.log('Sample prediction:', predictions[0]);

    // Test 2: Get current alert thresholds
    console.log('\nTest 2: Get current alert thresholds');
    const currentThresholds = getCurrentThresholds();
    console.log('Current thresholds:', currentThresholds);

    // Test 3: Update alert thresholds
    console.log('\nTest 3: Update alert thresholds');
    const updatedThresholds = await updateAlertThresholds();
    console.log('Updated thresholds:', updatedThresholds);

    // Test 4: Analyze tide data
    console.log('\nTest 4: Analyze tide data');
    const sampleTideData = [
      { timestamp: new Date().toISOString(), height: 1.2 },
      { timestamp: new Date(Date.now() - 3600000).toISOString(), height: 1.1 },
      { timestamp: new Date(Date.now() - 7200000).toISOString(), height: 0.9 },
    ];
    const tideAnalysis = await analyzeTideData(sampleTideData);
    console.log('Tide analysis results:', tideAnalysis);

    // Test 5: Analyze alert patterns
    console.log('\nTest 5: Analyze alert patterns');
    const sampleAlertData = [
      { 
        id: '1', 
        type: 'STORM_SURGE', 
        severity: 'HIGH', 
        timestamp: new Date().toISOString(),
        acknowledged: false 
      },
      { 
        id: '2', 
        type: 'POLLUTION', 
        severity: 'MEDIUM', 
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        acknowledged: true 
      },
    ];
    const alertAnalysis = await analyzeAlertPatterns(sampleAlertData);
    console.log('Alert analysis results:', alertAnalysis);

    console.log('\nAll tests completed successfully!');
  } catch (error) {
    console.error('Error during testing:', error);
  }
}

testAiModelIntegration();