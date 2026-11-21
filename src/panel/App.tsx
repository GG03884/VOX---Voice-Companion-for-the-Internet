import React, { useState, useEffect, useCallback } from 'react';
import { CapabilityStrip } from '../components/CapabilityStrip';
import { ConversationView } from '../components/ConversationView';
import { QuickActions } from '../components/QuickActions';
import { VoiceComposer } from '../components/VoiceComposer';
import { SettingsModal } from '../components/SettingsModal';
import { QuizView, type QuizQuestionData } from '../components/QuizView';
import { detectCapabilities } from '../utils/capabilities';
import { speechRecognitionService } from '../services/speechRecognition';
import { speechSynthesisService } from '../services/speechSynthesis';
import { extractActiveTabContent } from '../services/pageContext';
import { conversationService, PROMPT_PRESETS } from '../services/conversation';
import { generateWithFirebaseAI } from '../services/ai';
import { isFirebaseConfigured } from '../utils/capabilities';
import type { 
  AppCapabilities, 
  ChatMessage, 
  PageContext, 
  AppSettings, 
  InferenceSource 
} from '../types';

const DEFAULT_SETTINGS: AppSettings = {
  language: 'en-US',
  speechRate: 1.0,
  speechPitch: 1.0,
  voiceURI: '',
  autoSpeakResponses: true,
  inferenceMode: 'PREFER_ON_DEVICE',
  apiKey: '',
  projectId: '',
  appId: '',
  recaptchaSiteKey: '',
};

const SETTINGS_STORAGE_KEY = 'vox_user_settings';

