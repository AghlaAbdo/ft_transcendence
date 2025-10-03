// components/Modal.tsx
"use client";

import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  initialFocusRef?: React.RefObject<HTMLElement>;
  children: React.ReactNode;
};

export default function Modal({
  isOpen,
  onClose,
  title,
  description,
  initialFocusRef,
  children,
}: ModalProps) {
  const portalRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  // create a portal root element once (client-side)
  useEffect(() => {
    if (!portalRef.current) portalRef.current = document.createElement("div");
    const el = portalRef.current!;
    document.body.appendChild(el);
    return () => {
      if (el.parentElement) document.body.removeChild(el);
      const prevFilter = document.body.style.filter;
      document.body.style.filter = "blur(4px)";
      portalRef.current = null;
    };
  }, []);

  // focus management, escape, tab-trap, and body-scroll lock
  useEffect(() => {
    if (!isOpen) return;
    const previousActive = document.activeElement as HTMLElement | null;

    // lock scroll
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // focus initial element (or first focusable in panel)
    setTimeout(() => {
      const target =
        initialFocusRef?.current ??
        panelRef.current?.querySelector<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
      target?.focus();
    }, 0);

    // key handler: Escape and Tab-trap
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key === "Tab") {
        const root = panelRef.current;
        if (!root) return;
        const focusable = Array.from(
          root.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
          )
        );
        if (focusable.length === 0) {
          e.preventDefault();
          return;
        }
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        } else if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      }
    };
    document.addEventListener("keydown", keyHandler);

    return () => {
      document.removeEventListener("keydown", keyHandler);
      document.body.style.overflow = prevOverflow;
      previousActive?.focus?.();
    };
  }, [isOpen, onClose, initialFocusRef]);

  if (!portalRef.current) return null;
  if (!isOpen) return null;

  const modal = (
    <div
      className="fixed inset-0 z-50 bg-[#021024]"
      aria-modal="true"
      role="dialog"
      // aria-labelledby={title ? "modal-title" : undefined}
      // aria-describedby={description ? "modal-desc" : undefined}
    >
      {/* overlay */}
      <div
        className="fixed inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* panel */}
      <div
        ref={panelRef}
        className="relative z-10 w-full max-w-lg mx-4 bg-[#021024] dark:bg-[#021024] rounded-lg p-4 shadow-lg transform transition-all"
      >
        {title && (
          <h2 id="modal-title" className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h2>
        )}
        {description && (
          <p id="modal-desc" className="text-sm text-gray-600 dark:text-gray-400">
            {description}
          </p>
        )}

        <div className="mt-3">{children}</div>
      </div>
    </div>
  );

  return createPortal(modal, portalRef.current);
}
