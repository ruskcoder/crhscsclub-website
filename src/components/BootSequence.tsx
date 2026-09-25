import { FitAddon } from '@xterm/addon-fit';
import { Terminal } from '@xterm/xterm';
import '@xterm/xterm/css/xterm.css';
import { useEffect, useRef, useState } from 'react';
import bootLog from '../content/boot-log.json';

type Line =
  | { kind: 'kernel'; time: string; text: string }
  | { kind: 'ok' | 'warn'; text: string }
  | { kind: 'plain'; text: string };

const BOOT_LOG = bootLog as Line[];

const GRAY = '\x1b[90m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

function toAnsi(line: Line) {
  switch (line.kind) {
    case 'kernel':
      return `${GRAY}[${line.time.padStart(12)}]${RESET} ${line.text}`;
    case 'ok':
      return `[${GREEN}  OK  ${RESET}] ${line.text}`;
    case 'warn':
      return `[${YELLOW} WARN ${RESET}] ${line.text}`;
    default:
      return line.text;
  }
}

const FLASH_MS = 150;
const HOLD_MS = 350;
const TOTAL_MS = 2000;
const LINE_MS = (TOTAL_MS - FLASH_MS - HOLD_MS) / BOOT_LOG.length;

interface Props {
  reducedMotion?: boolean;
  onDone: () => void;
}

export default function BootSequence({ reducedMotion, onDone }: Props) {
  const [flash, setFlash] = useState(!reducedMotion);
  const terminalRef = useRef<HTMLDivElement>(null);
  const done = useRef(false);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    const host = terminalRef.current;
    if (!host) return;

    const term = new Terminal({
      cursorBlink: !reducedMotion,
      disableStdin: true,
      convertEol: true,
      scrollback: 200,
      fontSize: 13,
      fontFamily: '"Cascadia Mono", Consolas, "DejaVu Sans Mono", "Liberation Mono", "Courier New", monospace',
      theme: { background: '#000000', foreground: '#bdbdbd', cursor: '#bdbdbd' },
    });
    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(host);
    fitAddon.fit();
    const onResize = () => fitAddon.fit();
    window.addEventListener('resize', onResize);

    const finish = () => {
      if (done.current) return;
      done.current = true;
      onDoneRef.current();
    };

    const timers: number[] = [];
    const at = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, ms));

    if (reducedMotion) {
      BOOT_LOG.forEach((line) => term.writeln(toAnsi(line)));
      at(400, finish);
    } else {
      at(FLASH_MS, () => setFlash(false));
      BOOT_LOG.forEach((line, i) => at(FLASH_MS + LINE_MS * (i + 1), () => term.writeln(toAnsi(line))));
      at(TOTAL_MS, finish);
    }

    const skip = (e: Event) => {
      if (e instanceof KeyboardEvent && (e.key === 'Tab' || e.repeat)) return;
      e.preventDefault();
      finish();
    };
    window.addEventListener('keydown', skip);
    window.addEventListener('pointerdown', skip);

    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('keydown', skip);
      window.removeEventListener('pointerdown', skip);
      term.dispose();
    };
  }, [reducedMotion]);

  return (
    <div className="boot" role="status" aria-label="Starting CRHS OS. Press any key to skip.">
      <div className="boot-terminal" ref={terminalRef} aria-hidden="true" />
      {flash && <div className="boot-flash" aria-hidden="true" style={{ animationDuration: `${FLASH_MS}ms` }} />}
      <p className="boot-skip" aria-hidden="true">
        Press any key to skip
      </p>
    </div>
  );
}
