# Scheduling Widget Prefill Implementation

This document describes the implementation of the automatic prefill functionality for the scheduling widget form step.

## Overview

Users no longer need to re-enter their name and email in the scheduling widget when those details were already provided elsewhere. The implementation follows a priority-based approach and maintains strict security and accessibility standards.

## How Prefill Works

### Priority Order
1. **URL Query Parameters** (highest priority)
   - `?name=John%20Doe&email=john%40example.com`
   - Useful for email links or campaign URLs
   
2. **localStorage** (fallback)
   - Automatically saved from previous successful form submissions
   - Key: `scheduling.userInfo`
   - Format: `{ name: string, email: string, ts: number }`

### Data Sources
- **Contact Form Submissions**: Name and email saved to localStorage after successful submission
- **Successful Bookings**: User info persisted for future scheduling sessions
- **URL Parameters**: Direct prefill from query string

## Technical Implementation

### Files Created/Modified

#### New Files
- `src/utils/userInfoPrefill.ts` - Central utility for all prefill logic

#### Modified Files
- `src/components/scheduling/BookingForm.tsx` - Prefill logic and UI
- `src/components/Contact.tsx` - localStorage persistence
- `src/i18n/fr.ts` & `src/i18n/en.ts` - Translation keys
- `src/i18n/types.ts` - TypeScript types
- `tests/e2e/scheduling.spec.ts` - E2E test coverage

### Key Features

#### Email Validation
- Invalid emails from localStorage are automatically ignored
- Robust email validation using standard regex pattern
- Form continues to work normally if stored email is invalid

#### Focus Management
- When name/email are prefilled, focus automatically moves to the notes textarea
- Improves user experience by skipping filled fields

#### Clear Functionality
- Small "X" button appears in prefilled fields
- Clears both form values and localStorage data
- Single action clears all prefilled data

#### Accessibility
- Proper ARIA labels and roles
- Screen reader announcements for errors
- Maintains existing keyboard navigation
- Error messages have `role="alert"`

#### Security & Privacy
- Consent checkbox never auto-checked
- User must always explicitly consent
- No sensitive data stored in localStorage
- Email validation prevents injection attacks

## New Translation Keys

### French (`fr.ts`)
```typescript
scheduling: {
  form: {
    clear_prefilled: 'Effacer'
  },
  errors: {
    network: 'Erreur de connexion au service de planification...',
    not_found: 'Service de planification non trouvé...',
    server_error: 'Erreur serveur du service de planification...',
    invalid_json: 'Le service de planification est indisponible...',
    generic: 'Le service de planification est temporairement indisponible'
  }
}
```

### English (`en.ts`)
```typescript
scheduling: {
  form: {
    clear_prefilled: 'Clear'
  },
  errors: {
    network: 'Connection error to scheduling service...',
    not_found: 'Scheduling service not found...',
    server_error: 'Scheduling service server error...',
    invalid_json: 'Scheduling service is unavailable...',
    generic: 'Scheduling service is temporarily unavailable'
  }
}
```

## localStorage Format

```typescript
interface UserInfo {
  name: string;
  email: string;
  ts: number; // timestamp
}

// Storage key: "scheduling.userInfo"
// Example value:
{
  "name": "John Doe",
  "email": "john@example.com",
  "ts": 1699123456789
}
```

## Usage Examples

### URL Parameters
```
https://portfolio.com/?name=John%20Doe&email=john%40example.com
```

### Programmatic Usage
```typescript
import { saveUserInfoToStorage, getPrefillUserInfo } from '../utils/userInfoPrefill';

// Save user info after successful form submission
saveUserInfoToStorage({
  name: 'John Doe',
  email: 'john@example.com'
});

// Get prefill data (URL params override localStorage)
const prefillData = getPrefillUserInfo();
```

## Testing

### E2E Test Coverage
- ✅ Prefill from localStorage
- ✅ Prefill from URL parameters  
- ✅ Clear button functionality
- ✅ Invalid email handling
- ✅ Autocomplete attributes
- ✅ i18n consistency

### Manual Testing Scenarios
1. **First Time User**: No prefill, normal form behavior
2. **Returning User**: Prefilled from localStorage
3. **Email Link**: Prefilled from URL parameters
4. **Invalid Data**: Graceful handling, no form breakage
5. **Clear Action**: Complete reset of prefilled data

## Browser Compatibility

- ✅ Modern browsers with localStorage support
- ✅ Graceful degradation if localStorage unavailable
- ✅ URLSearchParams API for query parsing

## Security Considerations

- **No sensitive data**: Only name and email stored
- **Email validation**: Prevents malformed data
- **User consent**: Never auto-checked
- **Data isolation**: localStorage scoped to domain
- **Validation**: All inputs validated on both client and server

## Accessibility Features

- **Screen reader support**: Proper ARIA labels
- **Keyboard navigation**: Full keyboard accessibility  
- **Focus management**: Intelligent focus placement
- **Error announcements**: Screen reader alerts
- **Visual indicators**: Clear visual feedback

## Rollback Plan

The implementation is completely client-side and additive:

1. **Feature Flag**: Can be disabled via environment variable
2. **Utility Isolation**: All logic contained in `userInfoPrefill.ts`
3. **No Breaking Changes**: Existing forms continue to work
4. **localStorage**: Can be cleared without affecting functionality

## Performance Impact

- **Minimal**: Only reads localStorage/URL on form initialization
- **No Network Calls**: Entirely client-side operation
- **Lazy Loading**: Utils only loaded when needed
- **Small Bundle**: ~3KB additional code

## Future Enhancements

- **Expiration**: Add TTL for localStorage entries
- **Encryption**: Encrypt localStorage data (if required)
- **Multiple Sources**: Support additional data sources
- **Analytics**: Track prefill usage and effectiveness