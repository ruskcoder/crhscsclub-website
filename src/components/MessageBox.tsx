import { useEffect, useId, useRef, type ReactNode } from 'react';
import { Close as ErrorIcon, InfoBox as InfoIcon, WarningDiamond as WarningIcon } from 'pixelarticons/react';

export type MessageBoxIcon = 'error' | 'warning' | 'info';

const ICONS = { error: ErrorIcon, warning: WarningIcon, info: InfoIcon };

interface Props {
  title: string;
  message: ReactNode;
  icon?: MessageBoxIcon;
  buttons?: string[];
  offset: number;
  onClose: () => void;
}

export default function MessageBox({ title, message, icon = 'error', buttons = ['OK'], offset, onClose }: Props) {
  const titleId = useId();
  const bodyId = useId();
  const okRef = useRef<HTMLButtonElement>(null);
  const Icon = ICONS[icon];

  useEffect(() => {
    const previous = document.activeElement;
    okRef.current?.focus();
    return () => {
      if (previous instanceof HTMLElement && previous.isConnected) previous.focus({ preventScroll: true });
    };
  }, []);

  return (
    <div
      className="window message-box"
      role="alertdialog"
      aria-labelledby={titleId}
      aria-describedby={bodyId}
      style={{ marginLeft: offset * 16, marginTop: offset * 16 }}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          e.stopPropagation();
          onClose();
        }
      }}
    >
      <div className="title-bar">
        <div className="title-bar-text" id={titleId}>
          {title}
        </div>
        <div className="title-bar-controls">
          <button aria-label="Close" onClick={onClose} />
        </div>
      </div>
      <div className="window-body message-box-body">
        <div className="message-box-content">
          <Icon width={32} height={32} className={`message-box-icon ${icon}`} aria-hidden="true" />
          <div id={bodyId} className="message-box-text">
            {message}
          </div>
        </div>
        <div className="message-box-buttons">
          {buttons.map((label, i) => (
            <button key={label} ref={i === 0 ? okRef : undefined} onClick={onClose}>
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
