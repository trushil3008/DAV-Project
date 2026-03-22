"""
Data Processor Module for YouTube Trending Videos Analysis
Supports multiple country datasets
"""

import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from typing import Dict, List, Any, Optional
import os
import json

# Country configurations
COUNTRIES = {
    'IN': {'name': 'India', 'flag': '🇮🇳'},
    'US': {'name': 'United States', 'flag': '🇺🇸'},
    'GB': {'name': 'United Kingdom', 'flag': '🇬🇧'},
    'CA': {'name': 'Canada', 'flag': '🇨🇦'},
    'DE': {'name': 'Germany', 'flag': '🇩🇪'},
    'FR': {'name': 'France', 'flag': '🇫🇷'},
    'JP': {'name': 'Japan', 'flag': '🇯🇵'},
    'KR': {'name': 'South Korea', 'flag': '🇰🇷'},
    'MX': {'name': 'Mexico', 'flag': '🇲🇽'},
    'RU': {'name': 'Russia', 'flag': '🇷🇺'},
}

# Default YouTube Category ID to Name Mapping
DEFAULT_CATEGORY_MAPPING = {
    1: "Film & Animation",
    2: "Autos & Vehicles",
    10: "Music",
    15: "Pets & Animals",
    17: "Sports",
    18: "Short Movies",
    19: "Travel & Events",
    20: "Gaming",
    21: "Videoblogging",
    22: "People & Blogs",
    23: "Comedy",
    24: "Entertainment",
    25: "News & Politics",
    26: "Howto & Style",
    27: "Education",
    28: "Science & Technology",
    29: "Nonprofits & Activism",
    30: "Movies",
    31: "Anime/Animation",
    32: "Action/Adventure",
    33: "Classics",
    34: "Comedy",
    35: "Documentary",
    36: "Drama",
    37: "Family",
    38: "Foreign",
    39: "Horror",
    40: "Sci-Fi/Fantasy",
    41: "Thriller",
    42: "Shorts",
    43: "Shows",
    44: "Trailers"
}


