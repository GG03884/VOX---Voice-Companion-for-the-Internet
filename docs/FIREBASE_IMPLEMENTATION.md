# Firebase AI Logic Hybrid Inference Implementation Guide for VOX

This document outlines the verified API choices, SDK configuration, architecture, and runtime behavior for **VOX** in the context of the Google Firebase `#BuildHybridAI` hackathon.

---

## 1. Verified SDK Package & Module Imports

The project strictly imports from the official modular Firebase Web SDK (v12+):

```typescript
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { 
  initializeAppCheck, 
  ReCaptchaEnterpriseProvider, 
  ReCaptchaV3Provider, 
  CustomProvider,
  type AppCheck 
} from 'firebase/app-check';
import { 
  getAI, 
  getGenerativeModel, 
  GoogleAIBackend, 
  InferenceMode,
  type GenerativeModel,
  type GenerateContentResult
} from 'firebase/ai';
```

> **Important**: Application code never imports `@firebase/ai` directly. The official `firebase` package contains all modular subpaths including `firebase/ai` and `firebase/app-check`.

---

## 2. Model Identifier & Supported Platform Requirements

### Supported Environments
- **Browser**: Desktop Google Chrome (Chrome 139+ or Chrome Canary/Dev with on-device AI flags enabled).
- **On-Device Model**: Chrome Built-in **Gemini Nano** via the browser's native optimization guide & Prompt API.
- **Cloud Fallback Model**: `gemini-2.5-flash` (or `gemini-2.0-flash` / `gemini-1.5-flash`) via the Gemini Developer API backend (`GoogleAIBackend`).
- **Prerequisites for On-Device Execution**:
  1. Operating System: Windows 10/11 (64-bit), macOS (v14+ Sonoma recommended), or Linux.
  2. Storage & Memory: Minimum 16 GB RAM and ~22 GB free disk space for local weights.
  3. Chrome Flags (when testing experimental preview):
     - `chrome://flags/#prompt-api-for-gemini-nano`: Enabled
     - `chrome://flags/#optimization-guide-on-device-model`: Enabled BypassPerfRequirement
     - Model component status verified at `chrome://components` (`Optimization Guide On Device Model`).

---

## 3. Initialization & Hybrid Inference Strategy

VOX initializes the Firebase AI service with `GoogleAIBackend` and configures the generative model to prefer local execution while maintaining automatic cloud fallback:

```typescript
// 1. Initialize Firebase App
const app = initializeApp(firebaseConfig);

// 2. Initialize Firebase AI service with Gemini Developer API backend
const ai = getAI(app, { 
  backend: new GoogleAIBackend() 
});

// 3. Configure Model with PREFER_ON_DEVICE inference strategy
const model = getGenerativeModel(ai, {
  model: 'gemini-2.5-flash',
  mode: InferenceMode.PREFER_ON_DEVICE,
});
```

### Supported `InferenceMode` Options
1. **`InferenceMode.PREFER_ON_DEVICE`**: Attempts on-device inference using Gemini Nano. If the model is not downloaded, unsupported, or encounters an issue, the SDK automatically routes to the cloud Gemini model.
2. **`InferenceMode.PREFER_IN_CLOUD`**: Prioritizes cloud execution, useful if low device battery or complex prompt exceeds local token window.
3. **`InferenceMode.ONLY_ON_DEVICE`**: Strict local mode; errors out if Gemini Nano is not ready.
4. **`InferenceMode.ONLY_IN_CLOUD`**: Strict cloud mode.

VOX exposes user-selectable preference in Settings while defaulting to `PREFER_ON_DEVICE`.

---

## 4. Inference Source Transparency (On-Device vs Cloud)

VOX **never guesses or fakes** the inference source. The Firebase AI Logic SDK attaches runtime execution metadata directly to the generation response:

```typescript
const result: GenerateContentResult = await model.generateContent(prompt);
const source = result.response.inferenceSource; // 'ON_DEVICE' | 'IN_CLOUD'
```

VOX maps this metadata honestly:
- **`ON_DEVICE`**: Handled locally by Gemini Nano on the user's machine (zero server roundtrip, maximum privacy).
- **`IN_CLOUD`**: Handled by Google Cloud Gemini servers (used when local model is unavailable, offline, or device does not meet requirements).
- **`UNKNOWN` / `UNAVAILABLE`**: If the SDK response omits source metadata, VOX displays "Source unavailable" and explains why.

---

## 5. Firebase App Check Configuration

Firebase AI Logic requires App Check to protect backend services from abuse.

### Production Setup
```typescript
const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaEnterpriseProvider(reCaptchaSiteKey),
  isTokenAutoRefreshEnabled: true,
});
```

### Local Development & Debug Token
For development and Chrome extension side panel testing:
```typescript
if (import.meta.env.DEV || import.meta.env.VITE_APPCHECK_DEBUG_TOKEN) {
  // Sets debug token for App Check
  // @ts-ignore
  self.FIREBASE_APPCHECK_DEBUG_TOKEN = import.meta.env.VITE_APPCHECK_DEBUG_TOKEN || true;
}
```

When set to `true`, the browser console outputs:
```text
AppCheck debug token: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'. Copy it to the Firebase Console...
```
Register this debug token in Firebase Console under **App Check > Manage debug tokens**.

---

## 6. Single-Turn vs Multi-Turn Handling

The current Firebase AI Logic web on-device implementation focuses on **single-turn text generation**:
`model.generateContent(prompt)`

VOX supports continuous conversational learning through client-side context management:
- Maintains a bounded rolling conversation history (last $N$ turns).
- Clearly frames untrusted webpage context separately from user instructions.
- Formulates each request with explicit system instructions, reference material, conversation history, and the user's active query.

---

## 7. Distinct Capability & Offline Matrix

VOX clearly separates distinct device capabilities:

| Capability | Source | Can Work Offline? | Fallback if Unavailable |
|---|---|---|---|
| **AI Inference** | Firebase AI Logic (`InferenceMode.PREFER_ON_DEVICE`) | **Yes**, if Gemini Nano is downloaded and active | Cloud Gemini model (requires network) |
| **Speech-to-Text (STT)** | Browser Web Speech API (`SpeechRecognition`) | **Browser-dependent** (often requires cloud speech service) | Typed prompt composer with edit controls |
| **Text-to-Speech (TTS)** | Browser SpeechSynthesis API (`speechSynthesis`) | **Yes**, when local OS/browser voices are installed | Visible formatted text + copy button |
| **Web Connectivity** | `navigator.onLine` & network events | N/A | Local AI only (if Nano is ready), typed input |
