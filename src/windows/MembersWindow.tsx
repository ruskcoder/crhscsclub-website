import { useState } from 'react';
import { Users as MembersIcon, Star as StarIcon, User as UserIcon } from 'pixelarticons/react';
import membersData from '../content/members.json';
import site from '../content/site.json';

interface Member {
  name: string;
  role: string;
  officer: boolean;
}

const members = membersData as Member[];
const officers = members.filter((m) => m.officer);
const regulars = members.filter((m) => !m.officer).sort((a, b) => a.name.localeCompare(b.name));

const keyOf = (m: Member) => `${m.name}-${m.role}`;

function Group({
  label,
  list,
  selected,
  onSelect,
}: {
  label: string;
  list: Member[];
  selected: string | null;
  onSelect: (key: string) => void;
}) {
  if (list.length === 0) return null;
  return (
    <tbody>
      <tr className="explorer-group">
        <th scope="rowgroup" colSpan={2}>
          {label} ({list.length})
        </th>
      </tr>
      {list.map((m) => {
        const key = keyOf(m);
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
              <span className="explorer-name">
                {m.officer ? <StarIcon width={16} height={16} /> : <UserIcon width={16} height={16} />}
                {m.name}
              </span>
            </td>
            <td className={m.officer ? 'explorer-role officer' : 'explorer-role'}>{m.role}</td>
          </tr>
        );
      })}
    </tbody>
  );
}

export default function MembersWindow() {
  const [selected, setSelected] = useState<string | null>(null);
  const current = members.find((m) => keyOf(m) === selected);

  return (
    <div className="explorer">
      <div className="explorer-address">
        <span className="explorer-address-label">Address</span>
        <span className="explorer-address-field">
          <MembersIcon width={16} height={16} />
          {site.members.address}
        </span>
      </div>

      <div className="explorer-list">
        <table>
          <caption className="visually-hidden">Club members, officers first</caption>
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Role</th>
            </tr>
          </thead>
          <Group label="Officers" list={officers} selected={selected} onSelect={setSelected} />
          <Group label="Members" list={regulars} selected={selected} onSelect={setSelected} />
        </table>
      </div>

      <div className="explorer-status" aria-live="polite">
        <span>{current ? `${current.name} - ${current.role}` : `${members.length} object(s)`}</span>
        <span>{officers.length} officer(s)</span>
      </div>
    </div>
  );
}