def load_category_mapping(country_code: str, datasets_dir: str) -> Dict[int, str]:
    """Load category mapping from JSON file if available"""
    json_path = os.path.join(datasets_dir, f'{country_code}_category_id.json')
    
    if os.path.exists(json_path):
        try:
            with open(json_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                mapping = {}
                for item in data.get('items', []):
                    cat_id = int(item.get('id', 0))
                    cat_name = item.get('snippet', {}).get('title', 'Unknown')
                    mapping[cat_id] = cat_name
                if mapping:
                    return mapping
        except Exception as e:
            print(f"Error loading category mapping for {country_code}: {e}")
    
    return DEFAULT_CATEGORY_MAPPING


class DataProcessor:
    """Main data processor class that handles all data operations for a specific country"""
    
    def __init__(self, csv_path: str, category_mapping: Dict[int, str]):
        self.csv_path = csv_path
        self.category_mapping = category_mapping
        self.df = None
        self.processed = False
        
    def load_and_preprocess(self) -> bool:
        """Load CSV and perform preprocessing"""
        try:
            # Load the dataset with error handling for encoding
            try:
                self.df = pd.read_csv(self.csv_path, encoding='utf-8')
            except UnicodeDecodeError:
                self.df = pd.read_csv(self.csv_path, encoding='latin-1')
            
            # Convert date columns with error handling
            self.df['publish_time'] = pd.to_datetime(self.df['publish_time'], errors='coerce')
            
            # Try different date formats for trending_date
            try:
                self.df['trending_date'] = pd.to_datetime(self.df['trending_date'], format='%y.%d.%m')
            except:
                try:
                    self.df['trending_date'] = pd.to_datetime(self.df['trending_date'], errors='coerce')
                except:
                    self.df['trending_date'] = pd.Timestamp.now()
            
            # Calculate time_to_trend (hours between publish and trending)
            try:
                publish_naive = self.df['publish_time'].dt.tz_localize(None)
                self.df['time_to_trend'] = (self.df['trending_date'] - publish_naive).dt.total_seconds() / 3600
            except:
                self.df['time_to_trend'] = 0
            
            # Handle missing numeric columns
            for col in ['views', 'likes', 'dislikes', 'comment_count']:
                if col not in self.df.columns:
                    self.df[col] = 0
                self.df[col] = pd.to_numeric(self.df[col], errors='coerce').fillna(0)
            
            # Calculate engagement_rate
            self.df['engagement_rate'] = np.where(
                self.df['views'] > 0,
                (self.df['likes'] + self.df['comment_count']) / self.df['views'],
                0
            )
            
            # Extract publish_hour
            self.df['publish_hour'] = self.df['publish_time'].dt.hour.fillna(12).astype(int)
            
            # Map category names
            self.df['category_name'] = self.df['category_id'].map(self.category_mapping).fillna('Unknown')
            
            # Clean up invalid time_to_trend values
            self.df['time_to_trend'] = self.df['time_to_trend'].clip(lower=0, upper=8760)  # Max 1 year
            
            self.processed = True
            return True
        except Exception as e:
            print(f"Error loading data: {e}")
            import traceback
            traceback.print_exc()
            return False
    
    def get_overview(self) -> Dict[str, Any]:
        """Get dataset overview statistics"""
        if not self.processed:
            self.load_and_preprocess()
            
        return {
            "total_videos": int(len(self.df)),
            "unique_videos": int(self.df['video_id'].nunique()) if 'video_id' in self.df.columns else int(len(self.df)),
            "total_channels": int(self.df['channel_title'].nunique()) if 'channel_title' in self.df.columns else 0,
            "total_categories": int(self.df['category_id'].nunique()) if 'category_id' in self.df.columns else 0,
            "avg_views": float(self.df['views'].mean()),
            "avg_likes": float(self.df['likes'].mean()),
            "avg_comments": float(self.df['comment_count'].mean()),
            "avg_engagement_rate": float(self.df['engagement_rate'].mean()),
            "avg_time_to_trend": float(self.df['time_to_trend'].mean()),
            "median_time_to_trend": float(self.df['time_to_trend'].median()),
            "total_views": int(self.df['views'].sum()),
            "total_likes": int(self.df['likes'].sum()),
            "date_range": {
                "start": str(self.df['trending_date'].min().date()) if pd.notna(self.df['trending_date'].min()) else "N/A",
                "end": str(self.df['trending_date'].max().date()) if pd.notna(self.df['trending_date'].max()) else "N/A"
            }
        }
    
    def get_engagement_data(self, sample_size: int = 5000) -> Dict[str, Any]:
        """Get engagement analysis data (views vs likes, views vs comments)"""
        if not self.processed:
            self.load_and_preprocess()
        
        # Sample data for scatter plots (full dataset too large for frontend)
        sample_df = self.df.sample(n=min(sample_size, len(self.df)), random_state=42)
        
        return {
            "scatter_data": {
                "views": sample_df['views'].tolist(),
                "likes": sample_df['likes'].tolist(),
                "comments": sample_df['comment_count'].tolist(),
                "engagement_rate": sample_df['engagement_rate'].tolist(),
                "titles": sample_df['title'].str[:50].tolist() if 'title' in sample_df.columns else []
            },
            "engagement_distribution": {
                "bins": np.histogram(self.df['engagement_rate'].clip(0, 0.2), bins=50)[1].tolist(),
                "counts": np.histogram(self.df['engagement_rate'].clip(0, 0.2), bins=50)[0].tolist()
            },
            "statistics": {
                "mean_engagement": float(self.df['engagement_rate'].mean()),
                "median_engagement": float(self.df['engagement_rate'].median()),
                "std_engagement": float(self.df['engagement_rate'].std()),
                "max_engagement": float(self.df['engagement_rate'].max()),
                "correlation_views_likes": float(self.df['views'].corr(self.df['likes'])),
                "correlation_views_comments": float(self.df['views'].corr(self.df['comment_count']))
            }
        }
    
    def get_category_data(self) -> Dict[str, Any]:
        """Get category analysis data"""
        if not self.processed:
            self.load_and_preprocess()
        
        # Category counts
        category_counts = self.df.groupby(['category_id', 'category_name']).size().reset_index(name='video_count')
        category_counts = category_counts.sort_values('video_count', ascending=False)
        
        # Average views by category
        avg_views = self.df.groupby(['category_id', 'category_name'])['views'].mean().reset_index(name='avg_views')
        avg_views = avg_views.sort_values('avg_views', ascending=False)
        
        # Average engagement by category
        avg_engagement = self.df.groupby(['category_id', 'category_name'])['engagement_rate'].mean().reset_index(name='avg_engagement')
        
        return {
            "category_counts": {
                "category_ids": category_counts['category_id'].tolist(),
                "category_names": category_counts['category_name'].tolist(),
                "counts": category_counts['video_count'].tolist()
            },
            "avg_views_by_category": {
                "category_ids": avg_views['category_id'].tolist(),
                "category_names": avg_views['category_name'].tolist(),
                "avg_views": avg_views['avg_views'].tolist()
            },
            "avg_engagement_by_category": {
                "category_ids": avg_engagement['category_id'].tolist(),
                "category_names": avg_engagement['category_name'].tolist(),
                "avg_engagement": avg_engagement['avg_engagement'].tolist()
            },
            "insights": {
                "most_frequent_category": category_counts.iloc[0]['category_name'] if len(category_counts) > 0 else "N/A",
                "most_frequent_count": int(category_counts.iloc[0]['video_count']) if len(category_counts) > 0 else 0,
                "highest_avg_views_category": avg_views.iloc[0]['category_name'] if len(avg_views) > 0 else "N/A",
                "highest_avg_views": float(avg_views.iloc[0]['avg_views']) if len(avg_views) > 0 else 0
            }
        }
    
    def get_time_analysis(self) -> Dict[str, Any]:
        """Get time-based analysis data"""
        if not self.processed:
            self.load_and_preprocess()
        
        # Time to trend distribution (limit to 0-200 hours for visualization)
        time_to_trend_clipped = self.df['time_to_trend'].clip(0, 200)
        hist_counts, hist_bins = np.histogram(time_to_trend_clipped, bins=100)
        
        # Publish hour frequency
        hour_counts = self.df['publish_hour'].value_counts().sort_index()
        
        # Hourly metrics
        hourly_metrics = self.df.groupby('publish_hour').agg({
            'time_to_trend': 'mean',
            'views': 'mean'
        }).reset_index()
        
        # Find optimal hours
        best_speed_hour = int(hourly_metrics.loc[hourly_metrics['time_to_trend'].idxmin(), 'publish_hour']) if len(hourly_metrics) > 0 else 12
        best_reach_hour = int(hourly_metrics.loc[hourly_metrics['views'].idxmax(), 'publish_hour']) if len(hourly_metrics) > 0 else 12
        
        return {
            "time_to_trend_distribution": {
                "bins": hist_bins.tolist(),
                "counts": hist_counts.tolist()
            },
            "publish_hour_frequency": {
                "hours": hour_counts.index.tolist(),
                "counts": hour_counts.values.tolist()
            },
            "hourly_metrics": {
                "hours": hourly_metrics['publish_hour'].tolist(),
                "avg_time_to_trend": hourly_metrics['time_to_trend'].tolist(),
                "avg_views": hourly_metrics['views'].tolist()
            },
            "statistics": {
                "mean_time_to_trend": float(self.df['time_to_trend'].mean()),
                "median_time_to_trend": float(self.df['time_to_trend'].median()),
                "optimal_hour_speed": best_speed_hour,
                "optimal_hour_reach": best_reach_hour,
                "peak_publish_hour": int(hour_counts.idxmax()) if len(hour_counts) > 0 else 12,
                "peak_publish_count": int(hour_counts.max()) if len(hour_counts) > 0 else 0
            }
        }
    
    def get_correlation_matrix(self) -> Dict[str, Any]:
        """Get correlation matrix for engagement metrics"""
        if not self.processed:
            self.load_and_preprocess()
        
        # Select numerical columns for correlation
        engagement_cols = ['views', 'likes', 'dislikes', 'comment_count']
        available_cols = [col for col in engagement_cols if col in self.df.columns]
        corr_matrix = self.df[available_cols].corr()
        
        return {
            "labels": available_cols,
            "matrix": corr_matrix.values.tolist(),
            "insights": {
                "views_likes_corr": float(corr_matrix.loc['views', 'likes']) if 'likes' in available_cols else 0,
                "views_comments_corr": float(corr_matrix.loc['views', 'comment_count']) if 'comment_count' in available_cols else 0,
                "likes_comments_corr": float(corr_matrix.loc['likes', 'comment_count']) if 'likes' in available_cols and 'comment_count' in available_cols else 0,
                "dislikes_comments_corr": float(corr_matrix.loc['dislikes', 'comment_count']) if 'dislikes' in available_cols and 'comment_count' in available_cols else 0
            }
        }
    
    def get_tags_data(self, max_words: int = 200) -> Dict[str, Any]:
        """Get tag frequency data for word cloud"""
        if not self.processed:
            self.load_and_preprocess()
        
        if 'tags' not in self.df.columns:
            return {
                "words": [],
                "total_tags_processed": 0,
                "unique_words": 0
            }
        
        # Combine all tags
        tags_series = self.df['tags'].fillna('')
        tags_filtered = tags_series[tags_series != '[none]']
        combined_tags = ' '.join(tags_filtered)
        
        # Clean tags
        cleaned_tags = combined_tags.replace('"', '').replace('|', ' ')
        
        # Split into words and count frequency
        words = cleaned_tags.lower().split()
        
        # Remove common stopwords
        stopwords = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 
                     'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been',
                     'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
                     'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'need',
                     'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it',
                     'we', 'they', 'what', 'which', 'who', 'whom', 'whose', 'where',
                     'when', 'why', 'how', 'all', 'each', 'every', 'both', 'few', 'more',
                     'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own',
                     'same', 'so', 'than', 'too', 'very', 'just', 'video', 'videos', ''}
        
        word_freq = {}
        for word in words:
            if word not in stopwords and len(word) > 2:
                word_freq[word] = word_freq.get(word, 0) + 1
        
        # Sort by frequency and get top words
        sorted_words = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)[:max_words]
        
        return {
            "words": [{"text": word, "value": count} for word, count in sorted_words],
            "total_tags_processed": len(words),
            "unique_words": len(word_freq)
        }
    
    def get_clusters(self, n_clusters: int = 4, sample_size: int = 5000) -> Dict[str, Any]:
        """Perform K-Means clustering on engagement metrics"""
        if not self.processed:
            self.load_and_preprocess()
        
        # Select features for clustering
        features = ['views', 'likes', 'comment_count']
        clustering_data = self.df[features].copy()
        
        # Scale features
        scaler = StandardScaler()
        scaled_features = scaler.fit_transform(clustering_data)
        
        # Perform K-Means clustering
        kmeans = KMeans(n_clusters=n_clusters, init='k-means++', random_state=42, n_init=10)
        cluster_labels = kmeans.fit_predict(scaled_features)
        
        # Add cluster labels to dataframe
        self.df['cluster'] = cluster_labels
        
        # Get cluster statistics
        cluster_stats = self.df.groupby('cluster').agg({
            'views': ['mean', 'count'],
            'likes': 'mean',
            'comment_count': 'mean',
            'engagement_rate': 'mean'
        }).reset_index()
        
        cluster_stats.columns = ['cluster', 'avg_views', 'count', 'avg_likes', 'avg_comments', 'avg_engagement']
        
        # Sample data for visualization
        sample_df = self.df.sample(n=min(sample_size, len(self.df)), random_state=42)
        
        # Calculate WCSS for elbow chart
        wcss = []
        for i in range(1, 11):
            km = KMeans(n_clusters=i, init='k-means++', random_state=42, n_init=10)
            km.fit(scaled_features)
            wcss.append(float(km.inertia_))
        
        return {
            "scatter_data": {
                "views": sample_df['views'].tolist(),
                "likes": sample_df['likes'].tolist(),
                "comments": sample_df['comment_count'].tolist(),
                "clusters": sample_df['cluster'].tolist(),
                "titles": sample_df['title'].str[:50].tolist() if 'title' in sample_df.columns else []
            },
            "cluster_stats": {
                "clusters": cluster_stats['cluster'].tolist(),
                "avg_views": cluster_stats['avg_views'].tolist(),
                "counts": cluster_stats['count'].tolist(),
                "avg_likes": cluster_stats['avg_likes'].tolist(),
                "avg_comments": cluster_stats['avg_comments'].tolist(),
                "avg_engagement": cluster_stats['avg_engagement'].tolist()
            },
            "elbow_data": {
                "k_values": list(range(1, 11)),
                "wcss": wcss
            },
            "cluster_distribution": self.df['cluster'].value_counts().to_dict()
        }


