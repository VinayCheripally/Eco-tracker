import 'dotenv/config';

export default {
  expo: {
    owner: 'vinayhjejiner',
    name: 'eco-tracker',
    slug: 'eco-tracker',
    version: '1.0.0',
    android: {
      package: 'com.yourname.ecotracker',
    },
    extra: {
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      eas: {
        projectId: '9e36d89f-6aa3-40aa-bd3d-997c516f6330',
      },
    },
    splash: {
      image: './assets/images/icon.png',
    },
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'myapp',
    userInterfaceStyle: 'automatic',
    newArchEnabled: false, // Temporarily disabled to fix APK crashes
    ios: {
      supportsTablet: true,
    },
    web: {
      bundler: 'metro',
      output: 'single',
      favicon: './assets/images/favicon.png',
    },
    plugins: ['expo-router', 'expo-font', 'expo-web-browser'],
    experiments: {
      typedRoutes: true,
    },
  },
};