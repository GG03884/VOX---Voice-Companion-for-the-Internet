# Firebase AI Logic Hybrid Inference Hackathon Submission (#BuildHybridAI)

## Project Name
**VOX — Your Voice Companion for the Internet**

## Tagline
**The internet, hands-free.**

## Platform Category
**Web (Chrome Extension - Manifest V3)**

---

## 1. What VOX Does & Problem It Solves
People consume immense amounts of information online—academic papers, news, documentation, and technical blogs. Reading everything requires constant screen focus and manual switching between the page and chatbots.

VOX transforms web browsing into an audio-first, conversational experience. Running persistently inside the Chrome Side Panel, VOX extracts the active webpage's readable content and lets users listen to explanations, ask follow-up questions hands-free via push-to-talk speech recognition, and test their understanding with interactive spoken quizzes.

---

## 2. How Firebase AI Logic Hybrid Inference is Used at Runtime
VOX imports and calls the official modular Firebase Web SDK (`firebase/ai`):
- Initializes Firebase AI Logic service using `getAI(app, { backend: new GoogleAIBackend() })`.
- Configures generative models with `InferenceMode.PREFER_ON_DEVICE`.
- When supported in desktop Chrome (with Gemini Nano enabled via Chrome Prompt APIs), inference executes 100% locally on the user's hardware—free, private, and offline-capable.
- When local models are unavailable or unsupported, the SDK automatically routes to Google Cloud Gemini models without breaking user experience.
- The UI inspects `result.response.inferenceSource` to truthfully display **On-Device (Nano)** or **Cloud Fallback** badges without ever guessing or faking status.

---

## 3. Firebase App Check Implementation
- Configured using `firebase/app-check`.
- Protects backend AI Logic services from unauthorized abuse.
- Supports debug tokens via `self.FIREBASE_APPCHECK_DEBUG_TOKEN` for local development and extension testing, alongside reCAPTCHA Enterprise/v3 providers for production builds.

---

## 4. What Makes VOX Different
- **Voice-first & Hands-free**: Combines push-to-talk speech recognition and speech synthesis with text fallback.
- **Untrusted Reference Framing**: Webpage content is extracted and securely isolated in system prompt fences, preventing prompt injections from overriding assistant instructions.
- **Interactive Comprehension (Quiz Mode)**: Moves beyond one-off summaries to question-by-question spoken learning evaluation.
- **Transparent Capabilities**: Clear distinction between on-device AI inference, speech-to-text availability, text-to-speech availability, and network status.
