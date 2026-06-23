import pandas as pd
from sqlalchemy import create_engine

engine = create_engine(
    'postgresql+psycopg2://airflow:airflow@postgres:5432/dwh_db')


def load_staging():
    # Extract & Load to Staging
    for name in ['crm_users', 'web_logs', 'pos_sales', 'support_tickets', 'marketing_campaigns']:
        df = pd.read_csv(f'/tmp/raw_data/{name}.csv')
        df.to_sql(f'stage_{name}', engine, if_exists='replace', index=False)


def transform_and_build_fact():
    # Read Staging Tables
    users = pd.read_sql('SELECT * FROM stage_crm_users', engine)
    logs = pd.read_sql(
        'SELECT user_id, AVG(session_duration) as avg_session FROM stage_web_logs GROUP BY user_id', engine)
    sales = pd.read_sql(
        'SELECT user_id, SUM(amount) as total_spend FROM stage_pos_sales GROUP BY user_id', engine)
    tickets = pd.read_sql(
        "SELECT user_id, COUNT(ticket_id) as total_tickets FROM stage_support_tickets WHERE priority='High' GROUP BY user_id", engine)
    marketing = pd.read_sql(
        'SELECT user_id, MAX(converted::int) as converted FROM stage_marketing_campaigns GROUP BY user_id', engine)

    # Transformation: Merge all into one Single Layer Table (OBT)
    fact = users.merge(sales, on='user_id', how='left')\
                .merge(logs, on='user_id', how='left')\
                .merge(tickets, on='user_id', how='left')\
                .merge(marketing, on='user_id', how='left')

    # Data Cleansing
    fact['total_spend'] = fact['total_spend'].fillna(0)
    fact['avg_session_duration'] = fact['avg_session'].fillna(0).astype(int)
    fact['total_tickets'] = fact['total_tickets'].fillna(0).astype(int)
    fact['marketing_converted'] = fact['converted'].fillna(0).astype(bool)
    fact['is_churned'] = 0  # Default placeholder before ML model runs

    fact.drop(['avg_session', 'converted'], axis=1, inplace=True)
    fact.to_sql('fact_customer_analytics', engine,
                if_exists='replace', index=False)


if __name__ == '__main__':
    load_staging()
    transform_and_build_fact()
