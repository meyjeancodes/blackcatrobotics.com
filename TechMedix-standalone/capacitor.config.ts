// @capacitor/cli is an optional dev dependency — install with:
//   npm install --save-dev @capacitor/cli @capacitor/core @capacitor/ios @capacitor/android

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const config: any = {
  appId: "com.blackcatrobotics.bcos",
  appName: "BlackCat OS",
  webDir: "out",
  server: {
    // For local dev against Next.js dev server:
    // url: "http://192.168.1.x:3000",
    // cleartext: true,
  },
  ios: {
    contentInset: "automatic",
    backgroundColor: "#0d0d12",
  },
  android: {
    backgroundColor: "#0d0d12",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
    },
  },
};

export default config;
