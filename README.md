# 📦 E-Commerce Data Warehouse Project

A production-grade **Data Warehouse** system for e-commerce analytics, featuring a multi-source ETL pipeline, Apache Airflow orchestration, ML-powered churn prediction, FastAPI backend, and a real-time React dashboard.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Source Systems (5)                      │
│  CRM Users │ Web Logs │ POS Sales │ Support │ Marketing     │
└──────────────────────┬──────────────────────────────────────┘
                       │  generate_sources.py (Faker)
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                  STAGING LAYER (PostgreSQL)                 │
│  stage_crm_users │ stage_web_logs │ stage_pos_sales        │
│  stage_support_tickets │ stage_marketing_campaigns         │
└──────────────────────┬──────────────────────────────────────┘
                       │  etl_process.py (pandas merges)
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              PRODUCTION / FACT LAYER (PostgreSQL)           │
│                 fact_customer_analytics                     │
│  (user_id, name, email, country, total_spend,              │
│   avg_session_duration, total_tickets,                      │
│   marketing_converted, is_churned)                          │
└──────────────────────┬──────────────────────────────────────┘
                       │  train_model.py (KMeans)
                       │
              ┌────────┴────────┐
              ▼                 ▼
       FastAPI Backend    React Dashboard
       (port 8000)        (port 5173)
```

**Orchestration**: Apache Airflow (port 8080) runs the 3-task DAG daily:
`generate_faker_data → run_etl_pipeline → ml_customer_churn_prediction`

---

## 📁 Project Structure

```
ecommerce-dwh-project/
├── docker-compose.yml          # All services: postgres, airflow, backend
├── Dockerfile                  # FastAPI backend container
├── init.sql                    # PostgreSQL schema (staging + fact tables)
├── requirements.txt            # Python dependencies
│
├── dags/
│   └── ecommerce_etl_dag.py    # Airflow DAG (daily pipeline)
│
├── scripts/
│   ├── generate_sources.py     # Faker-based synthetic data generator
│   ├── etl_process.py          # Extract → Transform → Load to DWH
│   └── train_model.py          # KMeans churn prediction + write-back
│
├── backend/
│   ├── __init__.py
│   ├── database.py             # SQLAlchemy engine (env-var configurable)
│   └── main.py                 # FastAPI — 6 endpoints
│
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx             # Router (Dashboard / Customers / Pipeline)
        ├── index.css           # Premium dark theme
        ├── components/
        │   ├── Sidebar.jsx
        │   ├── MetricCard.jsx
        │   ├── RevenueChart.jsx
        │   ├── ChurnChart.jsx
        │   └── TopCountries.jsx
        └── pages/
            ├── Dashboard.jsx   # KPI cards + 3 charts
            ├── Customers.jsx   # Paginated table + churn filter
            └── Pipeline.jsx    # DAG diagram + table row counts
```

---

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for frontend)

### 1. Start all backend services

```bash
docker compose up --build
```

This starts:
| Service | URL |
|---|---|
| PostgreSQL | `localhost:5432` |
| Airflow Webserver | http://localhost:8080 (admin / admin) |
| FastAPI Backend | http://localhost:8000 |

### 2. Run the ETL pipeline (first time)

Either trigger from Airflow UI:
1. Open http://localhost:8080
2. Enable and trigger `complete_ecommerce_dwh_pipeline`

Or run scripts directly:
```bash
# Inside the postgres container or locally with the right DB credentials:
python scripts/generate_sources.py
python scripts/etl_process.py
python scripts/train_model.py
```

### 3. Start the frontend dashboard

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/metrics` | KPI summary (customers, revenue, churn, retention) |
| GET | `/api/customers` | Paginated customer list (`?page=1&churned_only=false`) |
| GET | `/api/churn-stats` | Churn count & rate by country (top 10) |
| GET | `/api/top-countries` | Top revenue-generating countries |
| GET | `/api/revenue-trend` | 30-day daily revenue trend |
| GET | `/api/pipeline-status` | Row counts for all DB tables |

Interactive docs: http://localhost:8000/docs

---

## 🤖 Machine Learning

The churn model uses **K-Means clustering** (k=2) on three features:
- `total_spend` — total purchase value from POS sales
- `avg_session_duration` — average web session length
- `total_tickets` — number of high-priority support tickets

After clustering, the **churn cluster is identified** by finding the group with the lowest spend-to-tickets ratio (low spend + high tickets = churn risk). This is a label-normalization step to ensure `is_churned=1` always means the at-risk segment.

The model is saved to `/tmp/churn_model.pkl` for inspection or future inference.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Data Generation | Python · Faker |
| Storage | PostgreSQL 15 |
| ETL | Python · pandas · SQLAlchemy |
| Orchestration | Apache Airflow 2.9.1 |
| ML | scikit-learn (KMeans) · joblib |
| API | FastAPI · Uvicorn |
| Frontend | React 18 · Vite · Recharts · React Router |
| Infrastructure | Docker · Docker Compose |

---

## 🌱 Environment Variables

| Variable | Default | Used by |
|---|---|---|
| `DATABASE_URL` | `postgresql+psycopg2://airflow:airflow@localhost:5432/dwh_db` | Backend |
| `VITE_API_URL` | `http://localhost:8000` | Frontend |
