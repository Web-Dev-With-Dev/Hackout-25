import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.model_selection import GridSearchCV, train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix, precision_recall_curve
from sklearn.preprocessing import StandardScaler
import joblib
import os
import sys

# Add the parent directory to sys.path to import from backend
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Function to load data
def load_data(from_csv=True, csv_path='alert_data.csv'):
    """
    Load alert and tide data either from MongoDB or from a CSV file
    """
    if from_csv:
        try:
            return pd.read_csv(csv_path)
        except FileNotFoundError:
            print(f"CSV file {csv_path} not found. Creating sample data instead.")
            # Create sample data if CSV doesn't exist
            return create_sample_data()
    else:
        try:
            # Try to import MongoDB models
            from backend.models.Reading import Reading
            from backend.models.Alert import Alert
            from backend.models.Station import Station
            import mongoose
            import json
            
            # Connect to MongoDB
            with open('../backend/.env') as f:
                for line in f:
                    if line.startswith('MONGODB_URI='):
                        mongodb_uri = line.strip().split('=')[1]
                        break
            
            mongoose.connect(mongodb_uri)
            
            # Get alerts and readings from MongoDB
            alerts = Alert.find().sort('ts', -1).limit(500)
            readings = Reading.find().sort('ts', -1).limit(2000)
            stations = {station._id: station for station in Station.find()}
            
            # Convert to DataFrames
            alert_data = []
            for alert in alerts:
                alert_data.append({
                    'alert_id': alert._id,
                    'ts': alert.ts,
                    'stationId': alert.stationId,
                    'type': alert.type,
                    'message': alert.message,
                    'acknowledged': alert.acknowledged
                })
            
            reading_data = []
            for reading in readings:
                station = stations.get(reading.stationId)
                if station:
                    reading_data.append({
                        'reading_id': reading._id,
                        'ts': reading.ts,
                        'height': reading.height,
                        'type': reading.type,
                        'stationId': reading.stationId,
                        'stationName': station.name,
                        'latitude': station.latitude,
                        'longitude': station.longitude
                    })
            
            alert_df = pd.DataFrame(alert_data)
            reading_df = pd.DataFrame(reading_data)
            
            # Merge data to create a dataset with readings and whether they triggered alerts
            merged_data = pd.merge_asof(
                reading_df.sort_values('ts'),
                alert_df.sort_values('ts'),
                on='ts',
                by='stationId',
                direction='nearest',
                tolerance=pd.Timedelta('1h')
            )
            
            # Create alert flag
            merged_data['alert_triggered'] = ~merged_data['alert_id'].isna()
            
            return merged_data
        except Exception as e:
            print(f"Error loading data from MongoDB: {e}")
            print("Creating sample data instead.")
            return create_sample_data()

# Function to create sample data
def create_sample_data(n_samples=2000):
    """
    Create sample data for alert threshold optimization
    """
    np.random.seed(42)
    
    # Create timestamps for the past 30 days at 15-minute intervals
    end_time = pd.Timestamp.now()
    start_time = end_time - pd.Timedelta(days=30)
    timestamps = pd.date_range(start=start_time, end=end_time, freq='15min')
    
    # Create sample data with a sine wave pattern plus noise to simulate tides
    time_values = np.linspace(0, 2*np.pi*5, len(timestamps))  # 5 complete cycles
    
    # Create primary tide pattern (semidiurnal)
    heights = 1.5 * np.sin(time_values) + 0.5 * np.sin(2*time_values) + 0.2 * np.random.randn(len(timestamps))
    
    # Add a long-term trend (e.g., seasonal variation)
    heights += 0.5 * np.sin(time_values / 10)
    
    # Create rate of change (derivative)
    rate_of_change = np.diff(heights, prepend=heights[0])
    
    # Create sample data
    data = pd.DataFrame({
        'ts': timestamps,
        'height': heights,
        'rate_of_change': rate_of_change,
        'stationId': 'sample-station-1',
        'stationName': 'Sample Station',
        'latitude': 51.5074,
        'longitude': -0.1278
    })
    
    # Create alert flags based on simple thresholds
    # High tide alert: height > 2.0 or rate_of_change > 0.3
    # Low tide alert: height < -0.5 or rate_of_change < -0.3
    data['high_tide_alert'] = (data['height'] > 2.0) | (data['rate_of_change'] > 0.3)
    data['low_tide_alert'] = (data['height'] < -0.5) | (data['rate_of_change'] < -0.3)
    data['alert_triggered'] = data['high_tide_alert'] | data['low_tide_alert']
    
    # Add some noise to make the problem more realistic
    # Randomly flip 5% of the alert flags
    flip_indices = np.random.choice(
        data.index, 
        size=int(0.05 * len(data)), 
        replace=False
    )
    data.loc[flip_indices, 'alert_triggered'] = ~data.loc[flip_indices, 'alert_triggered']
    
    # Save to CSV for future use
    data.to_csv('alert_data.csv', index=False)
    
    return data

