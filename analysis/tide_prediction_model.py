import pandas as pd
import numpy as np
import joblib
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import matplotlib.pyplot as plt
import os
import sys
import json
from datetime import datetime, timedelta

# Add the project root to the path so we can import from other modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from backend.models.Reading import Reading
    from pymongo import MongoClient
    MONGODB_URI = os.environ.get('MONGODB_URI')
    mongo_available = True
except ImportError:
    mongo_available = False
    print("MongoDB connection not available. Will use CSV data if provided.")

class TidePredictionModel:
    def __init__(self, model_path=None):
        """Initialize the tide prediction model.
        
        Args:
            model_path (str, optional): Path to a saved model file. If provided, the model will be loaded from this file.
        """
        self.model = None
        self.scaler = StandardScaler()
        self.features = ['hour_of_day', 'day_of_year', 'moon_phase']
        self.target = 'tide_m'
        
        if model_path and os.path.exists(model_path):
            self.load_model(model_path)
        
    def _calculate_moon_phase(self, date):
        """Calculate the moon phase (0-1) for a given date.
        
        Args:
            date (datetime): The date to calculate the moon phase for.
            
        Returns:
            float: Moon phase value between 0 and 1.
        """
        # Simple approximation of moon phase
        # 0 = new moon, 0.5 = full moon, 1 = new moon
        days_since_new_moon = (date - datetime(2000, 1, 6)).days % 29.53
        return days_since_new_moon / 29.53
    
    def _prepare_features(self, df):
        """Prepare features for the model.
        
        Args:
            df (pandas.DataFrame): DataFrame containing timestamp data.
            
        Returns:
            pandas.DataFrame: DataFrame with engineered features.
        """
        # Convert timestamp to datetime if it's not already
        if 'ts' in df.columns and not pd.api.types.is_datetime64_any_dtype(df['ts']):
            df['ts'] = pd.to_datetime(df['ts'])
        
        # Extract time-based features
        df['hour_of_day'] = df['ts'].dt.hour
        df['day_of_year'] = df['ts'].dt.dayofyear
        
        # Calculate moon phase
        df['moon_phase'] = df['ts'].apply(self._calculate_moon_phase)
        
        # Add cyclical features for time
        df['hour_sin'] = np.sin(2 * np.pi * df['hour_of_day'] / 24)
        df['hour_cos'] = np.cos(2 * np.pi * df['hour_of_day'] / 24)
        df['day_sin'] = np.sin(2 * np.pi * df['day_of_year'] / 365.25)
        df['day_cos'] = np.cos(2 * np.pi * df['day_of_year'] / 365.25)
        
        # Add additional features if available
        extended_features = self.features.copy()
        extended_features.extend(['hour_sin', 'hour_cos', 'day_sin', 'day_cos'])
        
        return df[extended_features]
    
    def load_data(self, csv_path=None, station_id=None, start_date=None, end_date=None):
        """Load tide data either from MongoDB or from a CSV file.
        
        Args:
            csv_path (str, optional): Path to a CSV file containing tide data.
            station_id (str, optional): ID of the station to get data for (for MongoDB).
            start_date (datetime, optional): Start date for data retrieval (for MongoDB).
            end_date (datetime, optional): End date for data retrieval (for MongoDB).
            
        Returns:
            pandas.DataFrame: DataFrame containing the loaded data.
        """
        if mongo_available and not csv_path:
            # Load from MongoDB
            client = MongoClient(MONGODB_URI)
            db = client.get_default_database()
            
            query = {}
            if station_id:
                query['stationId'] = station_id
            if start_date:
                query['ts'] = {'$gte': start_date}
            if end_date and 'ts' in query:
                query['ts']['$lte'] = end_date
            elif end_date:
                query['ts'] = {'$lte': end_date}
            
            readings = list(db.readings.find(query))
            df = pd.DataFrame(readings)
            
            # Extract metrics from nested structure
            if not df.empty and 'metrics' in df.columns:
                metrics_df = pd.json_normalize(df['metrics'])
                df = pd.concat([df.drop('metrics', axis=1), metrics_df], axis=1)
            
            client.close()
        elif csv_path:
            # Load from CSV
            df = pd.read_csv(csv_path)
            if 'ts' in df.columns:
                df['ts'] = pd.to_datetime(df['ts'])
        else:
            raise ValueError("Either MongoDB connection or CSV path must be provided")
        
        return df
    
    def train(self, data, test_size=0.2, random_state=42, tune_hyperparams=False):
        """Train the tide prediction model.
        
        Args:
            data (pandas.DataFrame): DataFrame containing tide data.
            test_size (float, optional): Proportion of data to use for testing.
            random_state (int, optional): Random seed for reproducibility.
            tune_hyperparams (bool, optional): Whether to tune hyperparameters using GridSearchCV.
            
        Returns:
            dict: Dictionary containing model performance metrics.
        """
        # Prepare features
        X = self._prepare_features(data)
        y = data[self.target]
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=test_size, random_state=random_state)
        
        # Scale features
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        if tune_hyperparams:
            # Hyperparameter tuning
            param_grid = {
                'n_estimators': [50, 100, 200],
                'max_depth': [None, 10, 20, 30],
                'min_samples_split': [2, 5, 10],
                'min_samples_leaf': [1, 2, 4]
            }
            
            grid_search = GridSearchCV(
                RandomForestRegressor(random_state=random_state),
                param_grid=param_grid,
                cv=5,
                scoring='neg_mean_squared_error',
                n_jobs=-1
            )
            
            grid_search.fit(X_train_scaled, y_train)
            self.model = grid_search.best_estimator_
            print(f"Best parameters: {grid_search.best_params_}")
        else:
            # Train with default parameters
            self.model = RandomForestRegressor(n_estimators=100, random_state=random_state)
            self.model.fit(X_train_scaled, y_train)
        
        # Evaluate model
        y_pred = self.model.predict(X_test_scaled)
        
        metrics = {
            'mse': mean_squared_error(y_test, y_pred),
            'rmse': np.sqrt(mean_squared_error(y_test, y_pred)),
            'mae': mean_absolute_error(y_test, y_pred),
            'r2': r2_score(y_test, y_pred)
        }
        
        print(f"Model performance metrics:")
        for metric, value in metrics.items():
            print(f"{metric}: {value:.4f}")
        
        return metrics
    
    def save_model(self, model_path='./tide_prediction_model.joblib', scaler_path='./tide_scaler.joblib'):
        """Save the trained model and scaler to disk.
        
        Args:
            model_path (str, optional): Path to save the model to.
            scaler_path (str, optional): Path to save the scaler to.
        """
        if self.model is None:
            raise ValueError("Model has not been trained yet")
        
        # Create directory if it doesn't exist
        os.makedirs(os.path.dirname(os.path.abspath(model_path)), exist_ok=True)
        
        joblib.dump(self.model, model_path)
        joblib.dump(self.scaler, scaler_path)
        print(f"Model saved to {model_path}")
        print(f"Scaler saved to {scaler_path}")
    
    def load_model(self, model_path, scaler_path=None):
        """Load a trained model and scaler from disk.
        
        Args:
            model_path (str): Path to the saved model file.
            scaler_path (str, optional): Path to the saved scaler file.
        """
        self.model = joblib.load(model_path)
        
        if scaler_path and os.path.exists(scaler_path):
            self.scaler = joblib.load(scaler_path)
        
        print(f"Model loaded from {model_path}")
    
    def predict(self, future_hours=24, start_time=None, station_id=None):
        """Generate tide predictions for future hours.
        
        Args:
            future_hours (int, optional): Number of hours to predict into the future.
            start_time (datetime, optional): Start time for predictions. Defaults to current time.
            station_id (str, optional): Station ID for the predictions.
            
        Returns:
            pandas.DataFrame: DataFrame containing the predictions.
        """
        if self.model is None:
            raise ValueError("Model has not been trained or loaded yet")
        
        if start_time is None:
            start_time = datetime.now()
        
        # Generate future timestamps
        future_times = [start_time + timedelta(hours=i) for i in range(future_hours)]
        future_df = pd.DataFrame({'ts': future_times})
        
        if station_id:
            future_df['stationId'] = station_id
        
        # Prepare features
        X_future = self._prepare_features(future_df)
        X_future_scaled = self.scaler.transform(X_future)
        
        # Make predictions
        predictions = self.model.predict(X_future_scaled)
        
        # Create results dataframe
        results_df = pd.DataFrame({
            'ts': future_times,
            'tide_m': predictions
        })
        
        if station_id:
            results_df['stationId'] = station_id
        
        return results_df
    
    def visualize_predictions(self, actual_data=None, predictions=None, output_path=None):
        """Visualize tide predictions against actual data if available.
        
        Args:
            actual_data (pandas.DataFrame, optional): DataFrame containing actual tide data.
            predictions (pandas.DataFrame, optional): DataFrame containing predictions.
            output_path (str, optional): Path to save the visualization to.
        """
        plt.figure(figsize=(12, 6))
        
        if actual_data is not None and self.target in actual_data.columns:
            plt.plot(actual_data['ts'], actual_data[self.target], 'b-', label='Actual')
        
        if predictions is not None:
            plt.plot(predictions['ts'], predictions['tide_m'], 'r--', label='Predicted')
        
        plt.xlabel('Time')
        plt.ylabel('Tide Height (m)')
        plt.title('Tide Height Prediction')
        plt.legend()
        plt.grid(True)
        
        if output_path:
            plt.savefig(output_path)
            print(f"Visualization saved to {output_path}")
        else:
            plt.show()
    
    def export_predictions_json(self, predictions, output_path=None):
        """Export predictions to JSON format.
        
        Args:
            predictions (pandas.DataFrame): DataFrame containing predictions.
            output_path (str, optional): Path to save the JSON file to.
            
        Returns:
            str: JSON string of predictions.
        """
        # Convert timestamps to ISO format strings
        predictions_dict = predictions.copy()
        predictions_dict['ts'] = predictions_dict['ts'].dt.strftime('%Y-%m-%dT%H:%M:%S')
        
        # Convert to JSON
        json_data = predictions_dict.to_dict(orient='records')
        json_str = json.dumps(json_data, indent=2)
        
        if output_path:
            with open(output_path, 'w') as f:
                f.write(json_str)
            print(f"Predictions exported to {output_path}")
        
        return json_str

