import dayjs from 'dayjs';
import { useRef, useState, type RefObject } from 'react';
import { useInterval } from 'usehooks-ts';
import { Terminal as TerminalIcon } from 'pixelarticons/react';
import type { IconComponent } from '../windows/registry';

export interface Task {
  id: string;
  title: string;
  Icon: IconComponent;
  active: boolean;
}

interface Props {
  tasks: Task[];
  onTaskClick: (id: string) => void;
  startOpen: boolean;
  onStartClick: () => void;
  startButtonRef: RefObject<HTMLButtonElement | null>;
  onClockSpam: () => void;
}

const CLOCK_CLICKS = 5;
const CLOCK_CLICK_GAP_MS = 1500;

function Clock({ onSpam }: { onSpam: () => void }) {
  const [now, setNow] = useState(() => new Date());
  const clicks = useRef({ count: 0, last: 0 });

  useInterval(() => setNow(new Date()), 5000);

  const time = dayjs(now).format('h:mm A');
  const date = dayjs(now).format('dddd, MMMM D, YYYY');

  return (
    <button
      type="button"
      className="taskbar-clock"
      title={date}
      aria-label={`${time}, ${date}`}
      onClick={() => {
        const t = Date.now();
        const c = clicks.current;
        c.count = t - c.last < CLOCK_CLICK_GAP_MS ? c.count + 1 : 1;
        c.last = t;
        if (c.count >= CLOCK_CLICKS) {
          c.count = 0;
          onSpam();
        }
      }}
    >
      <time dateTime={now.toISOString()}>{time}</time>
    </button>
  );
}

export default function Taskbar({ tasks, onTaskClick, startOpen, onStartClick, startButtonRef, onClockSpam }: Props) {
  return (
    <nav className="taskbar" aria-label="Taskbar">
      <button
        ref={startButtonRef}
        type="button"
        className={`start-button${startOpen ? ' pressed' : ''}`}
        aria-haspopup="menu"
        aria-expanded={startOpen}
        onClick={onStartClick}
      >
        <TerminalIcon width={16} height={16} />
        <span>Start</span>
      </button>
      <ul className="taskbar-tasks">
        {tasks.map(({ id, title, Icon, active }) => (
          <li key={id}>
            <button
              type="button"
              className={`taskbar-task${active ? ' pressed' : ''}`}
              aria-pressed={active}
              title={title}
              onClick={() => onTaskClick(id)}
            >
              <Icon width={16} height={16} />
              <span>{title}</span>
            </button>
          </li>
        ))}
      </ul>
      <div className="taskbar-tray">
        <Clock onSpam={onClockSpam} />
      </div>
    </nav>
  );
}
