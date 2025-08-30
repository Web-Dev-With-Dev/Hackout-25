import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
import seaborn as sns
from datetime import datetime, timedelta
import os
import sys
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix

# Add the parent directory to sys.path to import from backend
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Function to load data
def load_data(from_csv=True, csv_path='alert_analysis_data.csv'):
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
            alerts = Alert.find().sort('ts', -1).limit(1000)
            readings = Reading.find().sort('ts', -1).limit(5000)
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
                    'acknowledged': alert.acknowledged,
                    'severity': getattr(alert, 'severity', 'medium'),
                    'kind': getattr(alert, 'kind', 'tide'),
                    'area': getattr(alert, 'area', None)
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
            
            # Merge data to create a dataset with readings and alerts
            merged_data = pd.merge_asof(
                reading_df.sort_values('ts'),
                alert_df.sort_values('ts'),
                on='ts',
                by='stationId',
                direction='nearest',
                tolerance=pd.Timedelta('1h')
            )
            
            # Create alert flag
            merged_data['has_alert'] = ~merged_data['alert_id'].isna()
            
            # Save to CSV for future use
            merged_data.to_csv(csv_path, index=False)
            
            return merged_data
        except Exception as e:
            print(f"Error loading data from MongoDB: {e}")
            print("Creating sample data instead.")
            return create_sample_data()

# Function to create sample data
def create_sample_data(n_days=60, n_stations=3):
    """
    Create sample data for alert pattern analysis
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
    
    # Create alert types
    alert_types = ['HIGH_TIDE', 'LOW_TIDE', 'RAPID_RISE', 'RAPID_FALL']
    alert_severities = ['low', 'medium', 'high']
    
    # Create sample data
    data = []
    alert_id_counter = 1
    
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
        
        # Calculate rate of change
        rate_of_change = np.diff(heights, prepend=heights[0])
        
        # Create alerts based on thresholds
        high_tide_threshold = 2.0
        low_tide_threshold = -0.5
        rapid_rise_threshold = 0.3
        rapid_fall_threshold = -0.3
        
        alerts = []
        
        for i, (ts, height, roc) in enumerate(zip(timestamps, heights, rate_of_change)):
            # High tide alert
            if height > high_tide_threshold:
                alerts.append({
                    'alert_id': f'alert-{alert_id_counter}',
                    'ts': ts,
                    'stationId': station['stationId'],
                    'type': 'HIGH_TIDE',
                    'message': f"High tide alert for {station['stationName']}",
                    'acknowledged': np.random.choice([True, False], p=[0.7, 0.3]),
                    'severity': np.random.choice(alert_severities, p=[0.2, 0.5, 0.3]),
                    'kind': 'tide',
                    'area': f"Area near {station['stationName']}"
                })
                alert_id_counter += 1
            
            # Low tide alert
            elif height < low_tide_threshold:
                alerts.append({
                    'alert_id': f'alert-{alert_id_counter}',
                    'ts': ts,
                    'stationId': station['stationId'],
                    'type': 'LOW_TIDE',
                    'message': f"Low tide alert for {station['stationName']}",
                    'acknowledged': np.random.choice([True, False], p=[0.7, 0.3]),
                    'severity': np.random.choice(alert_severities, p=[0.3, 0.5, 0.2]),
                    'kind': 'tide',
                    'area': f"Area near {station['stationName']}"
                })
                alert_id_counter += 1
            
            # Rapid rise alert
            elif roc > rapid_rise_threshold:
                alerts.append({
                    'alert_id': f'alert-{alert_id_counter}',
                    'ts': ts,
                    'stationId': station['stationId'],
                    'type': 'RAPID_RISE',
                    'message': f"Rapid tide rise alert for {station['stationName']}",
                    'acknowledged': np.random.choice([True, False], p=[0.6, 0.4]),
                    'severity': np.random.choice(alert_severities, p=[0.1, 0.4, 0.5]),
                    'kind': 'tide',
                    'area': f"Area near {station['stationName']}"
                })
                alert_id_counter += 1
            
            # Rapid fall alert
            elif roc < rapid_fall_threshold:
                alerts.append({
                    'alert_id': f'alert-{alert_id_counter}',
                    'ts': ts,
                    'stationId': station['stationId'],
                    'type': 'RAPID_FALL',
                    'message': f"Rapid tide fall alert for {station['stationName']}",
                    'acknowledged': np.random.choice([True, False], p=[0.6, 0.4]),
                    'severity': np.random.choice(alert_severities, p=[0.2, 0.5, 0.3]),
                    'kind': 'tide',
                    'area': f"Area near {station['stationName']}"
                })
                alert_id_counter += 1
            
            # Add reading data
            data.append({
                'reading_id': f"{station['stationId']}-{i}",
                'ts': ts,
                'height': height,
                'rate_of_change': roc,
                'type': 'prediction',
                'stationId': station['stationId'],
                'stationName': station['stationName'],
                'latitude': station['latitude'],
                'longitude': station['longitude'],
                'has_alert': False  # Will be updated later
            })
        
        # Add alerts to data
        for alert in alerts:
            # Find the closest reading by timestamp
            closest_idx = np.argmin(np.abs([(ts - alert['ts']).total_seconds() for ts in timestamps]))
            
            # Update the reading with alert information
            data[closest_idx]['has_alert'] = True
            data[closest_idx]['alert_id'] = alert['alert_id']
            data[closest_idx]['alert_type'] = alert['type']
            data[closest_idx]['message'] = alert['message']
            data[closest_idx]['acknowledged'] = alert['acknowledged']
            data[closest_idx]['severity'] = alert['severity']
            data[closest_idx]['kind'] = alert['kind']
            data[closest_idx]['area'] = alert['area']
    
    # Convert to DataFrame
    df = pd.DataFrame(data)
    
    # Save to CSV for future use
    df.to_csv('alert_analysis_data.csv', index=False)
    
    return df

# Function to preprocess data
def preprocess_data(data):
    """
    Preprocess the data for alert pattern analysis
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
    
    # Calculate rate of change if not already present
    if 'rate_of_change' not in data.columns:
        data = data.sort_values(['stationId', 'ts'])
        data['rate_of_change'] = data.groupby('stationId')['height'].diff()
    
    # Calculate rolling statistics
    data['height_rolling_mean'] = data.groupby('stationId')['height'].transform(
        lambda x: x.rolling(window=24, min_periods=1).mean()
    )
    data['height_rolling_std'] = data.groupby('stationId')['height'].transform(
        lambda x: x.rolling(window=24, min_periods=1).std()
    )
    
    # Calculate z-score
    data['height_zscore'] = (data['height'] - data['height_rolling_mean']) / data['height_rolling_std'].replace(0, 1)
    
    # Drop rows with NaN values
    data = data.dropna()
    
    return data

