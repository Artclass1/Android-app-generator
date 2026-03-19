import { GoogleGenAI, Type } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface AppFile {
  path: string;
  content: string;
}

export interface AppConfig {
  prompt: string;
  packageName: string;
  minSdk: string;
  uiFramework: 'Compose' | 'XML';
  monetization: {
    admob: boolean;
    billing: boolean;
  };
}

const SYSTEM_INSTRUCTION = `You are an elite Android Architect and Developer.
Your task is to generate a complete, premium, production-ready Android Studio project based on the user's concept.
The generated app MUST be ready to be published on the Google Play Store and monetized.

You must output a list of files with their relative paths and complete contents.

The generated project MUST be a valid Android Studio project using Kotlin and Gradle (KTS), including:
1. build.gradle.kts (Project level)
2. app/build.gradle.kts (App level) - Must include dependencies for monetization, architecture, and UI.
3. settings.gradle.kts
4. gradle.properties
5. proguard-rules.pro - Essential for Play Store security and optimization.
6. app/src/main/AndroidManifest.xml - Include necessary permissions (INTERNET, AD_ID, BILLING etc.) and metadata.
7. app/src/main/java/<package_path>/... - Use MVVM architecture, Repository pattern, and clean code.
8. app/src/main/res/... - Include modern Material 3 themes, colors, and adaptive icons.

Guidelines for Play Store Readiness & Monetization:
- Provide advanced, professional code with proper error handling, coroutines for async tasks, and state management.
- Implement a proper Splash Screen using the AndroidX Core Splashscreen API.
- The output MUST be a JSON array of file objects.`;

export async function generateAndroidApp(config: AppConfig): Promise<AppFile[]> {
  const detailedPrompt = `
Generate a production-ready Android app with the following configuration:
- App Concept: ${config.prompt}
- Package Name: ${config.packageName}
- Minimum SDK: ${config.minSdk}
- UI Framework: ${config.uiFramework === 'Compose' ? 'Jetpack Compose' : 'Material 3 XML'}
- Include AdMob Monetization: ${config.monetization.admob ? 'YES (Include placeholder AdMob App ID and Banner/Interstitial implementations)' : 'NO'}
- Include Google Play Billing: ${config.monetization.billing ? 'YES (Include BillingClient wrapper for in-app purchases/subscriptions)' : 'NO'}

Ensure the package name is strictly used across all files (AndroidManifest, Kotlin files, build.gradle.kts namespace).
If AdMob is enabled, add the required metadata tag in AndroidManifest.xml and initialize MobileAds.
If Play Billing is enabled, add the com.android.vending.BILLING permission.
`;

  const response = await ai.models.generateContent({
    model: 'gemini-3.1-pro-preview',
    contents: detailedPrompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.2,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            path: {
              type: Type.STRING,
              description: 'Relative file path, e.g., app/src/main/java/com/example/app/MainActivity.kt',
            },
            content: {
              type: Type.STRING,
              description: 'The complete file content',
            },
          },
          required: ['path', 'content'],
        },
      },
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error('No response from AI');
  }

  try {
    const files: AppFile[] = JSON.parse(text);
    return files;
  } catch (e) {
    console.error('Failed to parse JSON response', text);
    throw new Error('Invalid response format from AI');
  }
}
