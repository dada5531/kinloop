"use client";

import { useState, useEffect, useCallback } from "react";

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

/**
 * Hook to fetch and manage children from the API.
 * Provides child list, selected child state, and selection handler.
 */
export function useChildren() {
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChildren = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/children");
      if (!res.ok) throw new Error("Failed to fetch children");
      const data = await res.json();
      setChildren(data);

      // Auto-select first child if none selected
      if (data.length > 0 && !selectedChildId) {
        setSelectedChildId(data[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [selectedChildId]);

  useEffect(() => {
    fetchChildren();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const selectedChild = children.find((c) => c.id === selectedChildId) || null;

  // Compute age display
  const getAgeDisplay = (dob: string): string => {
    const now = new Date();
    const dobDate = new Date(dob);
    const ageMonths =
      (now.getFullYear() - dobDate.getFullYear()) * 12 + (now.getMonth() - dobDate.getMonth());
    const years = Math.floor(ageMonths / 12);
    const months = ageMonths % 12;
    return `${years}y ${months}mo`;
  };

  return {
    children,
    selectedChild,
    selectedChildId,
    setSelectedChildId,
    isLoading,
    error,
    refetch: fetchChildren,
    getAgeDisplay,
  };
}