# Function to analyze alert frequency
def analyze_alert_frequency(data):
    """
    Analyze the frequency of alerts by type, station, and time
    """
    # Create output directory
    os.makedirs('visualizations', exist_ok=True)
    
    # Filter data with alerts
    alert_data = data[data['has_alert'] == True].copy()
    
    # Count alerts by type
    alert_counts_by_type = alert_data.groupby('alert_type').size().reset_index(name='count')
    
    # Create figure
    plt.figure(figsize=(10, 6))
    
    # Create bar chart
    sns.barplot(x='alert_type', y='count', data=alert_counts_by_type)
    
    # Add labels and title
    plt.xlabel('Alert Type')
    plt.ylabel('Count')
    plt.title('Alert Frequency by Type')
    plt.xticks(rotation=45)
    
    # Save figure
    plt.tight_layout()
    plt.savefig('visualizations/alert_frequency_by_type.png')
    plt.close()
    
    # Count alerts by station
    alert_counts_by_station = alert_data.groupby('stationName').size().reset_index(name='count')
    
    # Create figure
    plt.figure(figsize=(10, 6))
    
    # Create bar chart
    sns.barplot(x='stationName', y='count', data=alert_counts_by_station)
    
    # Add labels and title
    plt.xlabel('Station')
    plt.ylabel('Count')
    plt.title('Alert Frequency by Station')
    plt.xticks(rotation=45)
    
    # Save figure
    plt.tight_layout()
    plt.savefig('visualizations/alert_frequency_by_station.png')
    plt.close()
    
    # Count alerts by hour of day
    alert_counts_by_hour = alert_data.groupby('hour').size().reset_index(name='count')
    
    # Create figure
    plt.figure(figsize=(12, 6))
    
    # Create bar chart
    sns.barplot(x='hour', y='count', data=alert_counts_by_hour)
    
    # Add labels and title
    plt.xlabel('Hour of Day')
    plt.ylabel('Count')
    plt.title('Alert Frequency by Hour of Day')
    
    # Save figure
    plt.tight_layout()
    plt.savefig('visualizations/alert_frequency_by_hour.png')
    plt.close()
    
    # Count alerts by day of week
    day_names = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    alert_data['day_name'] = alert_data['day_of_week'].apply(lambda x: day_names[x])
    alert_counts_by_day = alert_data.groupby('day_name').size().reset_index(name='count')
    
    # Reorder days
    alert_counts_by_day['day_order'] = alert_counts_by_day['day_name'].apply(lambda x: day_names.index(x))
    alert_counts_by_day = alert_counts_by_day.sort_values('day_order')
    
    # Create figure
    plt.figure(figsize=(10, 6))
    
    # Create bar chart
    sns.barplot(x='day_name', y='count', data=alert_counts_by_day, order=day_names)
    
    # Add labels and title
    plt.xlabel('Day of Week')
    plt.ylabel('Count')
    plt.title('Alert Frequency by Day of Week')
    
    # Save figure
    plt.tight_layout()
    plt.savefig('visualizations/alert_frequency_by_day.png')
    plt.close()
    
    # Count alerts by month
    month_names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    alert_data['month_name'] = alert_data['month'].apply(lambda x: month_names[x-1])
    alert_counts_by_month = alert_data.groupby('month_name').size().reset_index(name='count')
    
    # Reorder months
    alert_counts_by_month['month_order'] = alert_counts_by_month['month_name'].apply(lambda x: month_names.index(x))
    alert_counts_by_month = alert_counts_by_month.sort_values('month_order')
    
    # Create figure
    plt.figure(figsize=(10, 6))
    
    # Create bar chart
    sns.barplot(x='month_name', y='count', data=alert_counts_by_month, order=month_names)
    
    # Add labels and title
    plt.xlabel('Month')
    plt.ylabel('Count')
    plt.title('Alert Frequency by Month')
    
    # Save figure
    plt.tight_layout()
    plt.savefig('visualizations/alert_frequency_by_month.png')
    plt.close()
    
    print("Alert frequency analysis visualizations saved")

