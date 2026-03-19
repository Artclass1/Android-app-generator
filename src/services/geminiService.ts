import { GoogleGenAI, Type } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface AppFile {
  path: string;
  content: string;
}

const SYSTEM_INSTRUCTION = `You are an expert Android Developer and Software Architect.
Your task is to generate a complete, professional, and advanced Android Studio project based on the user's concept.
You must output a list of files with their relative paths and complete contents.

The generated project MUST be a valid Android Studio project using Kotlin and Gradle (KTS).
It must include all necessary files to be opened and built in Android Studio, including:
1. build.gradle.kts (Project level)
2. app/build.gradle.kts (App level)
3. settings.gradle.kts
4. gradle.properties
5. app/src/main/AndroidManifest.xml
6. app/src/main/java/com/example/app/MainActivity.kt (and any other necessary Kotlin files)
7. app/src/main/res/layout/activity_main.xml (and any other necessary layout files)
8. app/src/main/res/values/strings.xml
9. app/src/main/res/values/themes.xml
10. app/src/main/res/values/colors.xml

Guidelines:
- Use modern Android development practices (e.g., ViewBinding or Jetpack Compose if appropriate, but stick to XML layouts if simpler for a complete working example unless Compose is requested).
- Ensure the package name is consistently 'com.example.app'.
- Provide advanced, professional code with proper error handling, comments, and structure.
- Do NOT include binary files (like icons or images). If needed, use standard Android vector drawables or placeholders.
- Ensure the Gradle files use modern dependency management and compatible versions.
- The output MUST be a JSON array of file objects.`;

export async function generateAndroidApp(prompt: string): Promise<AppFile[]> {
  const response = await ai.models.generateContent({
    model: 'gemini-3.1-pro-preview',
    contents: prompt,
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
