-- Initial schema. Price is BIGINT rupees (no floats). CHECKs are the last line of defence behind Zod.

CREATE TYPE property_status AS ENUM ('available', 'under_construction', 'sold');

CREATE TABLE properties (
  id           SERIAL PRIMARY KEY,
  name         TEXT NOT NULL CHECK (length(trim(name)) > 0),
  location     TEXT NOT NULL CHECK (length(trim(location)) > 0),
  price        BIGINT NOT NULL CHECK (price > 0),          -- in rupees
  size_sqft    INTEGER NOT NULL CHECK (size_sqft > 0),
  bedrooms     SMALLINT NOT NULL CHECK (bedrooms BETWEEN 1 AND 20),
  description  TEXT NOT NULL,                              -- short, used on cards
  details      TEXT,                                       -- fuller copy, detail page
  image_url    TEXT NOT NULL,
  status       property_status NOT NULL DEFAULT 'available',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE inquiries (
  id           SERIAL PRIMARY KEY,
  property_id  INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  email        TEXT NOT NULL,
  phone        TEXT NOT NULL,
  message      TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_properties_location ON properties (location);
CREATE INDEX idx_properties_bedrooms ON properties (bedrooms);
CREATE INDEX idx_inquiries_property  ON inquiries (property_id);
CREATE INDEX idx_inquiries_created   ON inquiries (created_at DESC);
