import { useState } from 'react';
import { emptyRecycleBinDialog, restoreDialog } from '../components/easterEggs';
import { File as FileIcon, Folder as FolderIcon, Trash as RecycleIcon } from 'pixelarticons/react';
import files from '../content/recycle-bin.json';
import site from '../content/site.json';
import { useDialogs } from '../hooks/useDialogs';

interface DeletedFile {
  name: string;
  from: string;
  size: string;
  folder?: boolean;
}

const FILES = files as DeletedFile[];

export default function RecycleBinWindow() {
  const showDialog = useDialogs();
  const [selected, setSelected] = useState<string | null>(null);
  const current = FILES.find((f) => f.name === selected);

  return (
    <div className="explorer">
      <div className="explorer-toolbar">
        <button type="button" onClick={() => showDialog(emptyRecycleBinDialog())}>
          Empty Recycle Bin
        </button>
        <button type="button" onClick={() => showDialog(restoreDialog())}>
          Restore All
        </button>
      </div>

      <div className="explorer-address">
        <span className="explorer-address-label">Address</span>
        <span className="explorer-address-field">
          <RecycleIcon width={16} height={16} />
          {site.recycleBin.address}
        </span>
      </div>

      <div className="explorer-list">
        <table>
          <caption className="visually-hidden">Deleted files</caption>
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Original Location</th>
              <th scope="col" className="explorer-numeric">
                Size
              </th>
            </tr>
          </thead>
          <tbody>
            {FILES.map((f) => {
              const isSelected = selected === f.name;
              return (
                <tr
                  key={f.name}
                  className={isSelected ? 'selected' : undefined}
                  tabIndex={0}
                  aria-selected={isSelected}
                  onClick={() => setSelected(f.name)}
                  onFocus={() => setSelected(f.name)}
                >
                  <td>
                    <span className="explorer-name">
                      {f.folder ? <FolderIcon width={16} height={16} /> : <FileIcon width={16} height={16} />}
                      {f.name}
                    </span>
                  </td>
                  <td className="explorer-role">{f.from}</td>
                  <td className="explorer-role explorer-numeric">{f.size}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="explorer-status" aria-live="polite">
        <span>{current ? `${current.name} (${current.size})` : `${FILES.length} object(s)`}</span>
        <span>{site.recycleBin.intro}</span>
      </div>
    </div>
  );
}
