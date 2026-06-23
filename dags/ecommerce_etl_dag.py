from datetime import datetime, timedelta
from airflow import DAG
from airflow.operators.bash import BashOperator

default_args = {
    "owner": "data_engineering_team",
    "depends_on_past": False,
    "start_date": datetime(2026, 1, 1),
    "email_on_failure": False,
    "retries": 2,
    "retry_delay": timedelta(minutes=2),
}

with DAG(
    dag_id="complete_ecommerce_dwh_pipeline",
    default_args=default_args,
    description="End-to-end E-Commerce DWH pipeline: generate → ETL → ML churn prediction",
    schedule_interval="@daily",
    catchup=False,
    tags=["ecommerce", "dwh", "etl", "ml"],
) as dag:

    # Task 1 — Generate synthetic raw data from 5 sources using Faker
    generate_data = BashOperator(
        task_id="generate_faker_data",
        bash_command="python3 /opt/airflow/scripts/generate_sources.py",
    )

    # Task 2 — Extract CSVs, clean and load into DWH fact table
    run_etl = BashOperator(
        task_id="run_etl_pipeline",
        bash_command="python3 /opt/airflow/scripts/etl_process.py",
    )

    # Task 3 — Train K-Means churn model and update fact table predictions
    run_ml = BashOperator(
        task_id="ml_customer_churn_prediction",
        bash_command="python3 /opt/airflow/scripts/train_model.py",
    )

    # Orchestration: sequential pipeline
    generate_data >> run_etl >> run_ml
