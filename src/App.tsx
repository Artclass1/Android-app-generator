import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Wand2,
  Download,
  Code2,
  FileArchive,
  Smartphone,
  Loader2,
  RefreshCw,
  FileCode2,
  FolderOpen,
  ShieldCheck,
  Cookie,
  Lock
} from 'lucide-react';
import { generateAndroidApp, AppFile } from './services/geminiService';
import { createZipBlob, downloadBlob } from './services/zipService';
import { cn } from './lib/utils';
import { ErrorBoundary } from './components/ErrorBoundary';

const MAX_PROMPT_LENGTH = 2000;

export default function App() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedFiles, setGeneratedFiles] = useState<AppFile[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasConsented, setHasConsented] = useState(true);

  useEffect(() => {
    const consent = localStorage.getItem('gdpr-consent');
    if (!consent) {
      setHasConsented(false);
    }
  }, []);

  const handleAcceptConsent = () => {
    localStorage.setItem('gdpr-consent', 'true');
    setHasConsented(true);
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || prompt.length > MAX_PROMPT_LENGTH) return;
    
    setIsGenerating(true);
    setError(null);
    setGeneratedFiles(null);

    try {
      const files = await generateAndroidApp(prompt.trim());
      setGeneratedFiles(files);
    } catch (err: any) {
      setError(err.message || 'An error occurred while generating the app.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!generatedFiles) return;
    try {
      const blob = await createZipBlob(generatedFiles);
      downloadBlob(blob, 'android-app-project.zip');
    } catch (err: any) {
      setError('Failed to create ZIP file.');
    }
  };

  const handleReset = () => {
    setPrompt('');
    setGeneratedFiles(null);
    setError(null);
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-50 font-sans selection:bg-indigo-500/30">
        {/* Header */}
        <header className="border-b border-white/10 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Smartphone className="w-5 h-5" />
              </div>
              <h1 className="text-lg font-medium tracking-tight">Android App Generator <span className="text-xs text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-full ml-2">Enterprise</span></h1>
            </div>
            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
              <ShieldCheck className="w-4 h-4" />
              <span>Secure Connection</span>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-12">
          <AnimatePresence mode="wait">
            {!generatedFiles && !isGenerating ? (
              <motion.div
                key="input-view"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-2xl mx-auto space-y-8"
              >
                <div className="text-center space-y-4">
                  <h2 className="text-4xl font-semibold tracking-tight">
                    Describe your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Android App</span>
                  </h2>
                  <p className="text-zinc-400 text-lg">
                    Enter your app concept below. Our AI will architect and generate a complete, professional Android Studio project ready for download.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      maxLength={MAX_PROMPT_LENGTH}
                      placeholder="e.g., A professional task management app with a clean UI, using Room database for local storage, and a dashboard showing task statistics..."
                      className="relative w-full h-48 bg-zinc-900 border border-white/10 rounded-2xl p-6 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none text-lg leading-relaxed shadow-xl"
                    />
                    <div className="absolute bottom-4 right-4 text-xs text-zinc-500 font-mono">
                      {prompt.length} / {MAX_PROMPT_LENGTH}
                    </div>
                  </div>

                  {error && (
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                      {error}
                    </div>
                  )}

                  <button
                    onClick={handleGenerate}
                    disabled={!prompt.trim() || prompt.length > MAX_PROMPT_LENGTH || !hasConsented}
                    className="w-full h-14 bg-white text-zinc-950 rounded-xl font-medium text-lg flex items-center justify-center gap-2 hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-white/5"
                  >
                    <Wand2 className="w-5 h-5" />
                    Generate Android Project
                  </button>
                  
                  <div className="flex items-center justify-center gap-2 text-xs text-zinc-500 mt-4">
                    <Lock className="w-3 h-3" />
                    <span>End-to-end encrypted generation. We do not store your prompts.</span>
                  </div>
                </div>
              </motion.div>
            ) : isGenerating ? (
              <motion.div
                key="loading-view"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center justify-center py-24 space-y-8"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 rounded-full animate-pulse"></div>
                  <Loader2 className="w-16 h-16 text-indigo-400 animate-spin relative z-10" />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-medium">Architecting your app...</h3>
                  <p className="text-zinc-400">This may take a minute. We're generating Gradle scripts, Kotlin code, and XML layouts.</p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="result-view"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-semibold tracking-tight">Project Ready</h2>
                    <p className="text-zinc-400 mt-1">Your Android Studio project has been generated successfully.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleReset}
                      className="px-4 py-2.5 rounded-lg border border-white/10 hover:bg-white/5 flex items-center gap-2 text-sm font-medium transition-colors"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Start Over
                    </button>
                    <button
                      onClick={handleDownload}
                      className="px-6 py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white flex items-center gap-2 text-sm font-medium transition-colors shadow-lg shadow-indigo-500/20"
                    >
                      <Download className="w-4 h-4" />
                      Download ZIP
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* File Tree Overview */}
                  <div className="col-span-1 bg-zinc-900 border border-white/10 rounded-2xl p-6 shadow-xl">
                    <div className="flex items-center gap-2 mb-6 text-zinc-100">
                      <FolderOpen className="w-5 h-5 text-indigo-400" />
                      <h3 className="font-medium">Generated Files</h3>
                    </div>
                    <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                      {generatedFiles?.map((file, idx) => (
                        <div key={idx} className="flex items-start gap-3 text-sm group">
                          <FileCode2 className="w-4 h-4 text-zinc-500 mt-0.5 shrink-0 group-hover:text-indigo-400 transition-colors" />
                          <span className="text-zinc-400 group-hover:text-zinc-200 transition-colors break-all">
                            {file.path}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="col-span-1 lg:col-span-2 space-y-6">
                    <div className="bg-zinc-900 border border-white/10 rounded-2xl p-8 shadow-xl">
                      <h3 className="text-xl font-medium mb-4 flex items-center gap-2">
                        <FileArchive className="w-5 h-5 text-indigo-400" />
                        Next Steps
                      </h3>
                      <ol className="space-y-4 text-zinc-300">
                        <li className="flex gap-4">
                          <span className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-medium">1</span>
                          <div>
                            <strong className="text-zinc-100 block mb-1">Download the ZIP</strong>
                            Click the "Download ZIP" button above to save the generated project to your computer.
                          </div>
                        </li>
                        <li className="flex gap-4">
                          <span className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-medium">2</span>
                          <div>
                            <strong className="text-zinc-100 block mb-1">Extract the Archive</strong>
                            Unzip the downloaded file into a new folder.
                          </div>
                        </li>
                        <li className="flex gap-4">
                          <span className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-medium">3</span>
                          <div>
                            <strong className="text-zinc-100 block mb-1">Open in Android Studio</strong>
                            Launch Android Studio, select "Open", and navigate to the extracted folder. Android Studio will automatically sync the Gradle project.
                          </div>
                        </li>
                        <li className="flex gap-4">
                          <span className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-medium">4</span>
                          <div>
                            <strong className="text-zinc-100 block mb-1">Run Your App</strong>
                            Once the Gradle sync is complete, select an emulator or connected device and click the "Run" button (green play icon).
                          </div>
                        </li>
                      </ol>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Footer */}
        <footer className="border-t border-white/10 bg-zinc-950 py-8 mt-auto">
          <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-zinc-500">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4" />
              <span>&copy; {new Date().getFullYear()} Android App Generator. All rights reserved.</span>
            </div>
            <div className="flex items-center gap-6">
              <a href="#" className="hover:text-zinc-300 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-zinc-300 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-zinc-300 transition-colors">Cookie Policy</a>
            </div>
          </div>
        </footer>

        {/* GDPR Consent Banner */}
        <AnimatePresence>
          {!hasConsented && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="fixed bottom-0 left-0 right-0 p-4 z-50"
            >
              <div className="max-w-5xl mx-auto bg-zinc-900 border border-white/10 shadow-2xl rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center shrink-0 mt-1">
                    <Cookie className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <h4 className="text-zinc-100 font-medium mb-1">We value your privacy</h4>
                    <p className="text-sm text-zinc-400">
                      We use essential cookies to ensure our application functions securely and correctly. By continuing to use this site, you consent to our data processing in accordance with GDPR.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 w-full md:w-auto">
                  <button
                    onClick={handleAcceptConsent}
                    className="flex-1 md:flex-none px-6 py-2.5 bg-white text-zinc-950 rounded-xl font-medium hover:bg-zinc-200 transition-colors"
                  >
                    Accept & Continue
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ErrorBoundary>
  );
}
