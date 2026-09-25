import { lazy, type ComponentType, type LazyExoticComponent, type SVGProps } from 'react';
import { Calendar, Home, Trash, Users } from 'pixelarticons/react';

export type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

export type WindowId = 'home' | 'members' | 'events' | 'recycle';

export interface WindowDef {
  id: WindowId;
  title: string;
  label: string;
  hash: string;
  Icon: IconComponent;
  Component: LazyExoticComponent<ComponentType>;
  width: number;
  height: number;
}

export const WINDOWS: Record<WindowId, WindowDef> = {
  home: {
    id: 'home',
    title: 'Home - CRHS CS Club',
    label: 'Home',
    hash: 'home',
    Icon: Home,
    Component: lazy(() => import('./HomeWindow')),
    width: 640,
    height: 520,
  },
  members: {
    id: 'members',
    title: 'Members',
    label: 'Members',
    hash: 'members',
    Icon: Users,
    Component: lazy(() => import('./MembersWindow')),
    width: 600,
    height: 500,
  },
  events: {
    id: 'events',
    title: 'Events',
    label: 'Events',
    hash: 'events',
    Icon: Calendar,
    Component: lazy(() => import('./EventsWindow')),
    width: 620,
    height: 520,
  },
  recycle: {
    id: 'recycle',
    title: 'Recycle Bin',
    label: 'Recycle Bin',
    hash: 'recycle-bin',
    Icon: Trash,
    Component: lazy(() => import('./RecycleBinWindow')),
    width: 580,
    height: 460,
  },
};

export const DESKTOP_ICONS: WindowId[] = ['home', 'members', 'events', 'recycle'];
export const MENU_ITEMS: WindowId[] = ['home', 'members', 'events'];

export function windowFromHash(hash: string): WindowId | null {
  const key = hash.replace(/^#/, '').toLowerCase();
  const def = Object.values(WINDOWS).find((w) => w.hash === key);
  return def ? def.id : null;
}

export function setHash(id: WindowId | null) {
  const next = id ? `#${WINDOWS[id].hash}` : '';
  if (window.location.hash === next) return;
  history.replaceState(null, '', `${window.location.pathname}${window.location.search}${next}`);
}