# Function to analyze alert distribution
def analyze_alert_distribution(data):
    """
    Analyze the distribution of alerts by tide height and rate of change
    """
    # Create output directory
    os.makedirs('visualizations', exist_ok=True)
    
    # Create figure
    plt.figure(figsize=(12, 8))
    
    # Create scatter plot
    scatter = plt.scatter(
        data['height'],
        data['rate_of_change'],
        c=data['has_alert'].astype(int),
        cmap='coolwarm',
        alpha=0.6
    )
    
    # Add colorbar
    cbar = plt.colorbar(scatter)
    cbar.set_label('Has Alert')
    
    # Add labels and title
    plt.xlabel('Tide Height (m)')
    plt.ylabel('Rate of Change (m/15min)')
    plt.title('Alert Distribution by Tide Height and Rate of Change')
    plt.grid(True)
    
    # Save figure
    plt.tight_layout()
    plt.savefig('visualizations/alert_distribution.png')
    plt.close()
    
    # Create separate plots for each alert type
    alert_types = data[data['has_alert'] == True]['alert_type'].unique()
    
    # Create figure
    plt.figure(figsize=(12, 8))
    
    # Create scatter plot for each alert type
    for alert_type in alert_types:
        alert_data = data[data['alert_type'] == alert_type]
        plt.scatter(
            alert_data['height'],
            alert_data['rate_of_change'],
            label=alert_type,
            alpha=0.6
        )
    
    # Add non-alert data
    non_alert_data = data[data['has_alert'] == False].sample(min(1000, len(data[data['has_alert'] == False])))
    plt.scatter(
        non_alert_data['height'],
        non_alert_data['rate_of_change'],
        label='No Alert',
        alpha=0.1,
        color='gray'
    )
    
    # Add labels and title
    plt.xlabel('Tide Height (m)')
    plt.ylabel('Rate of Change (m/15min)')
    plt.title('Alert Types by Tide Height and Rate of Change')
    plt.grid(True)
    plt.legend()
    
    # Save figure
    plt.tight_layout()
    plt.savefig('visualizations/alert_types_distribution.png')
    plt.close()
    
    # Create histogram of tide heights for alerts vs. no alerts
    plt.figure(figsize=(12, 6))
    
    # Create histograms
    plt.hist(
        data[data['has_alert'] == True]['height'],
        bins=30,
        alpha=0.5,
        label='Has Alert'
    )
    plt.hist(
        data[data['has_alert'] == False]['height'].sample(min(len(data[data['has_alert'] == True]), len(data[data['has_alert'] == False]))),
        bins=30,
        alpha=0.5,
        label='No Alert'
    )
    
    # Add labels and title
    plt.xlabel('Tide Height (m)')
    plt.ylabel('Count')
    plt.title('Distribution of Tide Heights for Alerts vs. No Alerts')
    plt.grid(True)
    plt.legend()
    
    # Save figure
    plt.tight_layout()
    plt.savefig('visualizations/alert_height_distribution.png')
    plt.close()
    
    # Create histogram of rate of change for alerts vs. no alerts
    plt.figure(figsize=(12, 6))
    
    # Create histograms
    plt.hist(
        data[data['has_alert'] == True]['rate_of_change'],
        bins=30,
        alpha=0.5,
        label='Has Alert'
    )
    plt.hist(
        data[data['has_alert'] == False]['rate_of_change'].sample(min(len(data[data['has_alert'] == True]), len(data[data['has_alert'] == False]))),
        bins=30,
        alpha=0.5,
        label='No Alert'
    )
    
    # Add labels and title
    plt.xlabel('Rate of Change (m/15min)')
    plt.ylabel('Count')
    plt.title('Distribution of Rate of Change for Alerts vs. No Alerts')
    plt.grid(True)
    plt.legend()
    
    # Save figure
    plt.tight_layout()
    plt.savefig('visualizations/alert_roc_distribution.png')
    plt.close()
    
    print("Alert distribution analysis visualizations saved")

