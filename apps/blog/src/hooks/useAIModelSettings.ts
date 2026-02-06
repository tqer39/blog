'use client';

import type { AIModelSettings } from '@blog/cms-types';
import { DEFAULT_AI_MODEL_SETTINGS } from '@blog/cms-types';
import { devError } from '@blog/utils';
import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'blog-ai-model-settings';

export function useAIModelSettings() {
  const [settings, setSettings] = useState<AIModelSettings>(
    DEFAULT_AI_MODEL_SETTINGS
  );
  const [isLoaded, setIsLoaded] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSettings({ ...DEFAULT_AI_MODEL_SETTINGS, ...parsed });
      }
    } catch (e) {
      devError('Failed to load AI model settings:', e);
    }
    setIsLoaded(true);
  }, []);

  // Save settings to localStorage
  const updateSettings = useCallback(
    (newSettings: Partial<AIModelSettings>) => {
      setSettings((prev) => {
        const updated = { ...prev, ...newSettings };
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch (e) {
          devError('Failed to save AI model settings:', e);
        }
        return updated;
      });
    },
    []
  );

  // Reset to defaults
  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_AI_MODEL_SETTINGS);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      devError('Failed to reset AI model settings:', e);
    }
  }, []);

  return { settings, updateSettings, resetSettings, isLoaded };
}
