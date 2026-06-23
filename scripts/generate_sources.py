import os
import pandas as pd
from faker import Faker
import random

fake = Faker()
num_records = 5000
os.makedirs('/tmp/raw_data', exist_ok=True)

# Source 1: CRM Users
users = [{'user_id': f"USR_{i}", 'name': fake.name(), 'email': fake.email(
), 'country': fake.country(), 'created_at': fake.date_time_this_year()} for i in range(num_records)]
pd.DataFrame(users).to_csv('/tmp/raw_data/crm_users.csv', index=False)

# Source 2: Web Logs
logs = [{'log_id': f"LOG_{i}", 'user_id': f"USR_{random.randint(0, num_records-1)}", 'session_duration': random.randint(
    10, 600), 'pages_visited': random.randint(1, 15), 'device': random.choice(['Mobile', 'Desktop', 'Tablet'])} for i in range(num_records)]
pd.DataFrame(logs).to_csv('/tmp/raw_data/web_logs.csv', index=False)

# Source 3: POS Sales
sales = [{'sale_id': f"SAL_{i}", 'user_id': f"USR_{random.randint(0, num_records-1)}", 'amount': round(random.uniform(
    5.0, 500.0), 2), 'branch': fake.city(), 'sale_date': fake.date_time_this_year()} for i in range(num_records)]
pd.DataFrame(sales).to_csv('/tmp/raw_data/pos_sales.csv', index=False)

# Source 4: Support Tickets
tickets = [{'ticket_id': f"TCK_{i}", 'user_id': f"USR_{random.randint(0, num_records-1)}", 'priority': random.choice(
    ['Low', 'Medium', 'High']), 'status': random.choice(['Open', 'Closed'])} for i in range(num_records)]
pd.DataFrame(tickets).to_csv('/tmp/raw_data/support_tickets.csv', index=False)

# Source 5: Marketing Campaigns
marketing = [{'campaign_id': f"CMP_{i}", 'user_id': f"USR_{random.randint(0, num_records-1)}", 'clicks': random.randint(
    0, 20), 'converted': random.choice([True, False])} for i in range(num_records)]
pd.DataFrame(marketing).to_csv(
    '/tmp/raw_data/marketing_campaigns.csv', index=False)

print("Data from 5 sources generated successfully!")
