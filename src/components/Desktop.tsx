import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type MouseEvent, type RefObject } from 'react';
import { useEventListener, useResizeObserver } from 'usehooks-ts';
import { useDialogs } from '../hooks/useDialogs';
import { useWindowManager } from '../hooks/useWindowManager';
import { DESKTOP_ICONS, MENU_ITEMS, WINDOWS, setHash, windowFromHash, type WindowId } from '../windows/registry';
import DesktopIcon from './DesktopIcon';
import StartMenu from './StartMenu';
import Taskbar from './Taskbar';
import Window, { type Bounds } from './Window';
import { clockSpamDialog, desktopSpamDialog } from './easterEggs';

const DESKTOP_DOUBLE_CLICKS = 10;

interface Props {
  initialWindow: WindowId | null;
  onShutDown: () => void;
}

export default function Desktop({ initialWindow, onShutDown }: Props) {
  const initial: WindowId[] = initialWindow && initialWindow !== 'home' ? ['home', initialWindow] : ['home'];
  const wm = useWindowManager(initial);
  const { open, focus, minimize } = wm;
  const showDialog = useDialogs();

  const areaRef = useRef<HTMLDivElement>(null);
  const iconsRef = useRef<HTMLUListElement>(null);
  const startButtonRef = useRef<HTMLButtonElement>(null);
  const [selectedIcon, setSelectedIcon] = useState<WindowId | null>(null);
  const [startOpen, setStartOpen] = useState(false);
  const emptyDoubleClicks = useRef(0);

  const size = useResizeObserver({ ref: areaRef as RefObject<HTMLDivElement>, box: 'border-box' });
  const bounds: Bounds = { w: Math.floor(size.width ?? 0), h: Math.floor(size.height ?? 0) };
  const area = areaRef.current;
  const scale = area && area.offsetWidth ? area.getBoundingClientRect().width / area.offsetWidth : 1;

  useEffect(() => {
    if (wm.focused) setHash(wm.focused);
    else if (wm.windows.length === 0) setHash(null);
  }, [wm.focused, wm.windows.length]);

  useEventListener('hashchange', () => {
    const id = windowFromHash(window.location.hash);
    if (id) open(id);
  });

  useEffect(() => {
    if (!wm.focused && document.activeElement === document.body) {
      iconsRef.current?.querySelector('button')?.focus();
    }
  }, [wm.focused]);

  const closeStart = useCallback((restoreFocus: boolean) => {
    setStartOpen(false);
    if (restoreFocus) startButtonRef.current?.focus();
  }, []);

  const onTaskClick = (id: string) => {
    const win = wm.windows.find((w) => w.id === id);
    if (!win) return;
    if (wm.focused === win.id && !win.minimized) minimize(win.id);
    else focus(win.id);
  };

  const isEmptyDesktop = (e: MouseEvent) => e.target === e.currentTarget || e.target === iconsRef.current;

  const onIconsKeyDown = (e: KeyboardEvent<HTMLUListElement>) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    const list = Array.from(e.currentTarget.querySelectorAll('button'));
    const i = list.indexOf(document.activeElement as HTMLButtonElement);
    e.preventDefault();
    list[(i + (e.key === 'ArrowDown' ? 1 : -1) + list.length) % list.length]?.focus();
  };

  return (
    <div className="desktop">
      <div
        className="desktop-area"
        ref={areaRef}
        onPointerDown={(e) => {
          if (isEmptyDesktop(e)) setSelectedIcon(null);
        }}
        onDoubleClick={(e) => {
          if (!isEmptyDesktop(e)) return;
          emptyDoubleClicks.current += 1;
          if (emptyDoubleClicks.current >= DESKTOP_DOUBLE_CLICKS) {
            emptyDoubleClicks.current = 0;
            showDialog(desktopSpamDialog());
          }
        }}
      >
        <ul className="desktop-icons" ref={iconsRef} aria-label="Desktop" onKeyDown={onIconsKeyDown}>
          {DESKTOP_ICONS.map((id) => (
            <DesktopIcon
              key={id}
              label={WINDOWS[id].label}
              Icon={WINDOWS[id].Icon}
              selected={selectedIcon === id}
              onSelect={() => setSelectedIcon(id)}
              onOpen={() => open(id)}
            />
          ))}
        </ul>
        {bounds.w > 0 &&
          wm.windows.map((win) => (
            <Window key={win.id} win={win} bounds={bounds} scale={scale} focused={wm.focused === win.id} actions={wm} />
          ))}
      </div>

      {startOpen && (
        <StartMenu
          items={MENU_ITEMS.map((id) => ({ id, label: WINDOWS[id].label, Icon: WINDOWS[id].Icon }))}
          anchorRef={startButtonRef}
          onClose={closeStart}
          onSelect={(id) => {
            setStartOpen(false);
            open(id as WindowId);
          }}
          onShutDown={() => {
            setStartOpen(false);
            onShutDown();
          }}
        />
      )}

      <Taskbar
        tasks={wm.windows.map((w) => ({
          id: w.id,
          title: WINDOWS[w.id].title,
          Icon: WINDOWS[w.id].Icon,
          active: wm.focused === w.id,
        }))}
        onTaskClick={onTaskClick}
        startOpen={startOpen}
        onStartClick={() => setStartOpen((o) => !o)}
        startButtonRef={startButtonRef}
        onClockSpam={() => showDialog(clockSpamDialog())}
      />
    </div>
  );
}
