// src/hooks/ui/useSidebarToggle.ts
import { useState, useEffect } from 'react';

interface SidebarToggleState {
  isOpen: boolean;
  toggle: () => void;
  open: () => void;
  close: () => void;
}

export const useSidebarToggle = (defaultOpen = true): SidebarToggleState => {
  // Use localStorage to persist sidebar state across page refreshes
  const [isOpen, setIsOpen] = useState(() => {
    const saved = localStorage.getItem('sidebar-open');
    return saved !== null ? JSON.parse(saved) : defaultOpen;
  });

  // Persist state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('sidebar-open', JSON.stringify(isOpen));
  }, [isOpen]);

  const toggle = () => setIsOpen((prev: boolean) => !prev);
  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  return { isOpen, toggle, open, close };
};

export default useSidebarToggle;