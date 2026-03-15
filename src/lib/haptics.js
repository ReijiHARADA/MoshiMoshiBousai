import { WebHaptics } from 'web-haptics';

const instance =
  typeof window !== 'undefined' ? new WebHaptics() : null;

const PATTERNS = {
  returnToUnanswered: [
    { duration: 40, intensity: 0.7 },
    { delay: 40, duration: 40, intensity: 0.7 },
    { delay: 40, duration: 40, intensity: 0.9 },
    { delay: 40, duration: 50, intensity: 0.6 },
  ],
  success: 'success',
  subtle: [{ duration: 20, intensity: 0.4 }],
};

async function safeTrigger(input) {
  try {
    await instance?.trigger(input);
  } catch {
    // no-op: 失敗しても UI に影響させない
  }
}

export const haptics = {
  returnToUnanswered: () => safeTrigger(PATTERNS.returnToUnanswered),
  success: () => safeTrigger(PATTERNS.success),
  subtle: () => safeTrigger(PATTERNS.subtle),
  error: () => safeTrigger('error'),
};