# Function to analyze alert patterns over time
def analyze_alert_patterns(data):
    """
    Analyze patterns of alerts over time
    """
    # Create output directory
    os.makedirs('visualizations', exist_ok=True)
    
    # Filter data with alerts
    alert_data = data[data['has_alert'] == True].copy()
    
    # Create time series of alert counts
    alert_data['date'] = alert_data['ts'].dt.date
    alert_counts_by_date = alert_data.groupby('date').size().reset_index(name='count')
    alert_counts_by_date['date'] = pd.to_datetime(alert_counts_by_date['date'])
    
    # Create figure
    plt.figure(figsize=(15, 6))
    
    # Create time series plot
    plt.plot(alert_counts_by_date['date'], alert_counts_by_date['count'])
    
    # Add labels and title
    plt.xlabel('Date')
    plt.ylabel('Alert Count')
    plt.title('Alert Frequency Over Time')
    plt.grid(True)
    
    # Format x-axis
    plt.gca().xaxis.set_major_formatter(mdates.DateFormatter('%Y-%m-%d'))
    plt.gca().xaxis.set_major_locator(mdates.WeekdayLocator(interval=2))
    plt.gcf().autofmt_xdate()
    
    # Save figure
    plt.tight_layout()
    plt.savefig('visualizations/alert_time_series.png')
    plt.close()
    
    # Create time series of alert counts by type
    alert_counts_by_date_type = alert_data.groupby(['date', 'alert_type']).size().reset_index(name='count')
    alert_counts_by_date_type['date'] = pd.to_datetime(alert_counts_by_date_type['date'])
    
    # Create figure
    plt.figure(figsize=(15, 8))
    
    # Create time series plot for each alert type
    for alert_type in alert_data['alert_type'].unique():
        type_data = alert_counts_by_date_type[alert_counts_by_date_type['alert_type'] == alert_type]
        plt.plot(type_data['date'], type_data['count'], label=alert_type)
    
    # Add labels and title
    plt.xlabel('Date')
    plt.ylabel('Alert Count')
    plt.title('Alert Frequency by Type Over Time')
    plt.grid(True)
    plt.legend()
    
    # Format x-axis
    plt.gca().xaxis.set_major_formatter(mdates.DateFormatter('%Y-%m-%d'))
    plt.gca().xaxis.set_major_locator(mdates.WeekdayLocator(interval=2))
    plt.gcf().autofmt_xdate()
    
    # Save figure
    plt.tight_layout()
    plt.savefig('visualizations/alert_type_time_series.png')
    plt.close()
    
    # Create heatmap of alert counts by hour and day of week
    alert_data['day_name'] = alert_data['day_of_week'].apply(lambda x: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][x])
    pivot_data = alert_data.pivot_table(
        index='day_name',
        columns='hour',
        values='alert_id',
        aggfunc='count'
    ).fillna(0)
    
    # Reorder days
    pivot_data = pivot_data.reindex(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'])
    
    # Create figure
    plt.figure(figsize=(15, 8))
    
    # Create heatmap
    sns.heatmap(
        pivot_data,
        cmap='viridis',
        annot=True,
        fmt='.0f',
        cbar_kws={'label': 'Alert Count'}
    )
    
    # Add labels and title
    plt.xlabel('Hour of Day')
    plt.ylabel('Day of Week')
    plt.title('Alert Frequency by Hour and Day of Week')
    
    # Save figure
    plt.tight_layout()
    plt.savefig('visualizations/alert_heatmap.png')
    plt.close()
    
    print("Alert pattern analysis visualizations saved")

# Function to analyze alert acknowledgment patterns
def analyze_alert_acknowledgment(data):
    """
    Analyze patterns of alert acknowledgment
    """
    # Create output directory
    os.makedirs('visualizations', exist_ok=True)
    
    # Filter data with alerts
    alert_data = data[data['has_alert'] == True].copy()
    
    # Count acknowledged vs. unacknowledged alerts
    ack_counts = alert_data.groupby('acknowledged').size().reset_index(name='count')
    ack_counts['acknowledged'] = ack_counts['acknowledged'].map({True: 'Acknowledged', False: 'Unacknowledged'})
    
    # Create figure
    plt.figure(figsize=(8, 6))
    
    # Create pie chart
    plt.pie(
        ack_counts['count'],
        labels=ack_counts['acknowledged'],
        autopct='%1.1f%%',
        startangle=90,
        colors=['#66b3ff', '#ff9999']
    )
    
    # Add title
    plt.title('Alert Acknowledgment Status')
    
    # Save figure
    plt.tight_layout()
    plt.savefig('visualizations/alert_acknowledgment_pie.png')
    plt.close()
    
    # Count acknowledged vs. unacknowledged alerts by type
    ack_counts_by_type = alert_data.groupby(['alert_type', 'acknowledged']).size().reset_index(name='count')
    ack_counts_by_type['acknowledged'] = ack_counts_by_type['acknowledged'].map({True: 'Acknowledged', False: 'Unacknowledged'})
    
    # Create figure
    plt.figure(figsize=(12, 6))
    
    # Create grouped bar chart
    sns.barplot(x='alert_type', y='count', hue='acknowledged', data=ack_counts_by_type)
    
    # Add labels and title
    plt.xlabel('Alert Type')
    plt.ylabel('Count')
    plt.title('Alert Acknowledgment by Type')
    plt.xticks(rotation=45)
    
    # Save figure
    plt.tight_layout()
    plt.savefig('visualizations/alert_acknowledgment_by_type.png')
    plt.close()
    
    # Count acknowledged vs. unacknowledged alerts by severity
    if 'severity' in alert_data.columns:
        ack_counts_by_severity = alert_data.groupby(['severity', 'acknowledged']).size().reset_index(name='count')
        ack_counts_by_severity['acknowledged'] = ack_counts_by_severity['acknowledged'].map({True: 'Acknowledged', False: 'Unacknowledged'})
        
        # Create figure
        plt.figure(figsize=(10, 6))
        
        # Create grouped bar chart
        sns.barplot(x='severity', y='count', hue='acknowledged', data=ack_counts_by_severity)
        
        # Add labels and title
        plt.xlabel('Alert Severity')
        plt.ylabel('Count')
        plt.title('Alert Acknowledgment by Severity')
        
        # Save figure
        plt.tight_layout()
        plt.savefig('visualizations/alert_acknowledgment_by_severity.png')
        plt.close()
    
    # Analyze time to acknowledgment (if we had real timestamps for acknowledgment)
    # This is a placeholder for future implementation
    
    print("Alert acknowledgment analysis visualizations saved")

# Function to analyze correlation between alerts and tide features
def analyze_alert_correlations(data):
    """
    Analyze correlations between alerts and tide features
    """
    # Create output directory
    os.makedirs('visualizations', exist_ok=True)
    
    # Select features for correlation analysis
    features = [
        'height', 'rate_of_change', 'height_rolling_mean', 'height_rolling_std',
        'height_zscore', 'time_of_day', 'has_alert'
    ]
    
    # Calculate correlation matrix
    corr = data[features].corr()
    
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
    plt.title('Correlation Between Tide Features and Alerts')
    
    # Save figure
    plt.tight_layout()
    plt.savefig('visualizations/alert_correlation_matrix.png')
    plt.close()
    
    # Create scatter plots for key correlations
    key_features = ['height', 'rate_of_change', 'height_zscore']
    
    for feature in key_features:
        # Create figure
        plt.figure(figsize=(10, 6))
        
        # Create box plot
        sns.boxplot(x='has_alert', y=feature, data=data)
        
        # Add labels and title
        plt.xlabel('Has Alert')
        plt.ylabel(feature)
        plt.title(f'Distribution of {feature} by Alert Status')
        
        # Save figure
        plt.tight_layout()
        plt.savefig(f'visualizations/alert_vs_{feature}_boxplot.png')
        plt.close()
    
    print("Alert correlation analysis visualizations saved")

# Function to build a predictive model for alerts
def build_alert_prediction_model(data):
    """
    Build a predictive model for alerts based on tide features
    """
    # Create output directory
    os.makedirs('models', exist_ok=True)
    
    # Select features for model
    features = [
        'height', 'rate_of_change', 'height_rolling_mean', 'height_rolling_std',
        'height_zscore', 'time_of_day', 'sin_time', 'cos_time'
    ]
    
    # Add cyclical time features
    data['sin_time'] = np.sin(2 * np.pi * data['time_of_day'] / 24)
    data['cos_time'] = np.cos(2 * np.pi * data['time_of_day'] / 24)
    
    # Prepare data
    X = data[features]
    y = data['has_alert']
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Train model
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train_scaled, y_train)
    
    # Evaluate model
    y_pred = model.predict(X_test_scaled)
    
    # Print classification report
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))
    
    # Print confusion matrix
    cm = confusion_matrix(y_test, y_pred)
    print("\nConfusion Matrix:")
    print(cm)
    
    # Create figure for confusion matrix
    plt.figure(figsize=(8, 6))
    
    # Create heatmap
    sns.heatmap(
        cm,
        annot=True,
        fmt='d',
        cmap='Blues',
        xticklabels=['No Alert', 'Alert'],
        yticklabels=['No Alert', 'Alert']
    )
    
    # Add labels and title
    plt.xlabel('Predicted')
    plt.ylabel('Actual')
    plt.title('Confusion Matrix for Alert Prediction')
    
    # Save figure
    plt.tight_layout()
    plt.savefig('visualizations/alert_confusion_matrix.png')
    plt.close()
    
    # Create feature importance plot
    plt.figure(figsize=(10, 6))
    
    # Get feature importances
    importances = model.feature_importances_
    indices = np.argsort(importances)[::-1]
    
    # Create bar chart
    plt.bar(range(len(importances)), importances[indices])
    plt.xticks(range(len(importances)), [features[i] for i in indices], rotation=45)
    
    # Add labels and title
    plt.xlabel('Features')
    plt.ylabel('Importance')
    plt.title('Feature Importance for Alert Prediction')
    
    # Save figure
    plt.tight_layout()
    plt.savefig('visualizations/alert_feature_importance.png')
    plt.close()
    
    # Save model and scaler
    import joblib
    joblib.dump(model, 'models/alert_prediction_model.pkl')
    joblib.dump(scaler, 'models/alert_prediction_scaler.pkl')
    joblib.dump(features, 'models/alert_prediction_features.pkl')
    
    print("Alert prediction model saved")
    
    return model, scaler, features

