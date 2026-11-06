-- Pre-launch waitlist. Emails are normalised (trimmed, lower-cased) so one person can't join twice.
CREATE TABLE waitlist (
  id         BIGSERIAL PRIMARY KEY,
  email      TEXT NOT NULL,
  email_norm TEXT NOT NULL UNIQUE,
  ref        TEXT,                -- optional ?ref= code from an invite link
  source     TEXT,                -- e.g. page path or campaign
  ip_hash    TEXT,                -- sha256 of the IP, never the raw address
  user_agent TEXT,
  invited_at TIMESTAMPTZ,         -- set when you let this person in
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX waitlist_created_idx ON waitlist (created_at DESC);
