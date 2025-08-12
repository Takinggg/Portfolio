/**
 * Utilities for prefilling user information in scheduling widget
 * Handles localStorage persistence and URL query parameter parsing
 */

export interface UserInfo {
  name: string;
  email: string;
  ts: number;
}

const STORAGE_KEY = 'scheduling.userInfo';

/**
 * Basic email validation
 */
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Get user info from localStorage
 */
export function getUserInfoFromStorage(): UserInfo | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const parsed = JSON.parse(stored) as UserInfo;
    
    // Validate structure
    if (!parsed.name || !parsed.email || !parsed.ts) {
      return null;
    }

    // Validate email format - if invalid, ignore stored value
    if (!isValidEmail(parsed.email)) {
      return null;
    }

    return parsed;
  } catch (error) {
    console.warn('Failed to parse user info from localStorage:', error);
    return null;
  }
}

/**
 * Save user info to localStorage
 */
export function saveUserInfoToStorage(userInfo: Omit<UserInfo, 'ts'>): void {
  try {
    // Validate email before saving
    if (!isValidEmail(userInfo.email)) {
      console.warn('Invalid email format, not saving to localStorage');
      return;
    }

    const data: UserInfo = {
      ...userInfo,
      ts: Date.now()
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn('Failed to save user info to localStorage:', error);
  }
}

/**
 * Clear user info from localStorage
 */
export function clearUserInfoFromStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear user info from localStorage:', error);
  }
}

/**
 * Get user info from URL query parameters
 */
export function getUserInfoFromURL(): Partial<UserInfo> | null {
  try {
    const params = new URLSearchParams(window.location.search);
    const name = params.get('name');
    const email = params.get('email');

    // Return if we have at least one piece of info
    if (name || email) {
      const result: Partial<UserInfo> = {};
      
      if (name) {
        result.name = decodeURIComponent(name);
      }
      
      if (email) {
        const decodedEmail = decodeURIComponent(email);
        // Only include email if it's valid
        if (isValidEmail(decodedEmail)) {
          result.email = decodedEmail;
        }
      }

      return Object.keys(result).length > 0 ? result : null;
    }

    return null;
  } catch (error) {
    console.warn('Failed to parse user info from URL:', error);
    return null;
  }
}

/**
 * Get user info with priority: URL params > localStorage
 */
export function getPrefillUserInfo(): Partial<UserInfo> | null {
  const urlInfo = getUserInfoFromURL();
  const storageInfo = getUserInfoFromStorage();

  // If we have URL params, use them (they override storage)
  if (urlInfo && (urlInfo.name || urlInfo.email)) {
    return urlInfo;
  }

  // Otherwise use storage if available
  if (storageInfo) {
    return storageInfo;
  }

  return null;
}