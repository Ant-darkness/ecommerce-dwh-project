import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Use environment variable in Docker, fallback to localhost for local dev
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+psycopg2://airflow:airflow@localhost:5432/dwh_db"
)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
