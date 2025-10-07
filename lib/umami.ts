// Umami tracking utility
declare global {
  interface Window {
    umami?: {
      track: (event: string, data?: Record<string, any>) => void;
    };
  }
}

export const trackEvent = (event: string, data?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.umami) {
    window.umami.track(event, data);
  }
};

// Predefined tracking events
export const TRACKING_EVENTS = {
  // Text generation events
  PROMPT_TEMPLATE_CLICK: 'prompt_template_click',
  GENERATE_BUTTON_CLICK: 'generate_button_click',
  GENERATION_START: 'generation_start',
  GENERATION_SUCCESS: 'generation_success',
  GENERATION_ERROR: 'generation_error',
  
  // Feedback events
  FEEDBACK_PANEL_OPEN: 'feedback_panel_open',
  FEEDBACK_SUBMIT: 'feedback_submit',
  FEEDBACK_SUCCESS: 'feedback_success',
  FEEDBACK_ERROR: 'feedback_error',
  
  // Pricing events
  PRICING_PACK_CLICK: 'pricing_pack_click',
  PURCHASE_START: 'purchase_start',
  PURCHASE_SUCCESS: 'purchase_success',
  PURCHASE_ERROR: 'purchase_error',
  
  // Authentication events
  LOGIN_ATTEMPT: 'login_attempt',
  LOGIN_SUCCESS: 'login_success',
  LOGIN_ERROR: 'login_error',
  REGISTER_ATTEMPT: 'register_attempt',
  REGISTER_SUCCESS: 'register_success',
  REGISTER_ERROR: 'register_error',
  LOGOUT: 'logout',
  
  // Navigation events
  NAVIGATION_CLICK: 'navigation_click',
  FOOTER_LINK_CLICK: 'footer_link_click',
  
  // Page events
  PAGE_VIEW: 'page_view',
  SECTION_VIEW: 'section_view',
} as const;

// Helper functions for common tracking scenarios
export const trackPromptTemplate = (templateName: string) => {
  trackEvent(TRACKING_EVENTS.PROMPT_TEMPLATE_CLICK, { template: templateName });
};

export const trackGeneration = (action: 'start' | 'success' | 'error', data?: Record<string, any>) => {
  const event = action === 'start' ? TRACKING_EVENTS.GENERATION_START :
                action === 'success' ? TRACKING_EVENTS.GENERATION_SUCCESS :
                TRACKING_EVENTS.GENERATION_ERROR;
  trackEvent(event, data);
};

export const trackFeedback = (action: 'open' | 'submit' | 'success' | 'error', data?: Record<string, any>) => {
  const event = action === 'open' ? TRACKING_EVENTS.FEEDBACK_PANEL_OPEN :
                action === 'submit' ? TRACKING_EVENTS.FEEDBACK_SUBMIT :
                action === 'success' ? TRACKING_EVENTS.FEEDBACK_SUCCESS :
                TRACKING_EVENTS.FEEDBACK_ERROR;
  trackEvent(event, data);
};

export const trackPricing = (action: 'pack_click' | 'purchase_start' | 'purchase_success' | 'purchase_error', data?: Record<string, any>) => {
  const event = action === 'pack_click' ? TRACKING_EVENTS.PRICING_PACK_CLICK :
                action === 'purchase_start' ? TRACKING_EVENTS.PURCHASE_START :
                action === 'purchase_success' ? TRACKING_EVENTS.PURCHASE_SUCCESS :
                TRACKING_EVENTS.PURCHASE_ERROR;
  trackEvent(event, data);
};

export const trackNavigation = (linkName: string, location: 'nav' | 'footer') => {
  const event = location === 'nav' ? TRACKING_EVENTS.NAVIGATION_CLICK : TRACKING_EVENTS.FOOTER_LINK_CLICK;
  trackEvent(event, { link: linkName, location });
};

export const trackPageView = (page: string) => {
  trackEvent(TRACKING_EVENTS.PAGE_VIEW, { page });
};

export const trackSectionView = (section: string) => {
  trackEvent(TRACKING_EVENTS.SECTION_VIEW, { section });
};

// Authentication tracking functions
export const trackAuth = (action: 'login_attempt' | 'login_success' | 'login_error' | 'register_attempt' | 'register_success' | 'register_error' | 'logout', data?: Record<string, any>) => {
  const event = action === 'login_attempt' ? TRACKING_EVENTS.LOGIN_ATTEMPT :
                action === 'login_success' ? TRACKING_EVENTS.LOGIN_SUCCESS :
                action === 'login_error' ? TRACKING_EVENTS.LOGIN_ERROR :
                action === 'register_attempt' ? TRACKING_EVENTS.REGISTER_ATTEMPT :
                action === 'register_success' ? TRACKING_EVENTS.REGISTER_SUCCESS :
                action === 'register_error' ? TRACKING_EVENTS.REGISTER_ERROR :
                TRACKING_EVENTS.LOGOUT;
  trackEvent(event, data);
};