# Function to generate alert insights
def generate_alert_insights(data, model=None, scaler=None, features=None):
    """
    Generate insights about alerts based on analysis
    """
    # Create output directory
    os.makedirs('insights', exist_ok=True)
    
    # Filter data with alerts
    alert_data = data[data['has_alert'] == True].copy()
    
    # Calculate basic statistics
    total_alerts = len(alert_data)
    alert_rate = total_alerts / len(data) * 100
    alerts_by_type = alert_data.groupby('alert_type').size()
    most_common_type = alerts_by_type.idxmax()
    
    # Calculate time-based statistics
    alerts_by_hour = alert_data.groupby('hour').size()
    peak_hour = alerts_by_hour.idxmax()
    
    alerts_by_day = alert_data.groupby('day_of_week').size()
    peak_day = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][alerts_by_day.idxmax()]
    
    # Calculate station-based statistics
    alerts_by_station = alert_data.groupby('stationName').size()
    most_alerted_station = alerts_by_station.idxmax()
    
    # Calculate acknowledgment statistics
    if 'acknowledged' in alert_data.columns:
        ack_rate = alert_data['acknowledged'].mean() * 100
    else:
        ack_rate = 'N/A'
    
    # Generate insights text
    insights = f"""# Alert Pattern Analysis Insights

## Overview
- Total Alerts: {total_alerts}
- Alert Rate: {alert_rate:.2f}% of all readings
- Most Common Alert Type: {most_common_type}

## Temporal Patterns
- Peak Alert Hour: {peak_hour}:00
- Peak Alert Day: {peak_day}

## Spatial Patterns
- Station with Most Alerts: {most_alerted_station}

## Acknowledgment Patterns
- Alert Acknowledgment Rate: {ack_rate if isinstance(ack_rate, str) else f'{ack_rate:.2f}%'}

## Key Correlations
- Height Correlation with Alerts: {data['height'].corr(data['has_alert']):.2f}
- Rate of Change Correlation with Alerts: {data['rate_of_change'].corr(data['has_alert']):.2f}

## Recommendations
"""
    
    # Add model-based recommendations if model is provided
    if model is not None and scaler is not None and features is not None:
        # Get feature importances
        importances = model.feature_importances_
        indices = np.argsort(importances)[::-1]
        top_features = [features[i] for i in indices[:3]]
        
        insights += f"""### Based on Predictive Model
- Top Predictive Features: {', '.join(top_features)}
- Focus monitoring efforts on these key features for early alert detection
- Consider adjusting alert thresholds based on the predictive model
"""
    
    # Add general recommendations
    insights += f"""
### General Recommendations
- Monitor {most_common_type} alerts closely as they are the most frequent
- Increase staffing during peak alert hours ({peak_hour}:00) and days ({peak_day})
- Pay special attention to {most_alerted_station} as it generates the most alerts
- {'Improve alert acknowledgment processes to increase the acknowledgment rate' if isinstance(ack_rate, (int, float)) and ack_rate < 80 else 'Maintain current alert acknowledgment processes'}

## Next Steps
- Implement automated alert prioritization based on severity and frequency
- Develop station-specific alert thresholds based on historical patterns
- Create a dashboard to monitor alert patterns in real-time
- Conduct regular reviews of alert effectiveness and adjust thresholds accordingly
"""
    
    # Save insights to file
    with open('insights/alert_insights.md', 'w') as f:
        f.write(insights)
    
    print("Alert insights saved to 'insights/alert_insights.md'")

