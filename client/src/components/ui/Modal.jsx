import React, { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';

export default function Modal({ open, onClose, children, title, size = 'md' }) {
  const sizesMap = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  const titleId = (title || '').replace(/\s+/g, '-').toLowerCase() || 'modal-title';
  const overlayRef = useRef(null);
  const contentRef = useRef(null);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') onClose();
    if (e.key !== 'Tab' || !contentRef.current) return;
    const focusable = contentRef.current.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, handleKeyDown]);

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => {
      contentRef.current?.querySelector('button, input, select, textarea, [tabindex]:not([tabindex="-1"])')?.focus();
    }, 50);
    return () => clearTimeout(timer);
  }, [open]);

  if (!open) return null;

  return createPortal(
    React.createElement('div', {
      className: 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50',
      onClick: (e) => { if (e.target === overlayRef.current) onClose(); },
      ref: overlayRef,
      role: 'dialog',
      'aria-modal': 'true',
      'aria-labelledby': titleId
    },
      React.createElement('div', {
        className: sizesMap[size] + ' w-full bg-card text-card-foreground max-h-[90vh] overflow-y-auto',
        onClick: e => e.stopPropagation(),
        ref: contentRef,
        style: { borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-md)' }
      },
        React.createElement('div', { className: 'flex items-center justify-between p-4 border-b border-border' },
          React.createElement('h3', { id: titleId, className: 'text-lg font-semibold' }, title),
          React.createElement('button', { onClick: onClose, 'aria-label': 'Cerrar', className: 'text-muted-foreground hover:text-foreground text-2xl' }, '\u00D7')
        ),
        React.createElement('div', { className: 'p-4' }, children)
      )
    ),
    document.body
  );
}
