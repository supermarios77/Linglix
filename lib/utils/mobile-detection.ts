/**
 * Mobile Detection Utilities
 * 
 * Detects if the user is on a mobile phone (not tablet/iPad)
 * Used to show appropriate warnings and hide unsupported features
 */

/**
 * Check if device is a mobile phone (not tablet/iPad)
 * Returns true for phones, false for tablets/iPads/desktops
 */
export function isMobilePhone(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  const userAgentLower = userAgent.toLowerCase();

  // Check for mobile phone indicators
  const mobilePhoneRegex = /android.*mobile|iphone|ipod|blackberry|iemobile|opera mini/i;
  const isMobilePhone = mobilePhoneRegex.test(userAgentLower);

  // Exclude tablets/iPads
  // iPad detection (iOS 13+)
  const isIPad = /iPad/.test(userAgent) || 
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  
  // Android tablets typically have "tablet" in user agent or larger screen
  const isAndroidTablet = /android/i.test(userAgentLower) && 
    !/mobile/i.test(userAgentLower) &&
    window.innerWidth >= 768;

  // If it's a phone (not tablet/iPad), return true
  return isMobilePhone && !isIPad && !isAndroidTablet;
}

/**
 * Check if device is a tablet (iPad or Android tablet)
 */
export function isTablet(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  const userAgentLower = userAgent.toLowerCase();

  // iPad detection (iOS 13+)
  const isIPad = /iPad/.test(userAgent) || 
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  
  // Android tablets
  const isAndroidTablet = /android/i.test(userAgentLower) && 
    !/mobile/i.test(userAgentLower) &&
    window.innerWidth >= 768;

  return isIPad || isAndroidTablet;
}

/**
 * Check if device is mobile (phone or tablet)
 */
export function isMobile(): boolean {
  return isMobilePhone() || isTablet();
}
