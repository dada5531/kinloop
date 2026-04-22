import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { trpc } from "@/lib/trpc";

type Child = {
  id: number;
  name: string;
  dob: string;
  gender: string | null;
  allergies: string[] | null;
  medications: string[] | null;
  schoolName: string | null;
  teacherName: string | null;
  pediatricianName: string | null;
  pediatricianPhone: string | null;
  notes: string | null;
};

type ChildContextType = {
  children: Child[];
  selectedChild: Child | null;
  selectChild: (id: number) => void;
  isLoading: boolean;
  refetch: () => void;
};

const ChildContext = createContext<ChildContextType>({
  children: [],
  selectedChild: null,
  selectChild: () => {},
  isLoading: true,
  refetch: () => {},
});

export function ChildProvider({ children: kids }: { children: ReactNode }) {
  const { data, isLoading, refetch } = trpc.children.list.useQuery(undefined, {
    retry: false,
    staleTime: 30_000,
  });
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const childList = (data ?? []) as Child[];

  useEffect(() => {
    if (childList.length > 0 && selectedId === null) {
      setSelectedId(childList[0].id);
    }
  }, [childList, selectedId]);

  const selectedChild = childList.find((c) => c.id === selectedId) ?? childList[0] ?? null;

  return (
    <ChildContext.Provider
      value={{
        children: childList,
        selectedChild,
        selectChild: setSelectedId,
        isLoading,
        refetch: () => { refetch(); },
      }}
    >
      {kids}
    </ChildContext.Provider>
  );
}

export function useChild() {
  return useContext(ChildContext);
}
