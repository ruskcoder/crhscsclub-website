import { useWindowSize } from 'usehooks-ts';

const MAX_SCALE = 1.5;
const MIN_WIDTH = 800;
const MIN_HEIGHT = 450;

export function useUiScale(enabled: boolean) {
  const { width, height } = useWindowSize();
  if (!enabled) return 1;
  const fit = Math.min(MAX_SCALE, width / MIN_WIDTH, height / MIN_HEIGHT);
  return Math.round(Math.max(1, fit) * 100) / 100;
}
