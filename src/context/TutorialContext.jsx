import React, { createContext, useContext, useState, useCallback, useRef } from "react";
import { auth } from "../firebase";

// ── localStorage key helpers ────────────────────────────────────────────────
const ONBOARDING_KEY = (uid) => `localyze_tutorial_done_${uid}`;
const COMPARE_KEY    = (uid) => `localyze_compare_tip_seen_${uid}`;

// ── Tutorial IDs ────────────────────────────────────────────────────────────
export const TUTORIAL_IDS = {
  ONBOARDING: "onboarding",
  COMPARE:    "compare",
};

const TutorialContext = createContext(null);

export function TutorialProvider({ children }) {
  const [activeTutorial, setActiveTutorial] = useState(null);
  const queueRef = useRef([]);  // pending tutorial ids, ordered by priority

  // ── Check if onboarding tour is currently running ─────────────────────────
  const isOnboardingActive = activeTutorial === TUTORIAL_IDS.ONBOARDING;

  // ── Check completion status from localStorage ─────────────────────────────
  const hasCompletedOnboarding = useCallback(() => {
    const uid = auth.currentUser?.uid;
    return uid ? !!localStorage.getItem(ONBOARDING_KEY(uid)) : false;
  }, []);

  const hasSeenCompareFeature = useCallback(() => {
    const uid = auth.currentUser?.uid;
    return uid ? !!localStorage.getItem(COMPARE_KEY(uid)) : false;
  }, []);

  // ── Process queue: show next tutorial if nothing is active ────────────────
  const processQueue = useCallback(() => {
    if (queueRef.current.length === 0) return;
    const next = queueRef.current[0];
    queueRef.current = queueRef.current.slice(1);
    setActiveTutorial(next);
  }, []);

  // ── Request a tutorial to show ────────────────────────────────────────────
  // priority: higher = more important (onboarding=100, compare=10)
  const requestTutorial = useCallback((id, priority = 0) => {
    // Already active or already queued
    if (activeTutorial === id || queueRef.current.includes(id)) return;

    if (!activeTutorial) {
      // Nothing active → show immediately
      setActiveTutorial(id);
    } else {
      // Something active → add to queue sorted by priority (desc)
      queueRef.current = [...queueRef.current, id];
    }
  }, [activeTutorial]);

  // ── Complete/dismiss the active tutorial ───────────────────────────────────
  const completeTutorial = useCallback((id) => {
    const uid = auth.currentUser?.uid;

    // Persist to localStorage
    if (uid) {
      if (id === TUTORIAL_IDS.ONBOARDING) {
        localStorage.setItem(ONBOARDING_KEY(uid), "true");
      } else if (id === TUTORIAL_IDS.COMPARE) {
        localStorage.setItem(COMPARE_KEY(uid), "true");
      }
    }

    // Clear active and process next in queue
    setActiveTutorial(null);
    // Use setTimeout to let the exit animation complete before showing next
    setTimeout(() => {
      if (queueRef.current.length > 0) {
        const next = queueRef.current[0];
        queueRef.current = queueRef.current.slice(1);
        setActiveTutorial(next);
      }
    }, 400);
  }, []);

  // ── Remove a tutorial from the queue without completing ────────────────────
  const cancelTutorial = useCallback((id) => {
    queueRef.current = queueRef.current.filter((t) => t !== id);
    if (activeTutorial === id) {
      setActiveTutorial(null);
      setTimeout(() => {
        if (queueRef.current.length > 0) {
          const next = queueRef.current[0];
          queueRef.current = queueRef.current.slice(1);
          setActiveTutorial(next);
        }
      }, 400);
    }
  }, [activeTutorial]);

  const value = {
    activeTutorial,
    isOnboardingActive,
    hasCompletedOnboarding,
    hasSeenCompareFeature,
    requestTutorial,
    completeTutorial,
    cancelTutorial,
    TUTORIAL_IDS,
  };

  return (
    <TutorialContext.Provider value={value}>
      {children}
    </TutorialContext.Provider>
  );
}

export function useTutorialManager() {
  const ctx = useContext(TutorialContext);
  if (!ctx) throw new Error("useTutorialManager must be used inside <TutorialProvider>");
  return ctx;
}
