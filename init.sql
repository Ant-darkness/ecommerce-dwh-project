-- Create the DWH database
CREATE DATABASE dwh_db;

-- Connect to dwh_db and create tables
\connect dwh_db;

-- =============================================
-- STAGING LAYER (Raw ingestion from 5 sources)
-- =============================================
CREATE TABLE IF NOT EXISTS stage_crm_users (
    user_id     VARCHAR(50),
    name        VARCHAR(100),
    email       VARCHAR(100),
    country     VARCHAR(100),
    created_at  TIMESTAMP
);

CREATE TABLE IF NOT EXISTS stage_web_logs (
    log_id           VARCHAR(50),
    user_id          VARCHAR(50),
    session_duration INT,
    pages_visited    INT,
    device           VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS stage_pos_sales (
    sale_id   VARCHAR(50),
    user_id   VARCHAR(50),
    amount    DECIMAL(10,2),
    branch    VARCHAR(100),
    sale_date TIMESTAMP
);

CREATE TABLE IF NOT EXISTS stage_support_tickets (
    ticket_id VARCHAR(50),
    user_id   VARCHAR(50),
    priority  VARCHAR(10),
    status    VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS stage_marketing_campaigns (
    campaign_id VARCHAR(50),
    user_id     VARCHAR(50),
    clicks      INT,
    converted   BOOLEAN
);

-- =============================================
-- ANALYTICS / PRODUCTION LAYER (Fact Table)
-- =============================================
CREATE TABLE IF NOT EXISTS fact_customer_analytics (
    user_id              VARCHAR(50) PRIMARY KEY,
    name                 VARCHAR(100),
    email                VARCHAR(100),
    country              VARCHAR(100),
    total_spend          DECIMAL(10,2),
    avg_session_duration INT,
    total_tickets        INT,
    marketing_converted  BOOLEAN,
    is_churned           INT   -- ML predicted: 1 = churn risk, 0 = retained
);