# Function to preprocess data
def preprocess_data(data):
    """
    Preprocess the data for alert threshold optimization
    """
    # Convert timestamp to datetime if it's not already
    if isinstance(data['ts'].iloc[0], str):
        data['ts'] = pd.to_datetime(data['ts'])
    
    # Extract time-based features
    data['hour'] = data['ts'].dt.hour
    data['minute'] = data['ts'].dt.minute
    data['day_of_year'] = data['ts'].dt.dayofyear
    data['month'] = data['ts'].dt.month
    
    # Calculate time of day in radians (for cyclical features)
    data['time_rad'] = 2 * np.pi * (data['hour'] * 60 + data['minute']) / (24 * 60)
    data['sin_time'] = np.sin(data['time_rad'])
    data['cos_time'] = np.cos(data['time_rad'])
    
    # Calculate day of year in radians (for seasonal patterns)
    data['day_rad'] = 2 * np.pi * data['day_of_year'] / 365.25
    data['sin_day'] = np.sin(data['day_rad'])
    data['cos_day'] = np.cos(data['day_rad'])
    
    # Calculate rate of change if not already present
    if 'rate_of_change' not in data.columns:
        data = data.sort_values('ts')
        data['rate_of_change'] = data.groupby('stationId')['height'].diff()
    
    # Calculate rolling statistics
    data['height_rolling_mean'] = data.groupby('stationId')['height'].transform(
        lambda x: x.rolling(window=12, min_periods=1).mean()
    )
    data['height_rolling_std'] = data.groupby('stationId')['height'].transform(
        lambda x: x.rolling(window=12, min_periods=1).std()
    )
    
    # Calculate z-score
    data['height_zscore'] = (data['height'] - data['height_rolling_mean']) / data['height_rolling_std'].replace(0, 1)
    
    # Drop rows with NaN values
    data = data.dropna()
    
    return data

# Function to train the model
def train_threshold_model(data):
    """
    Train a Random Forest model to predict when alerts should be triggered
    """
    # Preprocess data
    processed_data = preprocess_data(data)
    
    # Define features and target
    features = [
        'height', 'rate_of_change', 'sin_time', 'cos_time', 'sin_day', 'cos_day',
        'height_rolling_mean', 'height_rolling_std', 'height_zscore'
    ]
    X = processed_data[features]
    y = processed_data['alert_triggered']
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Train model with hyperparameter tuning
    param_grid = {
        'n_estimators': [50, 100, 200],
        'max_depth': [None, 10, 20],
        'min_samples_split': [2, 5, 10],
        'class_weight': [None, 'balanced']
    }
    
    grid_search = GridSearchCV(
        RandomForestClassifier(random_state=42),
        param_grid,
        cv=5,
        scoring='f1',
        n_jobs=-1
    )
    
    grid_search.fit(X_train_scaled, y_train)
    
    # Get best model
    best_model = grid_search.best_estimator_
    print(f"Best parameters: {grid_search.best_params_}")
    
    # Evaluate model
    y_pred = best_model.predict(X_test_scaled)
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))
    
    # Get confusion matrix
    cm = confusion_matrix(y_test, y_pred)
    print("\nConfusion Matrix:")
    print(cm)
    
    # Save model and scaler
    os.makedirs('models', exist_ok=True)
    joblib.dump(best_model, 'models/alert_threshold_model.pkl')
    joblib.dump(scaler, 'models/alert_threshold_scaler.pkl')
    joblib.dump(features, 'models/alert_threshold_features.pkl')
    
    return best_model, scaler, features, X_test_scaled, y_test

