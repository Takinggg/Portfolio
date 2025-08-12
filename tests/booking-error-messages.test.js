/**
 * Test for improved booking error messages
 * Verifies that all booking services return specific error messages with eventTypeId
 */

import Database from 'better-sqlite3';
import { BookingService } from '../server/scheduling/booking-service.js';
import { BookingService as AdminBookingService } from '../server/admin/scheduling/booking-service.js';
import { BookingService as SchedulingBookingService } from '../server/scheduling/scheduling/booking-service.js';
import { tmpdir } from 'os';
import { join } from 'path';
import { unlinkSync } from 'fs';

console.log('Testing improved booking error messages...');

// Create a temporary in-memory database for testing
const testDbPath = join(tmpdir(), `test-booking-${Date.now()}.db`);
const db = new Database(testDbPath);

// Set up minimal database schema
db.exec(`
  CREATE TABLE event_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    duration_minutes INTEGER NOT NULL,
    location_type TEXT DEFAULT 'visio',
    color TEXT DEFAULT '#3B82F6',
    is_active INTEGER DEFAULT 1,
    max_bookings_per_day INTEGER,
    buffer_before_minutes INTEGER DEFAULT 0,
    buffer_after_minutes INTEGER DEFAULT 0,
    min_lead_time_hours INTEGER DEFAULT 1,
    max_advance_days INTEGER DEFAULT 30,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uuid TEXT UNIQUE NOT NULL,
    event_type_id INTEGER NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    status TEXT DEFAULT 'confirmed',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    cancelled_at DATETIME,
    cancellation_reason TEXT,
    FOREIGN KEY (event_type_id) REFERENCES event_types(id)
  );

  CREATE TABLE invitees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    booking_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    timezone TEXT DEFAULT 'UTC',
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id)
  );

  CREATE TABLE availability_rules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_type_id INTEGER NOT NULL,
    day_of_week INTEGER NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    timezone TEXT DEFAULT 'UTC',
    is_active INTEGER DEFAULT 1,
    FOREIGN KEY (event_type_id) REFERENCES event_types(id)
  );

  CREATE TABLE availability_exceptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_type_id INTEGER NOT NULL,
    exception_date TEXT NOT NULL,
    exception_type TEXT NOT NULL,
    start_time TEXT,
    end_time TEXT,
    timezone TEXT DEFAULT 'UTC',
    reason TEXT,
    FOREIGN KEY (event_type_id) REFERENCES event_types(id)
  );
`);

// Insert a test event type (ID will be 1)
db.prepare(`
  INSERT INTO event_types (name, duration_minutes, location_type)
  VALUES ('Test Meeting', 30, 'visio')
`).run();

// Add availability rules to make bookings possible
const eventTypeId = 1;
for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
  db.prepare(`
    INSERT INTO availability_rules (event_type_id, day_of_week, start_time, end_time)
    VALUES (?, ?, '09:00', '17:00')
  `).run(eventTypeId, dayOfWeek);
}

console.log('✅ Test database setup complete');

// Test data
const futureDate = new Date();
futureDate.setDate(futureDate.getDate() + 7); // 7 days from now
const startTime = futureDate.toISOString();
const endTime = new Date(futureDate.getTime() + 30 * 60 * 1000).toISOString(); // 30 minutes later

const testBookingRequest = {
  eventTypeId: 999, // Non-existent ID
  name: 'Test User',
  email: 'test@example.com',
  start: startTime,
  end: endTime,
  timezone: 'UTC'
};

// Test services
const actionTokenSecret = 'test-secret';
const mainBookingService = new BookingService(db, actionTokenSecret);
const adminBookingService = new AdminBookingService(db, actionTokenSecret);
const schedulingBookingService = new SchedulingBookingService(db, actionTokenSecret);

async function runTests() {
  console.log('\n🔬 Testing Main Booking Service...');
  try {
    const result1 = await mainBookingService.createBooking(testBookingRequest);
    if (!result1.success && result1.error.includes('Event type with ID 999')) {
      console.log('✅ Main service PASSED: Specific error message includes ID');
      console.log(`   Error: "${result1.error}"`);
    } else {
      console.log('❌ Main service FAILED: Error message should include specific ID');
      console.log(`   Error: "${result1.error}"`);
    }
  } catch (error) {
    console.log('❌ Main service ERROR:', error.message);
  }

  console.log('\n🔬 Testing Scheduling Booking Service...');
  try {
    const result2 = await schedulingBookingService.createBooking(testBookingRequest);
    if (!result2.success && result2.error.includes('Event type with ID 999')) {
      console.log('✅ Scheduling service PASSED: Specific error message includes ID');
      console.log(`   Error: "${result2.error}"`);
    } else {
      console.log('❌ Scheduling service FAILED: Error message should include specific ID');
      console.log(`   Error: "${result2.error}"`);
    }
  } catch (error) {
    console.log('❌ Scheduling service ERROR:', error.message);
  }

  console.log('\n🔬 Testing Admin Booking Service (reschedule method)...');
  try {
    // Test admin service directly by trying to reschedule a non-existent booking
    // This will trigger the event type validation in the admin service
    const fakeBookingUuid = '12345678-1234-1234-1234-123456789012';
    
    // Insert a fake booking with invalid event type for testing
    db.prepare(`
      INSERT INTO bookings (uuid, event_type_id, start_time, end_time, status)
      VALUES (?, ?, ?, ?, 'confirmed')
    `).run(fakeBookingUuid, 777, testBookingRequest.start, testBookingRequest.end);
    
    const result3 = await adminBookingService.rescheduleBookingAdmin(
      fakeBookingUuid,
      new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(), // 8 days from now
      new Date(Date.now() + 8 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString() // 30 minutes later
    );
    
    if (!result3.success && result3.message.includes('Event type with ID 777')) {
      console.log('✅ Admin service PASSED: Specific error message includes ID');
      console.log(`   Error: "${result3.message}"`);
    } else {
      console.log('❌ Admin service FAILED: Error message should include specific ID');
      console.log(`   Error: "${result3.message}"`);
    }
  } catch (error) {
    console.log('❌ Admin service ERROR:', error.message);
  }

  console.log('\n🔬 Testing Error Message Format...');
  try {
    const result4 = await mainBookingService.createBooking({
      ...testBookingRequest,
      eventTypeId: 555 // Another non-existent ID
    });
    if (!result4.success && result4.error.includes('Event type with ID 555 not found or is inactive')) {
      console.log('✅ Error format test PASSED: Correct error message format');
      console.log(`   Error: "${result4.error}"`);
    } else {
      console.log('❌ Error format test FAILED: Incorrect error message format');
      console.log(`   Error: "${result4.error}"`);
    }
  } catch (error) {
    console.log('❌ Error format test ERROR:', error.message);
  }
}

// Run tests
runTests().then(() => {
  console.log('\n✅ Testing complete!');
  
  // Clean up
  db.close();
  try {
    unlinkSync(testDbPath);
    console.log('🧹 Test database cleaned up');
  } catch (error) {
    // Ignore cleanup errors
  }
}).catch((error) => {
  console.error('💥 Test suite failed:', error);
  process.exit(1);
});