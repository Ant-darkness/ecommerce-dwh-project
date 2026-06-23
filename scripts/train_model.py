import pandas as pd
from sqlalchemy import create_engine
from sklearn.cluster import KMeans
import joblib
import os

engine = create_engine(
    os.getenv("DATABASE_URL",
               "postgresql+psycopg2://airflow:airflow@postgres:5432/dwh_db")
)

MODEL_PATH = "/tmp/churn_model.pkl"


def train_and_predict():
    df = pd.read_sql("SELECT * FROM fact_customer_analytics", engine)

    if len(df) == 0:
        print("No data found in fact_customer_analytics — skipping ML step.")
        return

    features = ["total_spend", "avg_session_duration", "total_tickets"]
    X = df[features].fillna(0)

    # Train K-Means with 2 clusters (churned vs retained)
    kmeans = KMeans(n_clusters=2, random_state=42, n_init=10)
    df["cluster"] = kmeans.fit_predict(X)

    # Identify which cluster represents churn risk:
    # Churned customers tend to have LOWER spend and HIGHER support tickets
    cluster_profiles = df.groupby("cluster")[features].mean()
    # Churn cluster = lower total_spend and higher total_tickets
    churn_cluster = (
        cluster_profiles["total_spend"] - cluster_profiles["total_tickets"]
    ).idxmin()

    df["is_churned"] = (df["cluster"] == churn_cluster).astype(int)
    df.drop(columns=["cluster"], inplace=True)

    # Persist model for future inference
    joblib.dump(kmeans, MODEL_PATH)
    print(f"Model saved to {MODEL_PATH}")

    # Write predictions back to DWH production layer
    df.to_sql("fact_customer_analytics", engine,
              if_exists="replace", index=False)
    print(f"Churn predictions written — {df['is_churned'].sum()} customers flagged as churn risk.")


if __name__ == "__main__":
    train_and_predict()
