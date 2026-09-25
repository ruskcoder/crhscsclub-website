import { useCallback, useMemo, useReducer } from 'react';
import { WINDOWS, type WindowId } from '../windows/registry';

export interface WindowState {
  id: WindowId;
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
  minimized: boolean;
  maximized: boolean;
}

interface State {
  windows: WindowState[];
  focused: WindowId | null;
  zTop: number;
}

type Action =
  | { type: 'open'; id: WindowId }
  | { type: 'close'; id: WindowId }
  | { type: 'focus'; id: WindowId }
  | { type: 'minimize'; id: WindowId }
  | { type: 'toggleMaximize'; id: WindowId }
  | { type: 'move'; id: WindowId; x: number; y: number }
  | { type: 'resize'; id: WindowId; w: number; h: number };

export const MIN_WIDTH = 220;
export const MIN_HEIGHT = 140;

const CASCADE_X = 96;
const CASCADE_Y = 12;
const CASCADE_STEP = 24;

function topVisible(windows: WindowState[]): WindowId | null {
  let top: WindowState | null = null;
  for (const w of windows) {
    if (!w.minimized && (!top || w.z > top.z)) top = w;
  }
  return top ? top.id : null;
}

function raise(state: State, id: WindowId, patch: Partial<WindowState> = {}): State {
  const z = state.zTop + 1;
  return {
    windows: state.windows.map((w) => (w.id === id ? { ...w, ...patch, z } : w)),
    focused: id,
    zTop: z,
  };
}

function update(state: State, id: WindowId, patch: Partial<WindowState>): State {
  return { ...state, windows: state.windows.map((w) => (w.id === id ? { ...w, ...patch } : w)) };
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'open': {
      if (state.windows.some((w) => w.id === action.id)) {
        return raise(state, action.id, { minimized: false });
      }
      const def = WINDOWS[action.id];
      const n = state.windows.length;
      const z = state.zTop + 1;
      const win: WindowState = {
        id: action.id,
        x: CASCADE_X + n * CASCADE_STEP,
        y: CASCADE_Y + n * CASCADE_STEP,
        w: def.width,
        h: def.height,
        z,
        minimized: false,
        maximized: false,
      };
      return { windows: [...state.windows, win], focused: action.id, zTop: z };
    }
    case 'close': {
      const windows = state.windows.filter((w) => w.id !== action.id);
      return { ...state, windows, focused: topVisible(windows) };
    }
    case 'focus':
      if (state.focused === action.id) return state;
      return raise(state, action.id, { minimized: false });
    case 'minimize': {
      const windows = state.windows.map((w) => (w.id === action.id ? { ...w, minimized: true } : w));
      return { ...state, windows, focused: topVisible(windows) };
    }
    case 'toggleMaximize': {
      const win = state.windows.find((w) => w.id === action.id);
      return win ? raise(state, action.id, { maximized: !win.maximized }) : state;
    }
    case 'move':
      return update(state, action.id, { x: action.x, y: action.y });
    case 'resize':
      return update(state, action.id, { w: action.w, h: action.h });
  }
}

export function useWindowManager(initial: WindowId[]) {
  const [state, dispatch] = useReducer(reducer, initial, (ids) =>
    ids.reduce<State>((s, id) => reducer(s, { type: 'open', id }), { windows: [], focused: null, zTop: 0 }),
  );

  const open = useCallback((id: WindowId) => dispatch({ type: 'open', id }), []);
  const close = useCallback((id: WindowId) => dispatch({ type: 'close', id }), []);
  const focus = useCallback((id: WindowId) => dispatch({ type: 'focus', id }), []);
  const minimize = useCallback((id: WindowId) => dispatch({ type: 'minimize', id }), []);
  const toggleMaximize = useCallback((id: WindowId) => dispatch({ type: 'toggleMaximize', id }), []);
  const move = useCallback((id: WindowId, x: number, y: number) => dispatch({ type: 'move', id, x, y }), []);
  const resize = useCallback((id: WindowId, w: number, h: number) => dispatch({ type: 'resize', id, w, h }), []);

  const actions = useMemo(
    () => ({ open, close, focus, minimize, toggleMaximize, move, resize }),
    [open, close, focus, minimize, toggleMaximize, move, resize],
  );

  return { ...state, ...actions };
}

export type WindowActions = Omit<ReturnType<typeof useWindowManager>, keyof State>;