# Cache for processors by country
_processors: Dict[str, DataProcessor] = {}

def get_datasets_dir() -> str:
    """Get the datasets directory path"""
    base_dir = os.path.dirname(os.path.abspath(__file__))
    return os.path.join(base_dir, 'datasets')

def get_available_countries() -> List[Dict[str, str]]:
    """Get list of available countries with datasets"""
    datasets_dir = get_datasets_dir()
    available = []
    
    for code, info in COUNTRIES.items():
        csv_path = os.path.join(datasets_dir, f'{code}videos.csv')
        if os.path.exists(csv_path):
            available.append({
                'code': code,
                'name': info['name'],
                'flag': info['flag']
            })
    
    return sorted(available, key=lambda x: x['name'])

def get_processor(country_code: str = 'IN') -> DataProcessor:
    """Get or create the data processor for a specific country"""
    global _processors
    
    # Validate country code
    country_code = country_code.upper()
    if country_code not in COUNTRIES:
        country_code = 'IN'  # Default to India
    
    if country_code not in _processors:
        datasets_dir = get_datasets_dir()
        csv_path = os.path.join(datasets_dir, f'{country_code}videos.csv')
        
        # Check if file exists
        if not os.path.exists(csv_path):
            # Fallback to data folder
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            csv_path = os.path.join(base_dir, 'data', f'{country_code}videos.csv')
        
        # Load category mapping
        category_mapping = load_category_mapping(country_code, datasets_dir)
        
        _processors[country_code] = DataProcessor(csv_path, category_mapping)
        _processors[country_code].load_and_preprocess()
    
    return _processors[country_code]
