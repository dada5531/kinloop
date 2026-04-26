"use client";

import { useState, useEffect, useCallback, useRef } from "react";

import { useChild } from "@/components/providers/ChildProvider";

/**
 * WelcomeScreen — Full-screen overlay shown once per session when
 * the user first lands on the dashboard.
 *
 * Hierarchy: Photo (dominant, 480px desktop / 320px mobile) → Greeting → Child name + age
 * Duration: 7 seconds with progress bar, tap/click/Escape to dismiss early.
 * Transitions: 400ms ease-out fade-in, 500ms ease-out fade-out (cinematic).
 */

function getTimeOfDayGreeting(parentName?: string): string {
  const hour = new Date().getHours();
  const timeWord = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  return parentName ? `${timeWord}, ${parentName}.` : `${timeWord}.`;
}

export function WelcomeScreen() {
  const { selectedChild, getAgeDisplay, isLoading } = useChild();
  const [visible, setVisible] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [progressActive, setProgressActive] = useState(false);
  const dismissedRef = useRef(false);

  // Check if we should show the welcome screen
  useEffect(() => {
    if (isLoading) return;
    if (!selectedChild) return;

    const key = "kinloop_welcome_shown";
    if (sessionStorage.getItem(key)) return;

    setVisible(true);
    sessionStorage.setItem(key, "true");

    // Trigger fade-in after mount (next frame)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setFadeIn(true);
        setProgressActive(true);
      });
    });
  }, [isLoading, selectedChild]);

  // Auto-dismiss after 7 seconds
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => dismiss(), 7000);
    return () => clearTimeout(timer);
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  const dismiss = useCallback(() => {
    if (dismissedRef.current) return;
    dismissedRef.current = true;
    setFadeOut(true);
    setTimeout(() => setVisible(false), 500);
  }, []);

  if (!visible || !selectedChild) return null;

  const greeting = getTimeOfDayGreeting("Jenn");
  const ageDisplay = getAgeDisplay(selectedChild.dob);
  const hasPhoto = !!selectedChild.photo_url;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center transition-opacity ease-out ${
        fadeOut
          ? "opacity-0 duration-500"
          : fadeIn
            ? "duration-400 opacity-100"
            : "duration-400 opacity-0"
      }`}
      onClick={dismiss}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " " || e.key === "Escape") dismiss();
      }}
    >
      {/* Background — warm gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-background-secondary" />

      {/* Content — photo-dominant layout, pushed slightly above center */}
      <div className="relative flex flex-col items-center px-6 text-center" style={{ marginTop: "-5vh" }}>
        {/* Photo — DOMINANT: 480px desktop, 320px mobile */}
        <div
          className={`overflow-hidden rounded-2xl shadow-xl transition-transform ease-out ${
            fadeOut
              ? "scale-95 duration-500"
              : fadeIn
                ? "scale-100 duration-700"
                : "scale-90 duration-700"
          }`}
          style={{ borderRadius: "16px" }}
        >
          {hasPhoto ? (
            <img
              src={selectedChild.photo_url!}
              alt={selectedChild.name}
              className="h-[320px] w-auto max-w-[90vw] object-cover sm:h-[400px] md:h-[480px]"
              style={{ minWidth: "280px" }}
            />
          ) : (
            <div
              className="flex items-center justify-center bg-scheduler/10"
              style={{ width: "320px", height: "320px" }}
            >
              <span className="text-7xl font-semibold text-scheduler sm:text-8xl md:text-9xl">
                {selectedChild.name.charAt(0)}
              </span>
            </div>
          )}
        </div>

        {/* 32px gap between photo and greeting */}
        <div style={{ height: "32px" }} />

        {/* Greeting line — 28-32px, weight 400, sentence case */}
        <p
          className={`font-serif-display mb-3 text-[28px] font-normal tracking-tight text-foreground transition-all ease-out sm:text-[30px] md:text-[32px] ${
            fadeOut
              ? "translate-y-2 opacity-0 duration-500"
              : fadeIn
                ? "translate-y-0 opacity-100 delay-200 duration-700"
                : "translate-y-4 opacity-0 duration-700"
          }`}
        >
          {greeting}
        </p>

        {/* Child name + age — tertiary, 16px, muted */}
        <p
          className={`text-base font-normal text-muted-foreground transition-all ease-out ${
            fadeOut
              ? "translate-y-2 opacity-0 duration-500"
              : fadeIn
                ? "delay-400 translate-y-0 opacity-100 duration-700"
                : "translate-y-4 opacity-0 duration-700"
          }`}
        >
          {selectedChild.name}, {ageDisplay}
        </p>
      </div>

      {/* Progress bar — 2px, full-width, bottom of screen */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-transparent">
        <div
          className={`h-full bg-development transition-all ease-linear ${
            progressActive ? "w-full" : "w-0"
          }`}
          style={{
            transitionDuration: progressActive ? "7000ms" : "0ms",
          }}
        />
      </div>
    </div>
  );
}
