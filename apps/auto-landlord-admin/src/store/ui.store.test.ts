import { describe, it, expect, beforeEach } from "vitest";
import { useUIStore } from "./ui.store";

describe("UI Store", () => {
  beforeEach(() => {
    // Reset store state before each test
    useUIStore.setState({ sidebarOpen: true });
  });

  it("starts with sidebar open", () => {
    const state = useUIStore.getState();
    expect(state.sidebarOpen).toBe(true);
  });

  it("toggles sidebar state", () => {
    const { toggleSidebar } = useUIStore.getState();

    toggleSidebar();
    expect(useUIStore.getState().sidebarOpen).toBe(false);

    toggleSidebar();
    expect(useUIStore.getState().sidebarOpen).toBe(true);
  });

  it("closes sidebar", () => {
    const { closeSidebar } = useUIStore.getState();

    closeSidebar();
    expect(useUIStore.getState().sidebarOpen).toBe(false);

    // Closing again should keep it closed
    closeSidebar();
    expect(useUIStore.getState().sidebarOpen).toBe(false);
  });
});

