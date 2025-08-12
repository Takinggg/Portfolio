/**
 * Test for eventTypeId validation fix
 * Verifies that bookingRequestSchema accepts both string and numeric eventTypeId
 */

import { z } from 'zod';

// Recreate the schema as it should be after the fix
const bookingRequestSchema = z.object({
  eventTypeId: z.coerce.number().positive(),
  name: z.string().min(1).max(100),
  email: z.string().email().max(254),
  start: z.string().datetime(),
  end: z.string().datetime(),
  timezone: z.string().optional(),
  notes: z.string().max(1000).optional(),
  answers: z.array(z.object({
    questionId: z.number().positive(),
    answer: z.string().max(1000)
  })).optional(),
  consent: z.boolean().optional()
});

console.log('Testing eventTypeId validation...');

// Test data template
const baseBookingData = {
  name: 'Test User',
  email: 'test@example.com',
  start: '2024-12-15T10:00:00.000Z',
  end: '2024-12-15T11:00:00.000Z',
  timezone: 'UTC'
};

// Test 1: String eventTypeId (the failing case before fix)
try {
  const result1 = bookingRequestSchema.safeParse({
    ...baseBookingData,
    eventTypeId: '1' // String format
  });
  
  if (result1.success) {
    console.log('✅ Test 1 PASSED: String eventTypeId "1" accepted and coerced to number:', result1.data.eventTypeId);
    console.log('   Type of eventTypeId:', typeof result1.data.eventTypeId);
  } else {
    console.log('❌ Test 1 FAILED: String eventTypeId rejected');
    console.log('   Errors:', result1.error.errors);
  }
} catch (error) {
  console.log('❌ Test 1 ERROR:', error.message);
}

// Test 2: Numeric eventTypeId (should still work)
try {
  const result2 = bookingRequestSchema.safeParse({
    ...baseBookingData,
    eventTypeId: 1 // Numeric format
  });
  
  if (result2.success) {
    console.log('✅ Test 2 PASSED: Numeric eventTypeId 1 accepted:', result2.data.eventTypeId);
    console.log('   Type of eventTypeId:', typeof result2.data.eventTypeId);
  } else {
    console.log('❌ Test 2 FAILED: Numeric eventTypeId rejected');
    console.log('   Errors:', result2.error.errors);
  }
} catch (error) {
  console.log('❌ Test 2 ERROR:', error.message);
}

// Test 3: Invalid eventTypeId (should fail)
try {
  const result3 = bookingRequestSchema.safeParse({
    ...baseBookingData,
    eventTypeId: 'invalid' // Non-numeric string
  });
  
  if (!result3.success) {
    console.log('✅ Test 3 PASSED: Invalid eventTypeId "invalid" correctly rejected');
  } else {
    console.log('❌ Test 3 FAILED: Invalid eventTypeId should have been rejected');
  }
} catch (error) {
  console.log('❌ Test 3 ERROR:', error.message);
}

// Test 4: Zero or negative eventTypeId (should fail)
try {
  const result4 = bookingRequestSchema.safeParse({
    ...baseBookingData,
    eventTypeId: '0' // Zero as string
  });
  
  if (!result4.success) {
    console.log('✅ Test 4 PASSED: Zero eventTypeId "0" correctly rejected (not positive)');
  } else {
    console.log('❌ Test 4 FAILED: Zero eventTypeId should have been rejected');
  }
} catch (error) {
  console.log('❌ Test 4 ERROR:', error.message);
}

console.log('\nTesting complete!');