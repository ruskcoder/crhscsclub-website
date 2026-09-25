import frontMatter from 'front-matter';
import { marked } from 'marked';
import { Terminal as TerminalIcon } from 'pixelarticons/react';
import homeSource from '../content/home.md?raw';

const { attributes, body } = frontMatter<Record<string, unknown>>(homeSource);
const data: Record<string, string> = Object.fromEntries(
  Object.entries(attributes).map(([key, value]) => [key, String(value ?? '')]),
);

const bodyHtml = (marked.parse(body, { async: false }) as string).replace(
  /<a href="(https?:)/g,
  '<a target="_blank" rel="noopener noreferrer" href="$1',
);

const isUrl = (v = '') => /^https?:\/\//.test(v);

interface Contact {
  label: string;
  badge: string;
  value: string;
  href?: string;
}

function contacts(): Contact[] {
  const list: Contact[] = [];
  const { instagram = '', remind = '', discord = '', email = '' } = data;
  if (instagram) {
    const handle = instagram.replace(/^https?:\/\/(www\.)?instagram\.com\//, '').replace(/\/$/, '');
    list.push({
      label: 'Instagram',
      badge: 'IG',
      value: isUrl(instagram) ? `@${handle}` : instagram,
      href: isUrl(instagram)
        ? instagram
        : instagram.startsWith('@')
          ? `https://instagram.com/${instagram.slice(1)}`
          : undefined,
    });
  }
  if (remind) {
    list.push({
      label: 'Remind',
      badge: 'R',
      value: `Class code: ${remind}`,
      href: `https://www.remind.com/join/${encodeURIComponent(remind)}`,
    });
  }
  if (discord) {
    list.push({
      label: 'Discord',
      badge: 'DC',
      value: isUrl(discord) ? 'Join the server' : discord,
      href: isUrl(discord) ? discord : undefined,
    });
  }
  if (email) {
    list.push({
      label: 'Email',
      badge: '@',
      value: email,
      href: /^[^\s@[\]]+@[^\s@]+$/.test(email) ? `mailto:${email}` : undefined,
    });
  }
  return list;
}

const FACTS = [
  { label: 'Meetings', value: data.meeting },
  { label: 'Room', value: data.room },
  { label: 'Sponsor', value: data.sponsor },
].filter((f) => f.value);

const CONTACTS = contacts();

const go = (hash: string) => () => {
  window.location.hash = hash;
};

export default function HomeWindow() {
  return (
    <div className="vpage">
      <header className="vpage-header">
        <TerminalIcon width={32} height={32} />
        <div>
          <h1>{data.title ?? 'CRHS Computer Science Club'}</h1>
          {data.tagline && <p>{data.tagline}</p>}
        </div>
      </header>

      <div className="vpage-actions">
        <button type="button" onClick={go('events')}>
          See Events
        </button>
        <button type="button" onClick={go('members')}>
          Meet the Officers
        </button>
      </div>

      {FACTS.length > 0 && (
        <fieldset>
          <legend>Club Info</legend>
          <dl className="vfacts">
            {FACTS.map((f) => (
              <div key={f.label} style={{ display: 'contents' }}>
                <dt>{f.label}:</dt>
                <dd>{f.value}</dd>
              </div>
            ))}
          </dl>
        </fieldset>
      )}

      <article className="vdoc" dangerouslySetInnerHTML={{ __html: bodyHtml }} />

      {CONTACTS.length > 0 && (
        <fieldset>
          <legend>Contact</legend>
          <ul className="vcontacts">
            {CONTACTS.map((c) => (
              <li key={c.label}>
                <span className="vcontact-badge" aria-hidden="true">
                  {c.badge}
                </span>
                <span className="vcontact-label">{c.label}:</span>
                {c.href ? (
                  <a href={c.href} target={isUrl(c.href) ? '_blank' : undefined} rel="noopener noreferrer">
                    {c.value}
                  </a>
                ) : (
                  <span>{c.value}</span>
                )}
              </li>
            ))}
          </ul>
        </fieldset>
      )}
    </div>
  );
}
