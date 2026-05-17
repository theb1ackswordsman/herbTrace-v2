-- Run this entire script in the Supabase SQL Editor

CREATE TABLE users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  phone       TEXT UNIQUE,          -- for WhatsApp-linked farmers
  email       TEXT UNIQUE,          -- for web login (factory/regulator)
  password    TEXT,                  -- bcrypt hash (NULL for WhatsApp-only farmers)
  role        TEXT NOT NULL CHECK (role IN ('farmer', 'factory', 'regulator')),
  aadhaar     TEXT,                  -- masked, for farmer identity
  reputation  DECIMAL(3,2) DEFAULT 5.00,  -- avg rating 0-5
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE batches (
  id          TEXT PRIMARY KEY,     -- e.g. 'BT-1716012345678'
  farmer_id   UUID REFERENCES users(id),
  herb        TEXT NOT NULL,
  quantity    DECIMAL(10,2) NOT NULL,
  quality     TEXT DEFAULT 'A',     -- A+, A, B
  lat         DECIMAL(10,6),
  lon         DECIMAL(10,6),
  image_url   TEXT,                 -- Cloudinary secure URL
  status      TEXT DEFAULT 'created'
                CHECK (status IN ('created','received','rated','flagged','verified')),
  factory_rating  INTEGER,          -- 1-5, set by factory
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE audit_log (
  id            SERIAL PRIMARY KEY,
  batch_id      TEXT REFERENCES batches(id),
  event_type    TEXT NOT NULL
                  CHECK (event_type IN (
                    'BATCH_CREATED','BATCH_RECEIVED','QUALITY_RATED',
                    'FRAUD_FLAGGED','BATCH_VERIFIED'
                  )),
  actor_id      UUID REFERENCES users(id),
  event_data    JSONB NOT NULL,       -- full payload snapshot
  prev_hash     TEXT NOT NULL,        -- hash of previous record (or 'GENESIS')
  current_hash  TEXT NOT NULL,        -- SHA-256(prev_hash + event_data_json)
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_batch ON audit_log(batch_id, id ASC);

CREATE TABLE fraud_flags (
  id          SERIAL PRIMARY KEY,
  batch_id    TEXT REFERENCES batches(id),
  risk_score  DECIMAL(5,4) NOT NULL,  -- 0.0000 to 1.0000
  risk_level  TEXT CHECK (risk_level IN ('low','medium','high')),
  factors     JSONB NOT NULL,          -- breakdown of each factor
  flagged_by  UUID REFERENCES users(id),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE conversation_state (
  phone       TEXT PRIMARY KEY,        -- whatsapp:+91XXXXXXXXXX
  state       TEXT NOT NULL DEFAULT 'IDLE'
                CHECK (state IN ('IDLE','HERB_NAME','QUANTITY','PHOTO')),
  draft_data  JSONB DEFAULT '{}',      -- partial batch data collected so far
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);
