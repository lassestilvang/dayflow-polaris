"use client";

import { create } from "zustand";

type DragItem =
  | { type: "task"; id: string }
  | { type: "event"; id: string };

type DropPreview = {
  start: string;
  end: string;
  calendarId: string;
};

type CalendarState = {
  activeWeekId: string | null;
  dragItem: DragItem | null;
  dropPreview: DropPreview | null;
  setActiveWeek: (weekId: string) => void;
  startDrag: (item: DragItem) => void;
  updateDropPreview: (preview: DropPreview | null) => void;
  endDrag: () => void;
};

export const useCalendarStore = create<CalendarState>((set, get) => ({
  activeWeekId: null,
  dragItem: null,
  dropPreview: null,
  setActiveWeek: (weekId) => {
    // Avoid unnecessary updates that can cause render loops
    if (get().activeWeekId !== weekId) {
      set({ activeWeekId: weekId });
    }
  },
  startDrag: (item) => set({ dragItem: item }),
  updateDropPreview: (preview) => set({ dropPreview: preview }),
  endDrag: () => set({ dragItem: null, dropPreview: null })
}));