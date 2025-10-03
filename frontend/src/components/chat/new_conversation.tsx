'use client';

import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

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

  // Portal setup (unchanged)
  useEffect(() => {
    if (!portalRef.current) portalRef.current = document.createElement('div');
    const el = portalRef.current!;
    document.body.appendChild(el);
    return () => {
      if (el.parentElement) document.body.removeChild(el);
      portalRef.current = null;
    };
  }, []);

  // Focus management & scroll lock (unchanged)
  useEffect(() => {
    if (!isOpen) return;
    const previousActive = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    setTimeout(() => {
      const target =
        initialFocusRef?.current ??
        panelRef.current?.querySelector<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
      target?.focus();
    }, 0);

    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    document.addEventListener('keydown', keyHandler);
    return () => {
      document.removeEventListener('keydown', keyHandler);
      document.body.style.overflow = prevOverflow;
      previousActive?.focus?.();
    };
  }, [isOpen, onClose, initialFocusRef]);

  if (!portalRef.current) return null;

  // Modal content wrapped in AnimatePresence for animation
  const modal = (
    <AnimatePresence>
      {isOpen && (
        <div
          className='fixed inset-0 z-50'
          aria-modal='true'
          role='dialog'
        >
          {/* overlay */}
          <motion.div
            className='fixed inset-0 backdrop-blur-sm bg-black/30'
            onClick={onClose}
            aria-hidden='true'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />

          {/* panel */}
          <motion.div
            ref={panelRef}
            className='absolute top-4 right-4 z-10 w-1/2 md:w-1/4 bg-[#021024] rounded-lg p-4 shadow-lg'
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
          >
            {title && (
              <h2 id='modal-title' className='text-lg font-semibold text-gray-50'>
                {title}
              </h2>
            )}
            {description && (
              <p id='modal-desc' className='text-sm text-gray-400'>
                {description}
              </p>
            )}
            <div className='mt-3'>{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(modal, portalRef.current);
}