# Function to find optimal thresholds
def find_optimal_thresholds(model, X_test_scaled, y_test):
    """
    Find optimal probability thresholds for alert generation
    """
    # Get probability predictions
    y_proba = model.predict_proba(X_test_scaled)[:, 1]
    
    # Calculate precision-recall curve
    precision, recall, thresholds = precision_recall_curve(y_test, y_proba)
    
    # Calculate F1 score for each threshold
    f1_scores = 2 * (precision * recall) / (precision + recall + 1e-10)
    
    # Find threshold with best F1 score
    best_idx = np.argmax(f1_scores)
    best_threshold = thresholds[best_idx] if best_idx < len(thresholds) else 0.5
    best_f1 = f1_scores[best_idx]
    
    print(f"\nOptimal threshold: {best_threshold:.4f} (F1: {best_f1:.4f})")
    
    # Find high-precision threshold (for critical alerts)
    high_precision_idx = np.argmax(precision[recall >= 0.5])
    high_precision_threshold = thresholds[high_precision_idx] if high_precision_idx < len(thresholds) else 0.7
    
    print(f"High-precision threshold: {high_precision_threshold:.4f} "
          f"(Precision: {precision[high_precision_idx]:.4f}, "
          f"Recall: {recall[high_precision_idx]:.4f})")
    
    # Find high-recall threshold (for catching all potential alerts)
    high_recall_idx = np.argmax(recall[precision >= 0.5])
    high_recall_threshold = thresholds[high_recall_idx] if high_recall_idx < len(thresholds) else 0.3
    
    print(f"High-recall threshold: {high_recall_threshold:.4f} "
          f"(Precision: {precision[high_recall_idx]:.4f}, "
          f"Recall: {recall[high_recall_idx]:.4f})")
    
    # Save thresholds
    thresholds_dict = {
        'optimal': best_threshold,
        'high_precision': high_precision_threshold,
        'high_recall': high_recall_threshold
    }
    
    joblib.dump(thresholds_dict, 'models/alert_thresholds.pkl')
    
    return thresholds_dict, precision, recall, thresholds

# Function to visualize results
def visualize_results(data, model, scaler, features, thresholds_dict, precision, recall, thresholds):
    """
    Create visualizations of the threshold optimization results
    """
    # Create output directory
    os.makedirs('visualizations', exist_ok=True)
    
    # Plot 1: Precision-Recall Curve
    plt.figure(figsize=(10, 6))
    plt.plot(recall, precision, 'b-', label='Precision-Recall curve')
    
    # Mark thresholds
    for name, threshold in thresholds_dict.items():
        idx = np.abs(thresholds - threshold).argmin() if len(thresholds) > 0 else 0
        if idx < len(precision) and idx < len(recall):
            plt.plot(recall[idx], precision[idx], 'ro', markersize=8, 
                     label=f'{name.replace("_", " ").title()}: {threshold:.2f}')
    
    plt.xlabel('Recall')
    plt.ylabel('Precision')
    plt.title('Precision-Recall Curve for Alert Threshold Optimization')
    plt.grid(True)
    plt.legend()
    plt.savefig('visualizations/precision_recall_curve.png')
    
    # Plot 2: Feature Importance
    plt.figure(figsize=(10, 6))
    importances = model.feature_importances_
    indices = np.argsort(importances)[::-1]
    
    plt.bar(range(len(importances)), importances[indices])
    plt.xticks(range(len(importances)), [features[i] for i in indices], rotation=45)
    plt.xlabel('Features')
    plt.ylabel('Importance')
    plt.title('Feature Importance for Alert Threshold Model')
    plt.tight_layout()
    plt.savefig('visualizations/alert_feature_importance.png')
    
    # Plot 3: Alert Distribution by Height
    plt.figure(figsize=(10, 6))
    
    # Process a sample of data for visualization
    processed_data = preprocess_data(data)
    X_sample = processed_data[features].sample(min(1000, len(processed_data)))
    X_sample_scaled = scaler.transform(X_sample)
    
    # Get probabilities
    y_proba = model.predict_proba(X_sample_scaled)[:, 1]
    
    # Create a DataFrame for plotting
    plot_data = pd.DataFrame({
        'height': X_sample['height'],
        'alert_probability': y_proba
    })
    
    # Plot scatter with color based on probability
    plt.scatter(plot_data['height'], plot_data['alert_probability'], 
                c=plot_data['alert_probability'], cmap='viridis', alpha=0.6)
    
    # Add threshold lines
    for name, threshold in thresholds_dict.items():
        plt.axhline(y=threshold, linestyle='--', 
                   label=f'{name.replace("_", " ").title()}: {threshold:.2f}')
    
    plt.xlabel('Tide Height')
    plt.ylabel('Alert Probability')
    plt.title('Alert Probability vs. Tide Height')
    plt.colorbar(label='Alert Probability')
    plt.grid(True)
    plt.legend()
    plt.savefig('visualizations/alert_probability_by_height.png')
    
    print("Visualizations saved to 'visualizations' directory.")

