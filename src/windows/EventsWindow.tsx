import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { useState } from 'react';
import { Calendar as EventsIcon } from 'pixelarticons/react';
import eventsData from '../content/events.json';
import site from '../content/site.json';

interface ClubEvent {
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
}

const events = eventsData as ClubEvent[];

dayjs.extend(customParseFormat);

const parse = (e: ClubEvent) => dayjs(e.date, 'YYYY-MM-DD', true);
const isDated = (e: ClubEvent) => parse(e).isValid();
const formatDate = (e: ClubEvent) => (isDated(e) ? parse(e).format('ddd, MMM D, YYYY') : e.date || 'TBA');

const keyOf = (e: ClubEvent) => `${e.date}-${e.title}`;

interface GroupProps {
  label: string;
  list: ClubEvent[];
  empty?: string;
  selected: string | null;
  onSelect: (key: string) => void;
}

function Group({ label, list, empty, selected, onSelect }: GroupProps) {
  if (list.length === 0 && !empty) return null;
  return (
    <tbody>
      <tr className="explorer-group">
        <th scope="rowgroup" colSpan={3}>
          {label} ({list.length})
        </th>
      </tr>
      {list.length === 0 && (
        <tr className="explorer-empty">
          <td colSpan={3}>{empty}</td>
        </tr>
      )}
      {list.map((e) => {
        const key = keyOf(e);
        const isSelected = selected === key;
        return (
          <tr
            key={key}
            className={isSelected ? 'selected' : undefined}
            tabIndex={0}
            aria-selected={isSelected}
            onClick={() => onSelect(key)}
            onFocus={() => onSelect(key)}
          >
            <td>
              {isDated(e) ? <time dateTime={e.date}>{formatDate(e)}</time> : <span>{formatDate(e)}</span>}
            </td>
            <td>
              <span className="explorer-name">
                <EventsIcon width={16} height={16} />
                {e.title}
              </span>
            </td>
            <td className="explorer-role">{e.location}</td>
          </tr>
        );
      })}
    </tbody>
  );
}

export default function EventsWindow() {
  const today = dayjs().startOf('day');
  const dated = events.filter(isDated);
  const upcoming = [
    ...dated.filter((e) => !parse(e).isBefore(today)).sort((a, b) => parse(a).diff(parse(b))),
    ...events.filter((e) => !isDated(e)),
  ];
  const past = dated.filter((e) => parse(e).isBefore(today)).sort((a, b) => parse(b).diff(parse(a)));
  const [selected, setSelected] = useState<string | null>(() => (upcoming[0] ? keyOf(upcoming[0]) : null));
  const current = events.find((e) => keyOf(e) === selected);

  return (
    <div className="explorer">
      <div className="explorer-address">
        <span className="explorer-address-label">Address</span>
        <span className="explorer-address-field">
          <EventsIcon width={16} height={16} />
          {site.events.address}
        </span>
      </div>

      <div className="explorer-list">
        <table>
          <caption className="visually-hidden">Club events</caption>
          <thead>
            <tr>
              <th scope="col">Date</th>
              <th scope="col">Event</th>
              <th scope="col">Location</th>
            </tr>
          </thead>
          <Group label="Upcoming" list={upcoming} empty={site.events.empty} selected={selected} onSelect={setSelected} />
          <Group label="Past" list={past} selected={selected} onSelect={setSelected} />
        </table>
      </div>

      <fieldset className="explorer-details" aria-live="polite">
        <legend>Details</legend>
        {current ? (
          <>
            <h3>{current.title}</h3>
            <p>{[formatDate(current), current.time, current.location].filter(Boolean).join(' · ')}</p>
            {current.description && <p>{current.description}</p>}
          </>
        ) : (
          <p>Select an event to see its details.</p>
        )}
      </fieldset>

      <div className="explorer-status">
        <span>{events.length} object(s)</span>
        <span>{site.events.intro}</span>
      </div>
    </div>
  );
}