# Command-line interface
if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Tide Prediction Model')
    parser.add_argument('--train', action='store_true', help='Train the model')
    parser.add_argument('--predict', action='store_true', help='Generate predictions')
    parser.add_argument('--csv', type=str, help='Path to CSV file with tide data')
    parser.add_argument('--station', type=str, help='Station ID')
    parser.add_argument('--hours', type=int, default=24, help='Number of hours to predict')
    parser.add_argument('--save', type=str, help='Path to save the model')
    parser.add_argument('--load', type=str, help='Path to load the model')
    parser.add_argument('--output', type=str, help='Path to save predictions or visualization')
    parser.add_argument('--visualize', action='store_true', help='Visualize predictions')
    
    args = parser.parse_args()
    
    model = TidePredictionModel(model_path=args.load)
    
    if args.train:
        if not args.csv and not mongo_available:
            print("Error: Either CSV path or MongoDB connection is required for training")
            sys.exit(1)
        
        data = model.load_data(csv_path=args.csv, station_id=args.station)
        model.train(data, tune_hyperparams=True)
        
        if args.save:
            model.save_model(model_path=args.save)
    
    if args.predict:
        if model.model is None:
            print("Error: Model must be trained or loaded before making predictions")
            sys.exit(1)
        
        predictions = model.predict(future_hours=args.hours, station_id=args.station)
        
        if args.visualize:
            # If we have training data, use it for visualization
            actual_data = None
            if args.csv or mongo_available:
                try:
                    actual_data = model.load_data(csv_path=args.csv, station_id=args.station)
                except:
                    pass
            
            model.visualize_predictions(actual_data=actual_data, predictions=predictions, output_path=args.output)
        else:
            # Export predictions to JSON
            json_output = model.export_predictions_json(predictions, output_path=args.output)
            if not args.output:
                print(json_output)