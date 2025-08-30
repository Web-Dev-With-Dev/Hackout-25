import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
import seaborn as sns
from datetime import datetime, timedelta
import os
import sys
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler

# Add the parent directory to sys.path to import from backend
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Function to load data
def load_data(from_csv=True, csv_path='tide_data.csv'):
    """
    Load tide data either from MongoDB or from a CSV file
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
            
            # Get readings from MongoDB
            readings = Reading.find().sort('ts', -1).limit(5000)
            stations = {station._id: station for station in Station.find()}
            
            # Convert to DataFrame
            data = []
            for reading in readings:
                station = stations.get(reading.stationId)
                if station:
                    data.append({
                        'reading_id': reading._id,
                        'ts': reading.ts,
                        'height': reading.height,
                        'type': reading.type,
                        'stationId': reading.stationId,
                        'stationName': station.name,
                        'latitude': station.latitude,
                        'longitude': station.longitude
                    })
            
            df = pd.DataFrame(data)
            
            # Save to CSV for future use
            df.to_csv(csv_path, index=False)
            
            return df
        except Exception as e:
            print(f"Error loading data from MongoDB: {e}")
            print("Creating sample data instead.")
            return create_sample_data()

# Function to create sample data
def create_sample_data(n_days=30, n_stations=3):
    """
    Create sample tide data for visualization
    """
    np.random.seed(42)
    
    # Create timestamps for the past n_days at 15-minute intervals
    end_time = pd.Timestamp.now()
    start_time = end_time - pd.Timedelta(days=n_days)
    timestamps = pd.date_range(start=start_time, end=end_time, freq='15min')
    
    # Create station data
    stations = [
        {
            'stationId': f'station-{i+1}',
            'stationName': f'Station {i+1}',
            # Random locations around the UK coast
            'latitude': 50.5 + np.random.rand() * 5,
            'longitude': -5.5 + np.random.rand() * 5
        } for i in range(n_stations)
    ]
    
    # Create sample data with different tide patterns for each station
    data = []
    
    for station in stations:
        # Create time values for sine waves
        time_values = np.linspace(0, 2*np.pi*n_days/2, len(timestamps))  # n_days/2 complete cycles
        
        # Create primary tide pattern (semidiurnal with different amplitudes and phases)
        phase_offset = np.random.rand() * np.pi  # Random phase offset
        amplitude = 1.5 + np.random.rand() * 1.0  # Random amplitude between 1.5 and 2.5
        
        # Main semidiurnal tide component
        heights = amplitude * np.sin(time_values + phase_offset)
        
        # Add diurnal inequality (difference between consecutive high/low tides)
        heights += 0.3 * np.sin(time_values/2 + np.random.rand() * np.pi)
        
        # Add a long-term trend (e.g., seasonal variation)
        heights += 0.5 * np.sin(time_values / (n_days/2) + np.random.rand() * np.pi)
        
        # Add random noise
        heights += 0.1 * np.random.randn(len(timestamps))
        
        # Add spring-neap cycle (approximately 14.77 days)
        spring_neap_factor = 0.4 * np.sin(time_values * (2/14.77) + np.random.rand() * np.pi)
        heights *= (1 + spring_neap_factor)
        
        # Create station data
        for i, ts in enumerate(timestamps):
            data.append({
                'reading_id': f"{station['stationId']}-{i}",
                'ts': ts,
                'height': heights[i],
                'type': 'prediction',
                'stationId': station['stationId'],
                'stationName': station['stationName'],
                'latitude': station['latitude'],
                'longitude': station['longitude']
            })
    
    # Convert to DataFrame
    df = pd.DataFrame(data)
    
    # Save to CSV for future use
    df.to_csv('tide_data.csv', index=False)
    
    return df

# Function to preprocess data
def preprocess_data(data):
    """
    Preprocess the tide data for visualization
    """
    # Convert timestamp to datetime if it's not already
    if isinstance(data['ts'].iloc[0], str):
        data['ts'] = pd.to_datetime(data['ts'])
    
    # Extract time-based features
    data['hour'] = data['ts'].dt.hour
    data['minute'] = data['ts'].dt.minute
    data['day_of_year'] = data['ts'].dt.dayofyear
    data['month'] = data['ts'].dt.month
    data['day'] = data['ts'].dt.day
    data['day_of_week'] = data['ts'].dt.dayofweek
    
    # Calculate time of day in decimal hours
    data['time_of_day'] = data['hour'] + data['minute'] / 60
    
    # Calculate rate of change
    data = data.sort_values(['stationId', 'ts'])
    data['height_change'] = data.groupby('stationId')['height'].diff()
    
    # Calculate rolling statistics
    data['height_rolling_mean'] = data.groupby('stationId')['height'].transform(
        lambda x: x.rolling(window=24, min_periods=1).mean()
    )
    data['height_rolling_std'] = data.groupby('stationId')['height'].transform(
        lambda x: x.rolling(window=24, min_periods=1).std()
    )
    
    # Calculate z-score
    data['height_zscore'] = (data['height'] - data['height_rolling_mean']) / data['height_rolling_std'].replace(0, 1)
    
    # Identify high and low tides
    window_size = 12  # 3 hours (assuming 15-minute intervals)
    
    def find_extrema(group):
        # Mark local maxima (high tides)
        group['is_high_tide'] = group['height'].rolling(window=window_size, center=True, min_periods=1).apply(
            lambda x: np.argmax(x) == len(x) // 2 if len(x) > 1 else False
        )
        
        # Mark local minima (low tides)
        group['is_low_tide'] = group['height'].rolling(window=window_size, center=True, min_periods=1).apply(
            lambda x: np.argmin(x) == len(x) // 2 if len(x) > 1 else False
        )
        
        return group
    
    data = data.groupby('stationId').apply(find_extrema).reset_index(drop=True)
    
    # Drop rows with NaN values
    data = data.dropna()
    
    return data

# Function to create time series visualization
def visualize_time_series(data, station_id=None, days=7):
    """
    Create time series visualization of tide data
    """
    # Create output directory
    os.makedirs('visualizations', exist_ok=True)
    
    # Filter data
    if station_id:
        filtered_data = data[data['stationId'] == station_id].copy()
        station_name = filtered_data['stationName'].iloc[0]
        title_suffix = f" - {station_name}"
    else:
        # Use the first station if none specified
        station_id = data['stationId'].iloc[0]
        filtered_data = data[data['stationId'] == station_id].copy()
        station_name = filtered_data['stationName'].iloc[0]
        title_suffix = f" - {station_name}"
    
    # Filter for the most recent days
    end_time = filtered_data['ts'].max()
    start_time = end_time - pd.Timedelta(days=days)
    filtered_data = filtered_data[(filtered_data['ts'] >= start_time) & (filtered_data['ts'] <= end_time)]
    
    # Create figure
    plt.figure(figsize=(15, 8))
    
    # Plot tide height
    plt.plot(filtered_data['ts'], filtered_data['height'], 'b-', label='Tide Height')
    
    # Mark high and low tides
    high_tides = filtered_data[filtered_data['is_high_tide'] == True]
    low_tides = filtered_data[filtered_data['is_low_tide'] == True]
    
    plt.scatter(high_tides['ts'], high_tides['height'], color='red', s=50, label='High Tide')
    plt.scatter(low_tides['ts'], low_tides['height'], color='green', s=50, label='Low Tide')
    
    # Add rolling mean
    plt.plot(filtered_data['ts'], filtered_data['height_rolling_mean'], 'k--', alpha=0.5, label='24-hour Moving Average')
    
    # Format x-axis
    plt.gca().xaxis.set_major_formatter(mdates.DateFormatter('%Y-%m-%d %H:%M'))
    plt.gca().xaxis.set_major_locator(mdates.DayLocator())
    plt.gcf().autofmt_xdate()
    
    # Add labels and title
    plt.xlabel('Date and Time')
    plt.ylabel('Tide Height (m)')
    plt.title(f'Tide Height Time Series{title_suffix}')
    plt.grid(True)
    plt.legend()
    
    # Save figure
    plt.tight_layout()
    plt.savefig(f'visualizations/tide_time_series_{station_id}.png')
    plt.close()
    
    # Create rate of change visualization
    plt.figure(figsize=(15, 8))
    
    # Plot rate of change
    plt.plot(filtered_data['ts'], filtered_data['height_change'], 'g-', label='Rate of Change')
    
    # Add zero line
    plt.axhline(y=0, color='k', linestyle='-', alpha=0.3)
    
    # Format x-axis
    plt.gca().xaxis.set_major_formatter(mdates.DateFormatter('%Y-%m-%d %H:%M'))
    plt.gca().xaxis.set_major_locator(mdates.DayLocator())
    plt.gcf().autofmt_xdate()
    
    # Add labels and title
    plt.xlabel('Date and Time')
    plt.ylabel('Rate of Change (m/15min)')
    plt.title(f'Tide Rate of Change{title_suffix}')
    plt.grid(True)
    plt.legend()
    
    # Save figure
    plt.tight_layout()
    plt.savefig(f'visualizations/tide_rate_of_change_{station_id}.png')
    plt.close()
    
    print(f"Time series visualizations saved for {station_name}")

# Function to create daily pattern visualization
def visualize_daily_pattern(data, station_id=None):
    """
    Create visualization of daily tide patterns
    """
    # Create output directory
    os.makedirs('visualizations', exist_ok=True)
    
    # Filter data
    if station_id:
        filtered_data = data[data['stationId'] == station_id].copy()
        station_name = filtered_data['stationName'].iloc[0]
        title_suffix = f" - {station_name}"
    else:
        # Use the first station if none specified
        station_id = data['stationId'].iloc[0]
        filtered_data = data[data['stationId'] == station_id].copy()
        station_name = filtered_data['stationName'].iloc[0]
        title_suffix = f" - {station_name}"
    
    # Create figure
    plt.figure(figsize=(15, 8))
    
    # Create a scatter plot with time of day on x-axis and height on y-axis
    scatter = plt.scatter(
        filtered_data['time_of_day'], 
        filtered_data['height'],
        c=filtered_data['day_of_year'],  # Color by day of year
        cmap='viridis',
        alpha=0.5
    )
    
    # Add colorbar
    cbar = plt.colorbar(scatter)
    cbar.set_label('Day of Year')
    
    # Add labels and title
    plt.xlabel('Time of Day (hours)')
    plt.ylabel('Tide Height (m)')
    plt.title(f'Daily Tide Pattern{title_suffix}')
    plt.grid(True)
    
    # Set x-axis ticks to hours
    plt.xticks(np.arange(0, 24, 2))
    
    # Save figure
    plt.tight_layout()
    plt.savefig(f'visualizations/daily_tide_pattern_{station_id}.png')
    plt.close()
    
    # Create heatmap of average tide height by hour and day of week
    pivot_data = filtered_data.pivot_table(
        index='day_of_week',
        columns='hour',
        values='height',
        aggfunc='mean'
    )
    
    # Create figure
    plt.figure(figsize=(15, 8))
    
    # Create heatmap
    sns.heatmap(
        pivot_data,
        cmap='viridis',
        annot=False,
        fmt='.2f',
        cbar_kws={'label': 'Average Tide Height (m)'}
    )
    
    # Add labels and title
    plt.xlabel('Hour of Day')
    plt.ylabel('Day of Week (0=Monday, 6=Sunday)')
    plt.title(f'Average Tide Height by Hour and Day of Week{title_suffix}')
    
    # Save figure
    plt.tight_layout()
    plt.savefig(f'visualizations/tide_heatmap_{station_id}.png')
    plt.close()
    
    print(f"Daily pattern visualizations saved for {station_name}")

# Function to create station comparison visualization
def visualize_station_comparison(data):
    """
    Create visualization comparing tide patterns across stations
    """
    # Create output directory
    os.makedirs('visualizations', exist_ok=True)
    
    # Get unique stations
    stations = data['stationId'].unique()
    
    if len(stations) < 2:
        print("Need at least 2 stations for comparison. Skipping station comparison visualization.")
        return
    
    # Filter for the most recent 7 days
    end_time = data['ts'].max()
    start_time = end_time - pd.Timedelta(days=7)
    filtered_data = data[(data['ts'] >= start_time) & (data['ts'] <= end_time)]
    
    # Create figure
    plt.figure(figsize=(15, 8))
    
    # Plot tide height for each station
    for station_id in stations:
        station_data = filtered_data[filtered_data['stationId'] == station_id]
        station_name = station_data['stationName'].iloc[0]
        plt.plot(station_data['ts'], station_data['height'], label=station_name)
    
    # Format x-axis
    plt.gca().xaxis.set_major_formatter(mdates.DateFormatter('%Y-%m-%d %H:%M'))
    plt.gca().xaxis.set_major_locator(mdates.DayLocator())
    plt.gcf().autofmt_xdate()
    
    # Add labels and title
    plt.xlabel('Date and Time')
    plt.ylabel('Tide Height (m)')
    plt.title('Tide Height Comparison Across Stations')
    plt.grid(True)
    plt.legend()
    
    # Save figure
    plt.tight_layout()
    plt.savefig('visualizations/station_comparison.png')
    plt.close()
    
    # Create correlation heatmap
    # Pivot data to get tide height by station and timestamp
    pivot_data = filtered_data.pivot_table(
        index='ts',
        columns='stationName',
        values='height'
    )
    
    # Calculate correlation
    corr = pivot_data.corr()
    
    # Create figure
    plt.figure(figsize=(10, 8))
    
    # Create heatmap
    sns.heatmap(
        corr,
        annot=True,
        fmt='.2f',
        cmap='coolwarm',
        vmin=-1,
        vmax=1,
        cbar_kws={'label': 'Correlation'}
    )
    
    # Add title
    plt.title('Correlation of Tide Heights Between Stations')
    
    # Save figure
    plt.tight_layout()
    plt.savefig('visualizations/station_correlation.png')
    plt.close()
    
    # Create lag analysis
    if len(stations) >= 2:
        # Select two stations for lag analysis
        station1_id = stations[0]
        station2_id = stations[1]
        
        station1_data = filtered_data[filtered_data['stationId'] == station1_id]
        station2_data = filtered_data[filtered_data['stationId'] == station2_id]
        
        station1_name = station1_data['stationName'].iloc[0]
        station2_name = station2_data['stationName'].iloc[0]
        
        # Merge data on timestamp
        merged_data = pd.merge(
            station1_data[['ts', 'height']],
            station2_data[['ts', 'height']],
            on='ts',
            suffixes=('_1', '_2')
        )
        
        # Calculate cross-correlation
        max_lag = 48  # 12 hours (assuming 15-minute intervals)
        lags = range(-max_lag, max_lag + 1)
        xcorr = [merged_data['height_1'].corr(merged_data['height_2'].shift(lag)) for lag in lags]
        
        # Convert lags to hours
        lag_hours = [lag * 0.25 for lag in lags]  # 0.25 hours = 15 minutes
        
        # Find lag with maximum correlation
        max_corr_idx = np.argmax(xcorr)
        max_corr_lag = lag_hours[max_corr_idx]
        max_corr = xcorr[max_corr_idx]
        
        # Create figure
        plt.figure(figsize=(12, 6))
        
        # Plot cross-correlation
        plt.plot(lag_hours, xcorr)
        plt.axvline(x=max_corr_lag, color='r', linestyle='--', 
                   label=f'Max Correlation at {max_corr_lag:.2f} hours (r={max_corr:.2f})')
        
        # Add labels and title
        plt.xlabel('Lag (hours)')
        plt.ylabel('Correlation')
        plt.title(f'Cross-Correlation of Tide Heights: {station1_name} vs {station2_name}')
        plt.grid(True)
        plt.legend()
        
        # Save figure
        plt.tight_layout()
        plt.savefig('visualizations/tide_lag_analysis.png')
        plt.close()
    
    print("Station comparison visualizations saved")

# Function to create tide pattern analysis
def analyze_tide_patterns(data):
    """
    Analyze tide patterns using PCA and clustering
    """
    # Create output directory
    os.makedirs('visualizations', exist_ok=True)
    
    # Get unique stations
    stations = data['stationId'].unique()
    
    # Extract features for analysis
    features = []
    
    for station_id in stations:
        station_data = data[data['stationId'] == station_id].copy()
        
        # Calculate tide statistics
        high_tides = station_data[station_data['is_high_tide'] == True]
        low_tides = station_data[station_data['is_low_tide'] == True]
        
        # Calculate average high and low tide heights
        avg_high_tide = high_tides['height'].mean()
        avg_low_tide = low_tides['height'].mean()
        tide_range = avg_high_tide - avg_low_tide
        
        # Calculate average time between high tides
        high_tide_times = high_tides['ts'].sort_values()
        high_tide_intervals = high_tide_times.diff().dt.total_seconds() / 3600  # in hours
        avg_high_tide_interval = high_tide_intervals.mean()
        
        # Calculate standard deviation of heights
        height_std = station_data['height'].std()
        
        # Calculate correlation between height and time of day
        time_corr = station_data['height'].corr(station_data['time_of_day'])
        
        # Add features
        features.append({
            'stationId': station_id,
            'stationName': station_data['stationName'].iloc[0],
            'latitude': station_data['latitude'].iloc[0],
            'longitude': station_data['longitude'].iloc[0],
            'avg_high_tide': avg_high_tide,
            'avg_low_tide': avg_low_tide,
            'tide_range': tide_range,
            'avg_high_tide_interval': avg_high_tide_interval,
            'height_std': height_std,
            'time_corr': time_corr
        })
    
    # Convert to DataFrame
    features_df = pd.DataFrame(features)
    
    # Save features
    features_df.to_csv('visualizations/tide_features.csv', index=False)
    
    # Create scatter plot of tide range vs. latitude
    plt.figure(figsize=(10, 6))
    plt.scatter(features_df['latitude'], features_df['tide_range'])
    
    # Add station labels
    for i, row in features_df.iterrows():
        plt.annotate(row['stationName'], (row['latitude'], row['tide_range']))
    
    # Add labels and title
    plt.xlabel('Latitude')
    plt.ylabel('Tide Range (m)')
    plt.title('Tide Range vs. Latitude')
    plt.grid(True)
    
    # Save figure
    plt.tight_layout()
    plt.savefig('visualizations/tide_range_vs_latitude.png')
    plt.close()
    
    # If we have enough stations, perform PCA
    if len(stations) >= 3:
        # Select numerical features for PCA
        X = features_df[['avg_high_tide', 'avg_low_tide', 'tide_range', 
                        'avg_high_tide_interval', 'height_std', 'time_corr']].values
        
        # Scale features
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)
        
        # Perform PCA
        pca = PCA(n_components=2)
        X_pca = pca.fit_transform(X_scaled)
        
        # Create figure
        plt.figure(figsize=(10, 6))
        
        # Plot PCA results
        plt.scatter(X_pca[:, 0], X_pca[:, 1])
        
        # Add station labels
        for i, row in features_df.iterrows():
            plt.annotate(row['stationName'], (X_pca[i, 0], X_pca[i, 1]))
        
        # Add labels and title
        plt.xlabel(f'PC1 ({pca.explained_variance_ratio_[0]:.2%} variance)')
        plt.ylabel(f'PC2 ({pca.explained_variance_ratio_[1]:.2%} variance)')
        plt.title('PCA of Tide Features')
        plt.grid(True)
        
        # Save figure
        plt.tight_layout()
        plt.savefig('visualizations/tide_pca.png')
        plt.close()
        
        # Create feature importance plot
        plt.figure(figsize=(10, 6))
        
        # Get feature names
        feature_names = ['Avg High Tide', 'Avg Low Tide', 'Tide Range', 
                        'High Tide Interval', 'Height Std', 'Time Correlation']
        
        # Plot feature loadings for PC1
        plt.bar(feature_names, pca.components_[0])
        
        # Add labels and title
        plt.xlabel('Features')
        plt.ylabel('PC1 Loading')
        plt.title('Feature Importance for PC1')
        plt.xticks(rotation=45)
        
        # Save figure
        plt.tight_layout()
        plt.savefig('visualizations/tide_feature_importance.png')
        plt.close()
    
    print("Tide pattern analysis visualizations saved")

# Function to create tide prediction visualization
def visualize_tide_prediction(data, station_id=None, days_to_predict=7):
    """
    Create visualization of tide prediction
    """
    # This is a simplified visualization of what a prediction might look like
    # In a real system, you would use a proper prediction model
    
    # Create output directory
    os.makedirs('visualizations', exist_ok=True)
    
    # Filter data
    if station_id:
        filtered_data = data[data['stationId'] == station_id].copy()
        station_name = filtered_data['stationName'].iloc[0]
        title_suffix = f" - {station_name}"
    else:
        # Use the first station if none specified
        station_id = data['stationId'].iloc[0]
        filtered_data = data[data['stationId'] == station_id].copy()
        station_name = filtered_data['stationName'].iloc[0]
        title_suffix = f" - {station_name}"
    
    # Get the most recent data
    filtered_data = filtered_data.sort_values('ts')
    last_date = filtered_data['ts'].max()
    
    # Create a date range for prediction
    prediction_dates = pd.date_range(
        start=last_date + pd.Timedelta(minutes=15),
        periods=days_to_predict * 24 * 4,  # 15-minute intervals
        freq='15min'
    )
    
    # Create a simple prediction based on the pattern of the last 14 days
    # In a real system, you would use a proper prediction model
    last_14_days = filtered_data[filtered_data['ts'] >= (last_date - pd.Timedelta(days=14))]
    
    # Calculate the average tide pattern by time of day
    avg_pattern = last_14_days.groupby(['hour', 'minute'])['height'].mean().reset_index()
    
    # Create prediction data
    prediction_data = pd.DataFrame({
        'ts': prediction_dates,
        'hour': prediction_dates.hour,
        'minute': prediction_dates.minute
    })
    
    # Merge with average pattern
    prediction_data = pd.merge(prediction_data, avg_pattern, on=['hour', 'minute'])
    
    # Add some variation to make it look more realistic
    prediction_data['height'] = prediction_data['height'] + 0.2 * np.sin(np.linspace(0, 4*np.pi, len(prediction_data)))
    
    # Create figure
    plt.figure(figsize=(15, 8))
    
    # Plot historical data
    historical_data = filtered_data[filtered_data['ts'] >= (last_date - pd.Timedelta(days=7))]
    plt.plot(historical_data['ts'], historical_data['height'], 'b-', label='Historical Data')
    
    # Plot prediction
    plt.plot(prediction_data['ts'], prediction_data['height'], 'r--', label='Prediction')
    
    # Add vertical line at current time
    plt.axvline(x=last_date, color='k', linestyle='-', label='Current Time')
    
    # Format x-axis
    plt.gca().xaxis.set_major_formatter(mdates.DateFormatter('%Y-%m-%d'))
    plt.gca().xaxis.set_major_locator(mdates.DayLocator())
    plt.gcf().autofmt_xdate()
    
    # Add labels and title
    plt.xlabel('Date')
    plt.ylabel('Tide Height (m)')
    plt.title(f'Tide Prediction{title_suffix}')
    plt.grid(True)
    plt.legend()
    
    # Save figure
    plt.tight_layout()
    plt.savefig(f'visualizations/tide_prediction_{station_id}.png')
    plt.close()
    
    print(f"Tide prediction visualization saved for {station_name}")

# Main function
def main():
    print("Coastle Alert - Tide Data Visualization")
    print("======================================")
    
    # Create necessary directories
    os.makedirs('visualizations', exist_ok=True)
    
    # Load data
    print("\nLoading tide data...")
    data = load_data(from_csv=True)
    print(f"Loaded {len(data)} data points from {len(data['stationId'].unique())} stations.")
    
    # Preprocess data
    print("\nPreprocessing data...")
    processed_data = preprocess_data(data)
    
    # Create visualizations for each station
    print("\nCreating visualizations...")
    for station_id in processed_data['stationId'].unique():
        station_name = processed_data[processed_data['stationId'] == station_id]['stationName'].iloc[0]
        print(f"\nProcessing station: {station_name}")
        
        # Create time series visualization
        visualize_time_series(processed_data, station_id)
        
        # Create daily pattern visualization
        visualize_daily_pattern(processed_data, station_id)
        
        # Create tide prediction visualization
        visualize_tide_prediction(processed_data, station_id)
    
    # Create station comparison visualization
    print("\nCreating station comparison visualizations...")
    visualize_station_comparison(processed_data)
    
    # Analyze tide patterns
    print("\nAnalyzing tide patterns...")
    analyze_tide_patterns(processed_data)
    
    print("\nTide data visualization complete!")
    print(f"All visualizations saved to the 'visualizations' directory.")

if __name__ == "__main__":
    main()