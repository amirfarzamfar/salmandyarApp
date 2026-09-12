export type MemoryGameEventName =
  | 'memory_game_started'
  | 'memory_game_completed'
  | 'memory_game_shared'
  | 'memory_game_signup_clicked'
  | 'memory_game_signup_completed';

export interface MemoryGameStartedPayload {
  source?: 'hero' | 'restart' | 'last_result';
}

export interface MemoryGameStageScores {
  stage1: number;
  stage2: number;
  stage3: number;
  stage4: number;
  stage5: number;
}

export interface MemoryGameCompletedPayload {
  score: number;
  visualMemory: number;
  attention: number;
  recall: number;
  correctCount: number;
  totalQuestions: number;
  stageScores: MemoryGameStageScores;
  durationMs?: number;
}

export interface MemoryGameSharedPayload {
  channel: 'native' | 'whatsapp' | 'telegram' | 'copy';
  score: number;
}

export interface MemoryGameSignupClickedPayload {
  variant: 'cta_main' | 'cta_secondary';
  score?: number;
}

export interface MemoryGameSignupCompletedPayload {
  score?: number;
}

export interface MemoryGameEventPayloadMap {
  memory_game_started: MemoryGameStartedPayload;
  memory_game_completed: MemoryGameCompletedPayload;
  memory_game_shared: MemoryGameSharedPayload;
  memory_game_signup_clicked: MemoryGameSignupClickedPayload;
  memory_game_signup_completed: MemoryGameSignupCompletedPayload;
}

export type AnalyticsEvent<E extends MemoryGameEventName = MemoryGameEventName> = {
  name: E;
  payload: MemoryGameEventPayloadMap[E];
  timestamp?: number;
  url?: string;
  userAgent?: string;
};

type AnalyticsProvider = (event: AnalyticsEvent) => void | Promise<void>;

const providers: AnalyticsProvider[] = [];

const consoleProvider: AnalyticsProvider = (event) => {
  if (typeof console !== 'undefined' && typeof console.debug === 'function') {
    console.debug('[analytics]', event.name, event.payload);
  }
};

providers.push(consoleProvider);

export function registerAnalyticsProvider(provider: AnalyticsProvider): () => void {
  providers.push(provider);
  return () => {
    const idx = providers.indexOf(provider);
    if (idx >= 0) providers.splice(idx, 1);
  };
}

export function track<E extends MemoryGameEventName>(
  name: E,
  payload: MemoryGameEventPayloadMap[E],
): void {
  try {
    const event: AnalyticsEvent<E> = {
      name,
      payload,
      timestamp: Date.now(),
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    };
    for (const provider of providers) {
      void Promise.resolve(provider(event as AnalyticsEvent));
    }
  } catch {
    // Never let analytics break user flow
  }
}

declare global {
  interface Window {
    __salmandyarAnalytics?: {
      register: typeof registerAnalyticsProvider;
      track: typeof track;
    };
  }
}

if (typeof window !== 'undefined') {
  window.__salmandyarAnalytics = {
    register: registerAnalyticsProvider,
    track,
  };
}
