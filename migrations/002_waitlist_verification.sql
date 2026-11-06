-- Email verification: people only count once they enter the 6-digit code we emailed them.
ALTER TABLE waitlist ADD COLUMN verified_at TIMESTAMPTZ;
CREATE INDEX waitlist_verified_idx ON waitlist (verified_at, id) WHERE verified_at IS NOT NULL;

-- One row per code we send. Only a keyed hash of the code is stored, never the code itself.
CREATE TABLE waitlist_codes (
  id          BIGSERIAL PRIMARY KEY,
  email_norm  TEXT NOT NULL,
  code_hash   TEXT NOT NULL,
  attempts    INT  NOT NULL DEFAULT 0,
  expires_at  TIMESTAMPTZ NOT NULL,
  consumed_at TIMESTAMPTZ,
  ip_hash     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX waitlist_codes_email_idx ON waitlist_codes (email_norm, id DESC);
CREATE INDEX waitlist_codes_ip_idx ON waitlist_codes (ip_hash, created_at);
