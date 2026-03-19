# Android App Generator - Enterprise Edition

A production-ready, highly secure web application that leverages AI to generate complete Android Studio projects from text descriptions. Ready to be published or sold as a SaaS starter kit.

## 🛡️ Security & Compliance Features (European Standard)

- **GDPR & ePrivacy Ready**: Includes European-standard data processing consent flows and cookie notices.
- **Content Security Policy (CSP)**: Strict browser-level security headers to prevent Cross-Site Scripting (XSS) and data injection attacks.
- **Input Validation & Sanitization**: Strict client-side length limits and sanitization to prevent prompt injection and abuse.
- **Secure Export Architecture**: Generates safe, standard `.zip` archives entirely in-memory without executing arbitrary code or exposing server file systems.
- **Zero-Tracking Default**: No third-party tracking scripts are included by default, ensuring maximum user privacy.

## 🚀 Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   Copy `.env.example` to `.env` and add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```

4. **Production Build**
   ```bash
   npm run build
   ```

## 🏗️ Architecture

- **Frontend**: React 19, Vite, Tailwind CSS v4, Framer Motion
- **AI Integration**: Google GenAI SDK (`gemini-3.1-pro-preview`)
- **Archive Generation**: JSZip (In-memory blob generation)

## 📝 License & Selling

This project is structured to be sold on platforms like GitHub, CodeCanyon, or as a standalone SaaS. Ensure you update the Privacy Policy and Terms of Service placeholders before commercial deployment.
