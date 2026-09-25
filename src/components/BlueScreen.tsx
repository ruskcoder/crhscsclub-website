import { useEffect, useRef, useState } from 'react';
import { blueScreenText } from './easterEggs';

const AUTO_REBOOT_MS = 6000;

export default function BlueScreen({ onDone }: { onDone: () => void }) {
  const [rebooting, setRebooting] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    ref.current?.focus();
    let finished = false;
    let rebootTimer = 0;
    const reboot = () => {
      if (finished) return;
      finished = true;
      setRebooting(true);
      rebootTimer = window.setTimeout(() => onDoneRef.current(), 600);
    };
    const auto = window.setTimeout(reboot, AUTO_REBOOT_MS);
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') reboot();
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', reboot);
    return () => {
      clearTimeout(auto);
      clearTimeout(rebootTimer);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', reboot);
    };
  }, []);

  return (
    <div className="bsod" ref={ref} tabIndex={-1} role="alert">
      {rebooting ? (
        <p className="bsod-rebooting">Rebooting...</p>
      ) : (
        <div className="bsod-inner">
          <p className="bsod-heading">
            <span>{blueScreenText.heading}</span>
          </p>
          {blueScreenText.paragraphs.map((text, i) => (
            <p key={i}>{text}</p>
          ))}
          <p className="bsod-continue">
            {blueScreenText.prompt} <span className="bsod-cursor">_</span>
          </p>
        </div>
      )}
    </div>
  );
}
