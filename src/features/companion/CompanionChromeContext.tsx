"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

type CompanionChromeContextValue = {
  modalActive: boolean;
  registerModal: () => () => void;
};

const CompanionChromeContext = createContext<CompanionChromeContextValue>({
  modalActive: false,
  registerModal: () => () => undefined
});

export function CompanionChromeProvider({ children }: { children: ReactNode }) {
  const [modalCount, setModalCount] = useState(0);

  const registerModal = useCallback(() => {
    setModalCount((count) => count + 1);
    return () => setModalCount((count) => Math.max(0, count - 1));
  }, []);

  const modalActive = modalCount > 0;

  useEffect(() => {
    if (!modalActive) return;
    const previousOverflow = document.body.style.overflow;
    const previousTouchAction = document.body.style.touchAction;
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";
    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.touchAction = previousTouchAction;
    };
  }, [modalActive]);

  const value = useMemo(() => ({ modalActive, registerModal }), [modalActive, registerModal]);

  return <CompanionChromeContext.Provider value={value}>{children}</CompanionChromeContext.Provider>;
}

export function useCompanionChrome() {
  return useContext(CompanionChromeContext);
}

export function useCompanionModal(open: boolean) {
  const { registerModal } = useCompanionChrome();

  useEffect(() => {
    if (!open) return;
    return registerModal();
  }, [open, registerModal]);
}
