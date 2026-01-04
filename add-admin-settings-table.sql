-- Create admin_settings table for storing admin dashboard settings
CREATE TABLE IF NOT EXISTS admin_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  settings JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT single_row CHECK (id = 1)
);

-- Insert default settings
INSERT INTO admin_settings (id, settings)
VALUES (1, '{
  "profile": {
    "name": "Vincent van Munster",
    "email": "v.munster@weareimpact.nl"
  },
  "notifications": {
    "emailNewLead": true,
    "emailNewChat": false,
    "emailWeeklyReport": true,
    "browserNotifications": true
  },
  "ai": {
    "chatEnabled": true,
    "scannerEnabled": true,
    "bookingEnabled": true,
    "maxTokens": "400",
    "temperature": "0.7"
  }
}')
ON CONFLICT (id) DO NOTHING;
