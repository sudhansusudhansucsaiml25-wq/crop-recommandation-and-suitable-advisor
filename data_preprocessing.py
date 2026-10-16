"""
Crop Recommendation & Suitability Advisor
Data Preprocessing Script
Dataset expected columns: N, P, K, temperature, humidity, ph, rainfall, label
"""

import pandas as pd
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.model_selection import train_test_split
import joblib


# Step 1: Load the dataset
df = pd.read_csv("Crop_recommendation.csv")

print("Shape of dataset:", df.shape)
print("\nColumn names:", list(df.columns))
print("\nFirst 5 rows:")
print(df.head())



# Step 2: Basic data quality checks
# check for missing values in each column
print("\nMissing values per column:")
print(df.isnull().sum())

# check for duplicate rows
duplicate_count = df.duplicated().sum()
print("\nNumber of duplicate rows:", duplicate_count)

# drop duplicates if any are found
if duplicate_count > 0:
    df = df.drop_duplicates()
    print("Duplicates removed. New shape:", df.shape)

# check how many unique crops (classes) are present
print("\nNumber of unique crops:", df['label'].nunique())
print("\nSamples per crop:")
print(df['label'].value_counts())

# basic statistics for each numeric column (min, max, mean, std)
print("\nStatistical summary:")
print(df.describe())



# Step 3: Separate features (X) and target (y)
X = df.drop('label', axis=1)   
y = df['label']              



# Step 4: Encode the target labels

# Machine learning models need numbers, not text labels,
# so we convert crop names into numeric codes (0, 1, 2, ... 21)

label_encoder = LabelEncoder()
y_encoded = label_encoder.fit_transform(y)

print("\nLabel encoding example:")
for i in range(5):
    print(f"{y.iloc[i]} -> {y_encoded[i]}")



# Step 5: Feature scaling
# Scaling brings all features to a similar range.

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)



# Step 6: Train-test split
# 80% of the data is used for training, 20% for testing.

X_train, X_test, y_train, y_test = train_test_split(
    X_scaled,
    y_encoded,
    test_size=0.2,
    random_state=42,
    stratify=y_encoded
)

print("\nTraining set size:", X_train.shape)
print("Testing set size:", X_test.shape)


# Step 7: Save the preprocessing objects
# These are saved so the same encoder/scaler can be reused
joblib.dump(label_encoder, "label_encoder.pkl")
joblib.dump(scaler, "scaler.pkl")

print("\nPreprocessing complete.")
print("Saved files: label_encoder.pkl, scaler.pkl")
