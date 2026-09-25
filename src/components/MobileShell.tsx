import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useEventListener } from 'usehooks-ts';
import { useDialogs } from '../hooks/useDialogs';
import { MENU_ITEMS, WINDOWS, setHash, windowFromHash, type WindowId } from '../windows/registry';
import StartMenu from './StartMenu';
import Taskbar from './Taskbar';
import { clockSpamDialog } from './easterEggs';

interface Props {
  initialWindow: WindowId | null;
  onShutDown: () => void;
}

export default function MobileShell({ initialWindow, onShutDown }: Props) {
  const [current, setCurrent] = useState<WindowId>(initialWindow ?? 'home');
  const [startOpen, setStartOpen] = useState(false);
  const startButtonRef = useRef<HTMLButtonElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const showDialog = useDialogs();
  const def = WINDOWS[current];
  const { Icon, Component } = def;

  useEffect(() => {
    setHash(current);
  }, [current]);

  useEventListener('hashchange', () => {
    const id = windowFromHash(window.location.hash);
    if (id) setCurrent(id);
  });

  const closeStart = useCallback((restoreFocus: boolean) => {
    setStartOpen(false);
    if (restoreFocus) startButtonRef.current?.focus();
  }, []);

  const switchTo = (id: WindowId) => {
    setStartOpen(false);
    setCurrent(id);
    requestAnimationFrame(() => titleRef.current?.focus());
  };

  return (
    <div className="mobile-shell">
      <main className="window mobile-window" aria-labelledby="mobile-window-title">
        <div className="title-bar">
          <h1 className="title-bar-text" id="mobile-window-title" ref={titleRef} tabIndex={-1}>
            <Icon width={16} height={16} />
            <span>{def.title}</span>
          </h1>
        </div>
        <div className="app-window-body">
          <Suspense fallback={<p className="window-loading">Loading...</p>}>
            <Component key={current} />
          </Suspense>
        </div>
      </main>

      {startOpen && (
        <StartMenu
          items={MENU_ITEMS.map((id) => ({ id, label: WINDOWS[id].label, Icon: WINDOWS[id].Icon }))}
          anchorRef={startButtonRef}
          onClose={closeStart}
          onSelect={(id) => switchTo(id as WindowId)}
          onShutDown={() => {
            setStartOpen(false);
            onShutDown();
          }}
        />
      )}

      <Taskbar
        tasks={[{ id: current, title: def.label, Icon, active: true }]}
        onTaskClick={() => titleRef.current?.focus()}
        startOpen={startOpen}
        onStartClick={() => setStartOpen((o) => !o)}
        startButtonRef={startButtonRef}
        onClockSpam={() => showDialog(clockSpamDialog())}
      />
    </div>
  );
}
