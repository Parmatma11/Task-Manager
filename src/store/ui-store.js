import { create } from 'zustand';

export const useUiStore = create((set) => ({
  isSidebarCollapsed: false,
  isMobileNavOpen: false,
  activeView: 'list', // 'list' | 'kanban'
  isCreateTaskOpen: false,
  isEditTaskOpen: false,
  editingTaskId: null,

  toggleSidebar: () =>
    set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),

  setSidebarCollapsed: (collapsed) =>
    set({ isSidebarCollapsed: collapsed }),

  toggleMobileNav: () =>
    set((state) => ({ isMobileNavOpen: !state.isMobileNavOpen })),

  setMobileNavOpen: (open) =>
    set({ isMobileNavOpen: open }),

  setActiveView: (view) =>
    set({ activeView: view }),

  openCreateTask: () =>
    set({ isCreateTaskOpen: true }),

  closeCreateTask: () =>
    set({ isCreateTaskOpen: false }),

  openEditTask: (taskId) =>
    set({ isEditTaskOpen: true, editingTaskId: taskId }),

  closeEditTask: () =>
    set({ isEditTaskOpen: false, editingTaskId: null }),
}));
