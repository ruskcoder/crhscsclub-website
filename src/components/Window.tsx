import { Suspense, useEffect, useId, useRef } from 'react';
import { Rnd } from 'react-rnd';
import { MIN_HEIGHT, MIN_WIDTH, type WindowActions, type WindowState } from '../hooks/useWindowManager';
import { WINDOWS } from '../windows/registry';

export interface Bounds {
  w: number;
  h: number;
}

interface Props {
  win: WindowState;
  bounds: Bounds;
  scale: number;
  focused: boolean;
  actions: WindowActions;
}

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(n, max));

function fit(win: WindowState, bounds: Bounds) {
  if (win.maximized) return { x: 0, y: 0, w: bounds.w, h: bounds.h };
  const w = Math.min(win.w, bounds.w);
  const h = Math.min(win.h, bounds.h);
  return { x: clamp(win.x, 0, bounds.w - w), y: clamp(win.y, 0, bounds.h - h), w, h };
}

export default function Window({ win, bounds, scale, focused, actions }: Props) {
  const def = WINDOWS[win.id];
  const { Icon, Component } = def;
  const titleId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const rect = fit(win, bounds);

  useEffect(() => {
    const root = rootRef.current;
    if (focused && !win.minimized && root && !root.contains(document.activeElement)) {
      root.focus({ preventScroll: true });
    }
  }, [focused, win.minimized]);

  return (
    <Rnd
      bounds="parent"
      scale={scale}
      position={{ x: rect.x, y: rect.y }}
      size={{ width: rect.w, height: rect.h }}
      minWidth={Math.min(MIN_WIDTH, bounds.w)}
      minHeight={Math.min(MIN_HEIGHT, bounds.h)}
      dragHandleClassName="title-bar"
      cancel=".title-bar-controls"
      disableDragging={win.maximized}
      enableResizing={!win.maximized}
      resizeHandleComponent={{ bottomRight: <div className="resize-grip" aria-hidden="true" /> }}
      resizeHandleStyles={{ bottomRight: { right: 0, bottom: 0, width: 18, height: 18 } }}
      style={{ zIndex: win.z, display: win.minimized ? 'none' : undefined }}
      onDragStop={(_, d) => actions.move(win.id, d.x, d.y)}
      onResizeStop={(_, __, el, ___, pos) => {
        actions.resize(win.id, el.offsetWidth, el.offsetHeight);
        actions.move(win.id, pos.x, pos.y);
      }}
    >
      <div
        ref={rootRef}
        className="window app-window"
        role="dialog"
        aria-labelledby={titleId}
        tabIndex={-1}
        onPointerDownCapture={() => actions.focus(win.id)}
        onFocusCapture={() => {
          if (!focused) actions.focus(win.id);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Escape' && !e.defaultPrevented) {
            e.preventDefault();
            actions.close(win.id);
          }
        }}
      >
        <div
          className={`title-bar${focused ? '' : ' inactive'}`}
          onDoubleClick={(e) => {
            if (!(e.target as HTMLElement).closest('button')) actions.toggleMaximize(win.id);
          }}
        >
          <div className="title-bar-text" id={titleId}>
            <Icon width={16} height={16} aria-hidden="true" />
            <span>{def.title}</span>
          </div>
          <div className="title-bar-controls">
            <button aria-label="Minimize" onClick={() => actions.minimize(win.id)} />
            <button aria-label={win.maximized ? 'Restore' : 'Maximize'} onClick={() => actions.toggleMaximize(win.id)} />
            <button aria-label="Close" onClick={() => actions.close(win.id)} />
          </div>
        </div>
        <div className="app-window-body">
          <Suspense fallback={<p className="window-loading">Loading...</p>}>
            <Component />
          </Suspense>
        </div>
      </div>
    </Rnd>
  );
}
