"use client";

import { useState, useEffect, useCallback } from "react";

import { useChild } from "@/components/providers/ChildProvider";

/**
 * WelcomeScreen — Full-screen overlay shown once per session when
 * the user first lands on the dashboard. Displays the child's photo,
 * a time-of-day greeting ("Good morning, Jenn"), and the child's name + age.
 *
 * Dismisses on click/tap or automatically after 4 seconds.
 * Uses sessionStorage to show only once per browser session.
 */

function getTimeOfDayGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function WelcomeScreen() {
  const { selectedChild, getAgeDisplay, isLoading } = useChild();
  const [visible, setVisible] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  // Check if we should show the welcome screen
  useEffect(() => {
    if (isLoading) return;
    if (!selectedChild) return;

    // Only show once per session
    const key = "kinloop_welcome_shown";
    if (sessionStorage.getItem(key)) return;

    // Show the overlay
    setVisible(true);
    sessionStorage.setItem(key, "true");
  }, [isLoading, selectedChild]);

  // Auto-dismiss after 4 seconds
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => dismiss(), 4000);
    return () => clearTimeout(timer);
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  const dismiss = useCallback(() => {
    setFadeOut(true);
    setTimeout(() => setVisible(false), 500);
  }, []);

  if (!visible || !selectedChild) return null;

  const greeting = getTimeOfDayGreeting();
  const ageDisplay = getAgeDisplay(selectedChild.dob);
  const hasPhoto = !!selectedChild.photo_url;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center transition-opacity duration-500 ${
        fadeOut ? "opacity-0" : "opacity-100"
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

      {/* Content */}
      <div className="relative flex flex-col items-center px-6 text-center">
        {/* Photo or initial circle */}
        <div
          className={`mb-8 overflow-hidden rounded-3xl shadow-lg transition-transform duration-700 ${
            fadeOut ? "scale-95" : "scale-100"
          } ${hasPhoto ? "h-56 w-56 md:h-64 md:w-64" : "h-32 w-32"}`}
        >
          {hasPhoto ? (
            <img
              src={selectedChild.photo_url!}
              alt={selectedChild.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-scheduler/10">
              <span className="text-5xl font-semibold text-scheduler">
                {selectedChild.name.charAt(0)}
              </span>
            </div>
          )}
        </div>

        {/* Greeting */}
        <p className="mb-2 text-sm font-medium uppercase tracking-widest text-muted-foreground">
          {greeting}
        </p>

        {/* Child name — large */}
        <h1 className="mb-2 text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
          {selectedChild.name}
        </h1>

        {/* Age */}
        <p className="mb-8 text-base text-muted-foreground">{ageDisplay}</p>

        {/* Tap to continue hint */}
        <p className="animate-pulse text-xs text-muted-foreground/50">Tap anywhere to continue</p>
      </div>
    </div>
  );
}