# Main function
def main():
    print("Coastle Alert - Alert Pattern Analysis")
    print("=====================================")
    
    # Create necessary directories
    os.makedirs('visualizations', exist_ok=True)
    os.makedirs('models', exist_ok=True)
    os.makedirs('insights', exist_ok=True)
    
    # Load data
    print("\nLoading alert and tide data...")
    data = load_data(from_csv=True)
    print(f"Loaded {len(data)} data points.")
    
    # Preprocess data
    print("\nPreprocessing data...")
    processed_data = preprocess_data(data)
    
    # Analyze alert frequency
    print("\nAnalyzing alert frequency...")
    analyze_alert_frequency(processed_data)
    
    # Analyze alert distribution
    print("\nAnalyzing alert distribution...")
    analyze_alert_distribution(processed_data)
    
    # Analyze alert patterns
    print("\nAnalyzing alert patterns over time...")
    analyze_alert_patterns(processed_data)
    
    # Analyze alert acknowledgment
    print("\nAnalyzing alert acknowledgment patterns...")
    analyze_alert_acknowledgment(processed_data)
    
    # Analyze correlations
    print("\nAnalyzing correlations between alerts and tide features...")
    analyze_alert_correlations(processed_data)
    
    # Build predictive model
    print("\nBuilding alert prediction model...")
    model, scaler, features = build_alert_prediction_model(processed_data)
    
    # Generate insights
    print("\nGenerating alert insights...")
    generate_alert_insights(processed_data, model, scaler, features)
    
    print("\nAlert pattern analysis complete!")

if __name__ == "__main__":
    main()