export const App: React.FC = () => {
  // Application State
  const [capabilities, setCapabilities] = useState<AppCapabilities>({
    aiAvailable: true,
    localAiAvailable: false,
    sttAvailable: false,
    ttsAvailable: false,
    online: true,
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    if (typeof localStorage !== 'undefined') {
      try {
        const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
        if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      } catch {
        // Fallback
      }
    }
    return DEFAULT_SETTINGS;
  });

  const [messages, setMessages] = useState<ChatMessage[]>(() => conversationService.getHistory());
  const [pageContext, setPageContext] = useState<PageContext | null>(null);
  const [isExtractingPage, setIsExtractingPage] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [speakingText, setSpeakingText] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentInferenceSource, setCurrentInferenceSource] = useState<InferenceSource | undefined>();

  // Modals & Panels
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isManualPasteOpen, setIsManualPasteOpen] = useState(false);
  const [manualText, setManualText] = useState('');

  // Quiz Mode State
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestionData[]>([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [isEvaluatingQuiz, setIsEvaluatingQuiz] = useState(false);

  // Available TTS voices
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  // 0. Sync dark mode with Chrome / OS theme preference
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = (e: MediaQueryListEvent | MediaQueryList) => {
      document.documentElement.classList.toggle('dark', e.matches);
    };
    apply(mq);
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  // 1. Initial Capability Detection and Listeners
  useEffect(() => {
    const updateCaps = () => {
      const detected = detectCapabilities();
      setCapabilities({
        aiAvailable: true,
        localAiAvailable: detected.hasWindowAiPrompt,
        sttAvailable: detected.hasSpeechRecognition,
        ttsAvailable: detected.hasSpeechSynthesis,
        online: detected.isOnline,
      });
      setVoices(speechSynthesisService.getVoices());
    };

    updateCaps();
    window.addEventListener('online', updateCaps);
    window.addEventListener('offline', updateCaps);

    // Initial page extraction attempt
    extractPage();

    return () => {
      window.removeEventListener('online', updateCaps);
      window.removeEventListener('offline', updateCaps);
    };
  }, []);

  // 2. Extract active tab page context
  const extractPage = async () => {
    setIsExtractingPage(true);
    setErrorMessage(null);
    try {
      const result = await extractActiveTabContent(6000);
      if (result.success && result.pageContext) {
        setPageContext(result.pageContext);
      } else if (result.error) {
        if (result.isRestricted) {
          setErrorMessage(result.error);
          // Auto-open paste modal so user can provide context immediately
          setIsManualPasteOpen(true);
        } else {
          // Soft notification, user can still type or paste
          console.warn('[VOX PageContext]', result.error);
        }
      }
    } catch (err) {
      console.error('[VOX PageContext]', err);
    } finally {
      setIsExtractingPage(false);
    }
  };

  // 3. Speech Playback Handlers
  const handleSpeak = useCallback((text: string) => {
    setSpeakingText(text);
    speechSynthesisService.speak(
      text,
      {
        rate: settings.speechRate,
        pitch: settings.speechPitch,
        voiceURI: settings.voiceURI,
        lang: settings.language,
      },
      (status) => {
        if (status === 'idle') {
          setSpeakingText(null);
        }
      }
    );
  }, [settings]);

  const handleStopSpeak = useCallback(() => {
    speechSynthesisService.stop();
    setSpeakingText(null);
  }, []);

  // 4. Voice Input Handlers
  const handleStartListening = () => {
    // If currently speaking, stop TTS first
    handleStopSpeak();
    setErrorMessage(null);
    setInterimTranscript('');

    speechRecognitionService.setLanguage(settings.language);
    speechRecognitionService.start(
      (transcript, isFinal) => {
        setInterimTranscript(transcript);
        if (isFinal) {
          // Transcript ready
        }
      },
      (err) => {
        setErrorMessage(err);
        setIsListening(false);
      },
      (listening) => {
        setIsListening(listening);
      }
    );
  };

  const handleStopListening = () => {
    speechRecognitionService.stop();
    setIsListening(false);
  };

  // 5. Send Generation Request
  const handleSendMessage = async (text: string, source: 'voice' | 'text' | 'action') => {
    if (!text.trim() || isGenerating) return;

    // Stop active speech
    handleStopSpeak();
    setErrorMessage(null);

    // Add user message to conversation
    conversationService.addMessage({
      role: 'user',
      content: text,
      source,
    });
    setMessages(conversationService.getHistory());

    setIsGenerating(true);

    try {
      const isGrounded = Boolean(pageContext && pageContext.content);

      const response = await generateWithFirebaseAI(
        {
          prompt: text,
          pageContext: isGrounded ? pageContext : null,
          history: messages,
          inferenceMode: settings.inferenceMode,
        },
        settings
      );

      setCurrentInferenceSource(response.inferenceSource);

      conversationService.addMessage({
        role: 'assistant',
        content: response.text,
        inferenceSource: response.inferenceSource,
        inferenceReason: response.inferenceReason,
        pageGrounded: isGrounded,
        pageTitle: pageContext?.title,
        pageUrl: pageContext?.url,
        latencyMs: response.latencyMs,
      });

      setMessages(conversationService.getHistory());

      // Auto-read response aloud if enabled
      if (settings.autoSpeakResponses && capabilities.ttsAvailable) {
        handleSpeak(response.text);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(msg);

      // Add honest error message in chat if generation failed
      conversationService.addMessage({
        role: 'assistant',
        content: `⚠️ ${msg}\n\nYou can retry, switch inference modes in Settings, or paste text manually.`,
        inferenceSource: 'UNKNOWN',
        inferenceReason: 'Generation error occurred.',
      });
      setMessages(conversationService.getHistory());
    } finally {
      setIsGenerating(false);
    }
  };

  // 6. Quick Action Dispatcher
  const handleSelectQuickAction = (actionKey: 'TEACH_ME' | 'OVERVIEW_2MIN' | 'EXPLAIN_SIMPLY' | 'KEY_TAKEAWAYS' | 'QUIZ_ME') => {
    if (actionKey === 'QUIZ_ME') {
      startQuizMode();
      return;
    }

    const prompt = PROMPT_PRESETS[actionKey];
    handleSendMessage(prompt, 'action');
  };

  const handleExplainTerm = (term: string) => {
    const prompt = PROMPT_PRESETS.EXPLAIN_TERM(term);
    handleSendMessage(prompt, 'action');
  };

  // 7. Interactive Spoken Quiz Mode
  const startQuizMode = async () => {
    setIsQuizActive(true);
    setCurrentQuizIndex(0);
    setQuizQuestions([]);
    setIsEvaluatingQuiz(true);

    try {
      const response = await generateWithFirebaseAI(
        {
          prompt: 'Generate one specific, engaging question to test understanding of this webpage. Output ONLY the question text.',
          pageContext: pageContext,
          inferenceMode: settings.inferenceMode,
        },
        settings
      );

      const firstQuestion = response.text.trim();
      setQuizQuestions([{ question: firstQuestion }]);
      if (settings.autoSpeakResponses) {
        handleSpeak(firstQuestion);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setErrorMessage(`Could not start quiz: ${msg}`);
      setIsQuizActive(false);
    } finally {
      setIsEvaluatingQuiz(false);
    }
  };

  const handleQuizAnswer = async (userAnswer: string) => {
    const currentQ = quizQuestions[currentQuizIndex];
    if (!currentQ) return;

    setIsEvaluatingQuiz(true);

    try {
      const evalPrompt = `The question was: "${currentQ.question}".
The user's answer is: "${userAnswer}".
Based on the supplied webpage content, evaluate whether the user's answer is correct, partially correct, or incorrect. Explain why briefly and constructively in 2-3 sentences.`;

      const response = await generateWithFirebaseAI(
        {
          prompt: evalPrompt,
          pageContext: pageContext,
          inferenceMode: settings.inferenceMode,
        },
        settings
      );

      const feedback = response.text.trim();
      const isCorrect = !feedback.toLowerCase().includes('incorrect') && !feedback.toLowerCase().includes('not correct');

      const updated = [...quizQuestions];
      updated[currentQuizIndex] = {
        ...currentQ,
        userAnswer,
        feedback,
        isCorrect,
      };
      setQuizQuestions(updated);

      if (settings.autoSpeakResponses) {
        handleSpeak(feedback);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setErrorMessage(`Evaluation error: ${msg}`);
    } finally {
      setIsEvaluatingQuiz(false);
    }
  };

  const handleNextQuizQuestion = async () => {
    setIsEvaluatingQuiz(true);
    try {
      const priorQuestions = quizQuestions.map(q => q.question).join(' | ');
      const response = await generateWithFirebaseAI(
        {
          prompt: `Generate the next learning question from this webpage. Do not repeat these previous questions: ${priorQuestions}. Output ONLY the question.`,
          pageContext: pageContext,
          inferenceMode: settings.inferenceMode,
        },
        settings
      );

      const nextQ = response.text.trim();
      setQuizQuestions([...quizQuestions, { question: nextQ }]);
      setCurrentQuizIndex(currentQuizIndex + 1);

      if (settings.autoSpeakResponses) {
        handleSpeak(nextQ);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setErrorMessage(`Next question error: ${msg}`);
    } finally {
      setIsEvaluatingQuiz(false);
    }
  };

  // 8. Settings Management
  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(newSettings));
    }
  };

  const handleClearHistory = () => {
    // Full reset: delete saved history and any in-progress state so VOX starts afresh
    handleStopSpeak();
    conversationService.clear();
    setMessages([]);
    setErrorMessage(null);
    setCurrentInferenceSource(undefined);
    setIsQuizActive(false);
    setQuizQuestions([]);
    setCurrentQuizIndex(0);
  };

  // 9. Manual Paste Submission
  const handleSaveManualPaste = () => {
    if (manualText.trim()) {
      setPageContext({
        title: 'Manually Pasted Content',
        url: 'pasted://text',
        content: manualText.trim(),
        truncated: false,
        charCount: manualText.length,
        extractedAt: Date.now(),
      });
      setIsManualPasteOpen(false);
      setManualText('');
      setErrorMessage(null);
    }
  };

  const isConfigured = isFirebaseConfigured(import.meta.env.VITE_FIREBASE_API_KEY, settings.apiKey);

  return (
    <div className="flex flex-col h-screen max-w-lg mx-auto bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-sans select-none overflow-hidden">
      {/* Capability and Status Header */}
      <CapabilityStrip
        capabilities={capabilities}
        currentInferenceSource={currentInferenceSource}
        activePageTitle={pageContext?.title}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isFirebaseReady={isConfigured}
      />

      {/* Quick Learning Actions */}
      <QuickActions
        pageContext={pageContext}
        onSelectAction={handleSelectQuickAction}
        onExplainTerm={handleExplainTerm}
        onRefreshPage={extractPage}
        onOpenManualPaste={() => setIsManualPasteOpen(true)}
        isLoading={isGenerating}
        isExtractingPage={isExtractingPage}
      />

      {/* Main Conversation or Quiz Mode */}
      {isQuizActive ? (
        <div className="flex-1 overflow-y-auto">
          <QuizView
            questions={quizQuestions}
            currentQuestionIndex={currentQuizIndex}
            onAnswerSubmit={handleQuizAnswer}
            onNextQuestion={handleNextQuizQuestion}
            onExitQuiz={() => setIsQuizActive(false)}
            onSpeak={handleSpeak}
            isEvaluating={isEvaluatingQuiz}
            isListening={isListening}
            onToggleVoice={isListening ? handleStopListening : handleStartListening}
            interimTranscript={interimTranscript}
          />
        </div>
      ) : (
        <ConversationView
          messages={messages}
          isGenerating={isGenerating}
          onSpeak={handleSpeak}
          onStopSpeak={handleStopSpeak}
          speakingText={speakingText}
          onSelectSuggestion={(prompt) => handleSendMessage(prompt, 'action')}
          hasPageContext={Boolean(pageContext?.content)}
          onClearHistory={handleClearHistory}
        />
      )}

      {/* Bottom Voice & Text Composer */}
      <VoiceComposer
        onSendMessage={handleSendMessage}
        isListening={isListening}
        onStartListening={handleStartListening}
        onStopListening={handleStopListening}
        isSpeaking={Boolean(speakingText)}
        onStopSpeaking={handleStopSpeak}
        interimTranscript={interimTranscript}
        isSttSupported={capabilities.sttAvailable}
        isLoading={isGenerating}
        errorMessage={errorMessage}
        onClearError={() => setErrorMessage(null)}
        onOpenPaste={() => setIsManualPasteOpen(true)}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        onClearHistory={handleClearHistory}
        availableVoices={voices}
      />

      {/* Manual Paste Modal */}
      {isManualPasteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3">
            <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-100">
              Paste Webpage Text Manually
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Useful when reading restricted pages (PDFs, chrome:// settings, or internal docs).
            </p>
            <textarea
              rows={8}
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              placeholder="Paste article, documentation, or study notes here..."
              className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-vox-500"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsManualPasteOpen(false)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveManualPaste}
                disabled={!manualText.trim()}
                className="px-4 py-1.5 rounded-lg bg-vox-600 hover:bg-vox-500 text-white text-xs font-medium disabled:opacity-50"
              >
                Use this context
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
