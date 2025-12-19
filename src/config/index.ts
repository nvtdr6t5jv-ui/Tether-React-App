export const config = {
  supabase: {
    url: process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co',
    anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key',
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
