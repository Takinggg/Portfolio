-- Scheduling System Database Schema
-- Tables are created at runtime to avoid committing binary database changes

-- Event types configuration (15min, 30min, 60min meetings, etc.)
CREATE TABLE IF NOT EXISTS event_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    duration_minutes INTEGER NOT NULL,
    location_type TEXT NOT NULL CHECK (location_type IN ('visio', 'physique', 'telephone')),
    color TEXT DEFAULT '#3B82F6',
    is_active BOOLEAN DEFAULT 1,
    max_bookings_per_day INTEGER DEFAULT NULL,
    buffer_before_minutes INTEGER DEFAULT 0,
    buffer_after_minutes INTEGER DEFAULT 0,
    min_lead_time_hours INTEGER DEFAULT 1,
    max_advance_days INTEGER DEFAULT 30,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Availability rules (recurring patterns)
CREATE TABLE IF NOT EXISTS availability_rules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_type_id INTEGER REFERENCES event_types(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday, 6=Saturday
    start_time TEXT NOT NULL, -- HH:MM format in UTC
    end_time TEXT NOT NULL,   -- HH:MM format in UTC
    timezone TEXT NOT NULL DEFAULT 'UTC',
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Availability exceptions (specific dates to override rules)
CREATE TABLE IF NOT EXISTS availability_exceptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_type_id INTEGER REFERENCES event_types(id) ON DELETE CASCADE,
    exception_date DATE NOT NULL, -- YYYY-MM-DD format
    exception_type TEXT NOT NULL CHECK (exception_type IN ('unavailable', 'custom_hours')),
    start_time TEXT, -- HH:MM format if custom_hours
    end_time TEXT,   -- HH:MM format if custom_hours
    timezone TEXT DEFAULT 'UTC',
    reason TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Bookings
CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uuid TEXT NOT NULL UNIQUE DEFAULT (hex(randomblob(16))),
    event_type_id INTEGER NOT NULL REFERENCES event_types(id),
    start_time DATETIME NOT NULL, -- UTC timestamp
    end_time DATETIME NOT NULL,   -- UTC timestamp
    status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'rescheduled')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    cancelled_at DATETIME NULL,
    cancellation_reason TEXT NULL
);

-- Invitees (attendees for each booking)
CREATE TABLE IF NOT EXISTS invitees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    booking_id INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    timezone TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Custom questions for event types
CREATE TABLE IF NOT EXISTS event_type_questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_type_id INTEGER NOT NULL REFERENCES event_types(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type TEXT NOT NULL DEFAULT 'text' CHECK (question_type IN ('text', 'textarea', 'select', 'radio', 'checkbox')),
    options TEXT, -- JSON array for select/radio/checkbox types
    is_required BOOLEAN DEFAULT 0,
    display_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Answers to custom questions
CREATE TABLE IF NOT EXISTS question_answers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    booking_id INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    question_id INTEGER NOT NULL REFERENCES event_type_questions(id) ON DELETE CASCADE,
    answer_text TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Notification logs
CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    booking_id INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    notification_type TEXT NOT NULL CHECK (notification_type IN ('confirmation', 'cancellation', 'reschedule', 'reminder')),
    recipient_email TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
    sent_at DATETIME NULL,
    error_message TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Reminders scheduling
CREATE TABLE IF NOT EXISTS reminders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    booking_id INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    offset_hours INTEGER NOT NULL, -- Hours before booking to send reminder
    scheduled_for DATETIME NOT NULL, -- When to send the reminder
    sent_at DATETIME NULL,
    attempts INTEGER DEFAULT 0,
    last_error TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Admin audit logs
CREATE TABLE IF NOT EXISTS admin_audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    admin_user TEXT NOT NULL,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT,
    old_values TEXT, -- JSON
    new_values TEXT, -- JSON
    ip_address TEXT,
    user_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_availability_rules_event_type ON availability_rules(event_type_id);
CREATE INDEX IF NOT EXISTS idx_availability_rules_day ON availability_rules(day_of_week);
CREATE INDEX IF NOT EXISTS idx_availability_exceptions_event_type ON availability_exceptions(event_type_id);
CREATE INDEX IF NOT EXISTS idx_availability_exceptions_date ON availability_exceptions(exception_date);
CREATE INDEX IF NOT EXISTS idx_bookings_event_type ON bookings(event_type_id);
CREATE INDEX IF NOT EXISTS idx_bookings_time_range ON bookings(start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_uuid ON bookings(uuid);
CREATE INDEX IF NOT EXISTS idx_invitees_booking ON invitees(booking_id);
CREATE INDEX IF NOT EXISTS idx_invitees_email ON invitees(email);
CREATE INDEX IF NOT EXISTS idx_question_answers_booking ON question_answers(booking_id);
CREATE INDEX IF NOT EXISTS idx_notifications_booking ON notifications(booking_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);
CREATE INDEX IF NOT EXISTS idx_reminders_booking ON reminders(booking_id);
CREATE INDEX IF NOT EXISTS idx_reminders_scheduled ON reminders(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_reminders_sent ON reminders(sent_at);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_admin_user ON admin_audit_logs(admin_user);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_resource ON admin_audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_created_at ON admin_audit_logs(created_at);

-- Insert default event types
INSERT OR IGNORE INTO event_types (id, name, description, duration_minutes, location_type, color, max_bookings_per_day, min_lead_time_hours) VALUES
(1, 'Quick Chat', 'Brief 15-minute consultation', 15, 'visio', '#10B981', 8, 1),
(2, 'Standard Meeting', 'Standard 30-minute meeting', 30, 'visio', '#3B82F6', 6, 2),
(3, 'Deep Dive Session', 'Extended 60-minute consultation', 60, 'visio', '#8B5CF6', 3, 4);

-- Insert default availability (Mon-Fri 9AM-5PM UTC)
INSERT OR IGNORE INTO availability_rules (event_type_id, day_of_week, start_time, end_time, timezone) VALUES
-- Monday to Friday for all event types
(1, 1, '09:00', '17:00', 'UTC'),
(1, 2, '09:00', '17:00', 'UTC'),
(1, 3, '09:00', '17:00', 'UTC'),
(1, 4, '09:00', '17:00', 'UTC'),
(1, 5, '09:00', '17:00', 'UTC'),
(2, 1, '09:00', '17:00', 'UTC'),
(2, 2, '09:00', '17:00', 'UTC'),
(2, 3, '09:00', '17:00', 'UTC'),
(2, 4, '09:00', '17:00', 'UTC'),
(2, 5, '09:00', '17:00', 'UTC'),
(3, 1, '09:00', '17:00', 'UTC'),
(3, 2, '09:00', '17:00', 'UTC'),
(3, 3, '09:00', '17:00', 'UTC'),
(3, 4, '09:00', '17:00', 'UTC'),
(3, 5, '09:00', '17:00', 'UTC');