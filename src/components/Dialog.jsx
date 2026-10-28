import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export default function Dialog({ children, title, close, drawer = false }) {
  const dialog = useRef(null);
  useEffect(() => {
    const previous = document.activeElement;
    const element = dialog.current;
    element.showModal();
    return () => { element.close(); previous?.focus(); };
  }, []);
  return <dialog ref={dialog} className={drawer ? 'detail-drawer' : 'review-dialog'} aria-label={title} onCancel={event => { event.preventDefault(); close(); }} onClick={event => { if (event.target === dialog.current) close(); }}><div className="dialog-content"><button className="modal-close icon-button" aria-label="Close panel" onClick={close}><X size={20} /></button>{children}</div></dialog>;
}
