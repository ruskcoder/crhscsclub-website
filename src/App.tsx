import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useKonami } from 'react-konami-code';
import { useMediaQuery } from 'usehooks-ts';
import BootSequence from './components/BootSequence';
import MacFrame from './components/MacFrame';
import { konamiDialog } from './components/easterEggs';
import { DialogProvider, useDialogs } from './hooks/useDialogs';
import { useUiScale } from './hooks/useUiScale';
import { windowFromHash } from './windows/registry';

const loadDesktop = () => import('./components/Desktop');
const loadMobile = () => import('./components/MobileShell');
const loadHome = () => import('./windows/HomeWindow');
const Desktop = lazy(loadDesktop);
const MobileShell = lazy(loadMobile);
const BlueScreen = lazy(() => import('./components/BlueScreen'));

const KONAMI_EFFECT_MS = 5000;
const MOBILE_QUERY = '(max-width: 767px)';
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

type Phase = 'boot' | 'desktop' | 'bsod';

function Screen({ isMobile, onKonami }: { isMobile: boolean; onKonami: () => void }) {
  const reducedMotion = useMediaQuery(REDUCED_MOTION_QUERY);
  const [phase, setPhase] = useState<Phase>('boot');
  const showDialog = useDialogs();

  useKonami(() => {
    showDialog(konamiDialog());
    onKonami();
  });

  useEffect(() => {
    (isMobile ? loadMobile : loadDesktop)();
    loadHome();
  }, [isMobile]);

  const finishBoot = useCallback(() => setPhase('desktop'), []);
  const shutDown = useCallback(() => setPhase('bsod'), []);
  const reboot = useCallback(() => setPhase('boot'), []);

  if (phase === 'boot') {
    return <BootSequence reducedMotion={reducedMotion} onDone={finishBoot} />;
  }

  const Shell = isMobile ? MobileShell : Desktop;
  return (
    <Suspense fallback={<div className="screen-blank" />}>
      {phase === 'bsod' ? (
        <BlueScreen onDone={reboot} />
      ) : (
        <Shell initialWindow={windowFromHash(window.location.hash)} onShutDown={shutDown} />
      )}
    </Suspense>
  );
}

export default function App() {
  const isMobile = useMediaQuery(MOBILE_QUERY);
  const scale = useUiScale(!isMobile);
  const [konami, setKonami] = useState(false);
  const konamiTimer = useRef(0);

  const onKonami = useCallback(() => {
    setKonami(true);
    clearTimeout(konamiTimer.current);
    konamiTimer.current = window.setTimeout(() => setKonami(false), KONAMI_EFFECT_MS);
  }, []);

  const screen = (
    <div
      className={`screen-content${konami ? ' konami' : ''}${isMobile ? ' mobile-root' : ''}`}
      style={scale === 1 ? undefined : { zoom: scale }}
    >
      <DialogProvider>
        <Screen isMobile={isMobile} onKonami={onKonami} />
      </DialogProvider>
    </div>
  );

  return <MacFrame crt={!isMobile}>{screen}</MacFrame>;
}