# Function to generate alert recommendations
def generate_alert_recommendations(data, model, scaler, features, thresholds_dict):
    """
    Generate recommendations for alert thresholds based on the model
    """
    # Process data
    processed_data = preprocess_data(data)
    
    # Get a sample of recent data
    recent_data = processed_data.sort_values('ts').tail(100)
    
    # Make predictions
    X_recent = recent_data[features]
    X_recent_scaled = scaler.transform(X_recent)
    y_proba = model.predict_proba(X_recent_scaled)[:, 1]
    
    # Apply different thresholds
    predictions = pd.DataFrame({
        'ts': recent_data['ts'],
        'height': recent_data['height'],
        'station': recent_data['stationId'],
        'alert_probability': y_proba,
        'optimal_alert': y_proba >= thresholds_dict['optimal'],
        'high_precision_alert': y_proba >= thresholds_dict['high_precision'],
        'high_recall_alert': y_proba >= thresholds_dict['high_recall']
    })
    
    # Generate recommendations
    recommendations = {
        'optimal_threshold': {
            'value': thresholds_dict['optimal'],
            'description': 'Balanced threshold with good precision and recall',
            'alert_count': predictions['optimal_alert'].sum(),
            'example_alerts': predictions[predictions['optimal_alert']].head(3).to_dict('records')
        },
        'high_precision_threshold': {
            'value': thresholds_dict['high_precision'],
            'description': 'Higher threshold for fewer but more accurate alerts',
            'alert_count': predictions['high_precision_alert'].sum(),
            'example_alerts': predictions[predictions['high_precision_alert']].head(3).to_dict('records')
        },
        'high_recall_threshold': {
            'value': thresholds_dict['high_recall'],
            'description': 'Lower threshold to catch more potential alerts (may include false positives)',
            'alert_count': predictions['high_recall_alert'].sum(),
            'example_alerts': predictions[predictions['high_recall_alert']].head(3).to_dict('records')
        }
    }
    
    # Save recommendations
    os.makedirs('recommendations', exist_ok=True)
    with open('recommendations/alert_threshold_recommendations.txt', 'w') as f:
        f.write("Alert Threshold Recommendations\n")
        f.write("==============================\n\n")
        
        for name, rec in recommendations.items():
            f.write(f"{name.replace('_', ' ').title()}: {rec['value']:.4f}\n")
            f.write(f"Description: {rec['description']}\n")
            f.write(f"Alert Count: {rec['alert_count']}\n\n")
        
        f.write("\nRecommended Configuration for alertService.js:\n")
        f.write("```javascript\n")
        f.write("// Alert thresholds based on ML optimization\n")
        f.write("const ALERT_THRESHOLDS = {\n")
        f.write(f"  HIGH_TIDE: {thresholds_dict['optimal']:.4f},  // Optimal threshold\n")
        f.write(f"  LOW_TIDE: {thresholds_dict['optimal']:.4f},   // Optimal threshold\n")
        f.write(f"  RAPID_RISE: {thresholds_dict['high_precision']:.4f},  // High precision threshold\n")
        f.write(f"  RAPID_FALL: {thresholds_dict['high_precision']:.4f},   // High precision threshold\n")
        f.write("};\n")
        f.write("```\n")
    
    print("Alert threshold recommendations saved to 'recommendations/alert_threshold_recommendations.txt'")
    
    # Save predictions for further analysis
    predictions.to_csv('recommendations/recent_predictions.csv', index=False)
    
    return recommendations

# Main function
def main():
    print("Coastle Alert - Alert Threshold Optimization")
    print("=========================================")
    
    # Create necessary directories
    os.makedirs('models', exist_ok=True)
    os.makedirs('visualizations', exist_ok=True)
    os.makedirs('recommendations', exist_ok=True)
    
    # Load data
    print("\nLoading alert and tide data...")
    data = load_data(from_csv=True)
    print(f"Loaded {len(data)} data points.")
    
    # Train model
    print("\nTraining alert threshold model...")
    model, scaler, features, X_test_scaled, y_test = train_threshold_model(data)
    
    # Find optimal thresholds
    print("\nFinding optimal alert thresholds...")
    thresholds_dict, precision, recall, thresholds = find_optimal_thresholds(model, X_test_scaled, y_test)
    
    # Visualize results
    print("\nCreating visualizations...")
    visualize_results(data, model, scaler, features, thresholds_dict, precision, recall, thresholds)
    
    # Generate recommendations
    print("\nGenerating alert threshold recommendations...")
    recommendations = generate_alert_recommendations(data, model, scaler, features, thresholds_dict)
    
    print("\nAlert threshold optimization complete!")

if __name__ == "__main__":
    main()