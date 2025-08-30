# Coastle Alert - AI Analysis Models

This directory contains machine learning models and data analysis scripts for the Coastle Alert system. These models help analyze tide patterns, optimize alert thresholds, and provide insights into alert patterns.

## Scripts Overview

### 1. Tide Prediction Model (`tide_prediction_model.py`)

A machine learning model for predicting tide heights based on historical data.

**Features:**
- Time series analysis of tide data
- Feature extraction from tide patterns
- Random Forest regression model for tide prediction
- High/low tide event detection
- Visualization of tide patterns and predictions

**Usage:**
```bash
python tide_prediction_model.py
```

### 2. Alert Threshold Optimization (`alert_threshold_optimization.py`)

Optimizes alert thresholds using machine learning to balance precision and recall.

**Features:**
- Analyzes historical alert data
- Identifies optimal thresholds for different alert types
- Provides recommendations for alert configuration
- Visualizes threshold performance

**Usage:**
```bash
python alert_threshold_optimization.py
```

### 3. Tide Data Visualization (`tide_data_visualization.py`)

Comprehensive visualization tools for tide data analysis.

**Features:**
- Time series visualization of tide heights
- Daily pattern analysis
- Station comparison
- Tide pattern analysis using PCA
- Prediction visualization

**Usage:**
```bash
python tide_data_visualization.py
```

### 4. Alert Pattern Analysis (`alert_pattern_analysis.py`)

Analyzes patterns in alert generation and acknowledgment.

**Features:**
- Alert frequency analysis by type, station, and time
- Alert distribution analysis
- Temporal pattern analysis
- Alert acknowledgment analysis
- Correlation analysis between alerts and tide features
- Predictive model for alert likelihood

**Usage:**
```bash
python alert_pattern_analysis.py
```

## Getting Started

### Prerequisites

Install the required Python packages:

```bash
pip install scikit-learn matplotlib numpy pandas seaborn joblib
```

### Data Sources

These scripts can use data from two sources:

1. **MongoDB** - Connect to the Coastle Alert database to use real data
2. **CSV files** - Use sample data or previously exported data

If no data source is available, the scripts will generate sample data for demonstration purposes.

### Output

Each script generates output in the following directories:

- `visualizations/` - Charts and graphs
- `models/` - Trained machine learning models
- `recommendations/` - Threshold recommendations
- `insights/` - Analysis insights

## Integration with Coastle Alert

These models can be integrated with the main Coastle Alert system to:

1. Improve alert threshold accuracy
2. Provide predictive tide information
3. Generate insights for system optimization
4. Support decision-making for coastal management

To integrate with the main system, the trained models can be exported and loaded by the backend services.

## Future Enhancements

- Deep learning models for more accurate tide prediction
- Anomaly detection for unusual tide patterns
- Geographic clustering of alert patterns
- Real-time prediction API endpoints
- Integration with weather data for improved predictions