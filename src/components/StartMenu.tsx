import { useEffect, useRef, type KeyboardEvent, type RefObject } from 'react';
import { useOnClickOutside } from 'usehooks-ts';
import { Power as PowerIcon } from 'pixelarticons/react';
import type { IconComponent } from '../windows/registry';

export interface StartMenuItem {
  id: string;
  label: string;
  Icon: IconComponent;
}

interface Props {
  items: StartMenuItem[];
  onSelect: (id: string) => void;
  onShutDown: () => void;
  onClose: (restoreFocus: boolean) => void;
  anchorRef: RefObject<HTMLElement | null>;
}

export default function StartMenu({ items, onSelect, onShutDown, onClose, anchorRef }: Props) {
  const menuRef = useRef<HTMLDivElement>(null);

  const buttons = () => Array.from(menuRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]') ?? []);

  useEffect(() => {
    buttons()[0]?.focus();
  }, []);

  useOnClickOutside([menuRef, anchorRef] as RefObject<HTMLElement>[], () => onClose(false));

  const onKeyDown = (e: KeyboardEvent) => {
    const list = buttons();
    const i = list.indexOf(document.activeElement as HTMLButtonElement);
    const go = (n: number) => {
      e.preventDefault();
      list[(n + list.length) % list.length]?.focus();
    };
    switch (e.key) {
      case 'ArrowDown':
        return go(i + 1);
      case 'ArrowUp':
        return go(i - 1);
      case 'Home':
        return go(0);
      case 'End':
        return go(list.length - 1);
      case 'Escape':
        e.preventDefault();
        e.stopPropagation();
        return onClose(true);
      case 'Tab':
        return onClose(false);
    }
  };

  return (
    <div className="start-menu" ref={menuRef} onKeyDown={onKeyDown}>
      <div className="start-menu-banner" aria-hidden="true">
        <span>
          CRHS <b>OS</b>
        </span>
      </div>
      <ul className="start-menu-items" role="menu" aria-label="Start">
        {items.map(({ id, label, Icon }) => (
          <li key={id} role="none">
            <button type="button" role="menuitem" onClick={() => onSelect(id)}>
              <Icon width={32} height={32} />
              <span>{label}</span>
            </button>
          </li>
        ))}
        <li role="separator" className="start-menu-separator" />
        <li role="none">
          <button type="button" role="menuitem" onClick={onShutDown}>
            <PowerIcon width={32} height={32} />
            <span>Shut Down...</span>
          </button>
        </li>
      </ul>
    </div>
  );
}
