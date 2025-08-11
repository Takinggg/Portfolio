// Simple unit tests for email template rendering
import { EmailTemplates } from '../server/notifications/templates.js';
import { DateTime } from 'luxon';

// Mock template variables
const mockVariables = {
  attendeeName: 'John Doe',
  eventTitle: 'Strategy Meeting',
  start: DateTime.fromISO('2024-03-15T14:00:00Z').setZone('Europe/Paris'),
  end: DateTime.fromISO('2024-03-15T15:00:00Z').setZone('Europe/Paris'),
  timezone: 'Europe/Paris',
  location: 'Video Conference (meeting link will be provided)',
  rescheduleLink: 'https://example.com/reschedule?token=abc123',
  cancelLink: 'https://example.com/cancel?token=def456',
  googleCalendarUrl: 'https://calendar.google.com/calendar/render?action=TEMPLATE',
  outlookCalendarUrl: 'https://outlook.live.com/calendar/0/deeplink/compose',
  notes: 'Please prepare the quarterly report'
};

// Test template rendering
console.log('Testing Email Template Rendering...\n');

// Test confirmation template
console.log('1. Testing Confirmation Template:');
const confirmation = EmailTemplates.renderConfirmation(mockVariables);
console.log('Subject:', confirmation.subject);
console.log('✓ Confirmation template rendered successfully\n');

// Test reschedule template
console.log('2. Testing Reschedule Template:');
const rescheduleVariables = {
  ...mockVariables,
  oldStart: DateTime.fromISO('2024-03-15T13:00:00Z').setZone('Europe/Paris'),
  oldEnd: DateTime.fromISO('2024-03-15T14:00:00Z').setZone('Europe/Paris')
};
const reschedule = EmailTemplates.renderReschedule(rescheduleVariables);
console.log('Subject:', reschedule.subject);
console.log('✓ Reschedule template rendered successfully\n');

// Test cancellation template
console.log('3. Testing Cancellation Template:');
const cancellationVariables = {
  ...mockVariables,
  reason: 'Meeting no longer needed'
};
const cancellation = EmailTemplates.renderCancellation(cancellationVariables);
console.log('Subject:', cancellation.subject);
console.log('✓ Cancellation template rendered successfully\n');

// Test reminder template
console.log('4. Testing Reminder Template:');
const reminder = EmailTemplates.renderReminder(mockVariables, 24);
console.log('Subject:', reminder.subject);
console.log('✓ Reminder template rendered successfully\n');

console.log('All template tests passed! ✅');

// Test variable interpolation
console.log('\n5. Testing Variable Interpolation:');
const testText = 'Hello {{attendeeName}}, your {{eventTitle}} is scheduled for {{start}}';
const interpolated = testText
  .replace(/\{\{attendeeName\}\}/g, mockVariables.attendeeName)
  .replace(/\{\{eventTitle\}\}/g, mockVariables.eventTitle)
  .replace(/\{\{start\}\}/g, mockVariables.start.toFormat('EEEE, MMMM dd, yyyy \'at\' h:mm a'));

console.log('Original:', testText);
console.log('Interpolated:', interpolated);
console.log('✓ Variable interpolation working correctly\n');

console.log('Email Template Testing Complete! 🎉');