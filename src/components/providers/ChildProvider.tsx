"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface ChildProfile {
  id: string;
  user_id: string;
  name: string;
  dob: string;
  photo_url: string | null;
  allergies: string[];
  notes: string | null;
  created_at: string;
  updated_at: string | null;
}

interface ChildContextType {
  children: ChildProfile[];
  selectedChild: ChildProfile | null;
  selectedChildId: string | null;
  setSelectedChildId: (id: string) => void;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  getAgeDisplay: (dob: string) => string;
}

const ChildContext = createContext<ChildContextType | null>(null);

export function ChildProvider({ children: childrenProp }: { children: React.ReactNode }) {
  const [childList, setChildList] = useState<ChildProfile[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChildren = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/children");
      if (!res.ok) throw new Error("Failed to fetch children");
      const data = await res.json();
      setChildList(data);

      // Auto-select first child if none selected
      if (data.length > 0 && !selectedChildId) {
        setSelectedChildId(data[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchChildren();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const selectedChild = childList.find((c) => c.id === selectedChildId) || null;

  const getAgeDisplay = (dob: string): string => {
    const now = new Date();
    const dobDate = new Date(dob);
    const ageMonths =
      (now.getFullYear() - dobDate.getFullYear()) * 12 + (now.getMonth() - dobDate.getMonth());
    const years = Math.floor(ageMonths / 12);
    const months = ageMonths % 12;
    return `${years}y ${months}mo`;
  };

  return (
    <ChildContext.Provider
      value={{
        children: childList,
        selectedChild,
        selectedChildId,
        setSelectedChildId,
        isLoading,
        error,
        refetch: fetchChildren,
        getAgeDisplay,
      }}
    >
      {childrenProp}
    </ChildContext.Provider>
  );
}

export function useChild() {
  const context = useContext(ChildContext);
  if (!context) {
    throw new Error("useChild must be used within a ChildProvider");
  }
  return context;
}
