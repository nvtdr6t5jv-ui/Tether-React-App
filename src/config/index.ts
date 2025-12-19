const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const config = {
  supabase: {
    url: supabaseUrl || 'https://placeholder.supabase.co',
    anonKey: supabaseAnonKey || 'placeholder-key',
    isConfigured: !!(supabaseUrl && supabaseAnonKey),
  },
  revenueCat: {
    appleApiKey: process.env.EXPO_PUBLIC_REVENUECAT_APPLE_KEY || 'appl_your_api_key',
    googleApiKey: process.env.EXPO_PUBLIC_REVENUECAT_GOOGLE_KEY || 'goog_your_api_key',
  },
  notifications: {
    projectId: process.env.EXPO_PUBLIC_PROJECT_ID || 'your-expo-project-id',
  },
  app: {
    freeContactsLimit: 5,
    premiumEntitlementId: 'premium',
  },
};
