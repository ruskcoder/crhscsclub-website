import type { IconComponent } from '../windows/registry';

interface Props {
  label: string;
  Icon: IconComponent;
  selected: boolean;
  onSelect: () => void;
  onOpen: () => void;
}

export default function DesktopIcon({ label, Icon, selected, onSelect, onOpen }: Props) {
  return (
    <li>
      <button
        type="button"
        className={`desktop-icon${selected ? ' selected' : ''}`}
        aria-label={`${label} (double-click or press Enter to open)`}
        onClick={onSelect}
        onFocus={onSelect}
        onDoubleClick={onOpen}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            onOpen();
          }
        }}
      >
        <span className="desktop-icon-image">
          <Icon width={32} height={32} />
        </span>
        <span className="desktop-icon-label">{label}</span>
      </button>
    </li>
  );
}
