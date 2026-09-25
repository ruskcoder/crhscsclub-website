# CRHS Computer Science Club website

The club website looks like a Windows 95-style desktop on an old CRT screen. It's built with Vite, React, and TypeScript. There's no backend: all content lives in the `src/content/` files.

- **Desktop (768px and wider):** a full-screen desktop with a light CRT effect, draggable and resizable windows, a taskbar, and a Start menu.
- **Phones (under 768px):** the same Win95 look without the frame. One full-screen window at a time, switched from the Start menu.

## Setup (PowerShell)

You need [Node.js](https://nodejs.org/) 20 or newer.

```powershell
# Check Node is installed
node -v

# Install dependencies (from the project folder)
cd C:\path\to\crhscsclub-website
npm install

# Start the dev server, then open the URL it prints (usually http://localhost:5173)
npm run dev

# Build the production site into .\dist
npm run build

# Preview the production build locally
npm run preview
```

If PowerShell blocks `npm` with an execution policy error, run this once:

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

## Editing content

Everything is in `src/content/`. Save the file and the dev server reloads the page. After you push, Cloudflare Pages rebuilds the live site.

### Home: `src/content/home.md`

The block between the `---` lines at the top holds the club details shown at the top of the Home page:

```md
---
title: CRHS Computer Science Club
tagline: Cinco Ranch High School's Comp Sci Club. Learn, create, compete.
meeting: Tuesdays, 2:45 PM
room: 2225
sponsor: Mr. Porter
instagram: @cinco.cs.club
remind: cinco-cs
---
```

- `meeting`, `room`, and `sponsor` become the fact cards. Delete a line to hide its card.
- `instagram`, `remind`, `discord`, and `email` become contact cards. `instagram` takes a handle (`@name`) or a full URL, `remind` takes the class code, and `discord` takes an invite URL. Leave a line out to hide that card.

Everything below the block is regular Markdown, shown as the page's main text.

- Web links: `[Join form](https://forms.gle/...)` opens in a new tab.
- Window links: `[Events](#events)` opens the Events window. You can also use `#home`, `#members`, and `#recycle-bin`.

### Members: `src/content/members.json`

```json
[
  { "name": "Alex Rivera", "role": "President", "officer": true },
  { "name": "Chris Morgan", "role": "Member", "officer": false }
]
```

- Officers (`"officer": true`) are listed first, **in the order they appear in the file**, so put the president first.
- Everyone else is sorted alphabetically by name, so their order in the file doesn't matter.

### Events: `src/content/events.json`

```json
[
  {
    "title": "Intro to Git Workshop",
    "date": "2026-10-01",
    "time": "3:30 PM",
    "location": "Room 101",
    "description": "Learn commits, branches, and pull requests."
  }
]
```

- `date` must be `YYYY-MM-DD`, or `"TBA"` if it isn't set yet. TBA events show at the end of **Upcoming**.
- `time` and `location` can be left as `""` if unknown.
- Events dated today or later appear under **Upcoming** (soonest first). Older events move to **Past** (most recent first) automatically, based on the visitor's current date. There's no need to move them yourself.
- Click an event to see its time, location, and description in the Details box. The first upcoming event is selected by default.

### Everything else

| File | What it controls |
| --- | --- |
| `src/content/site.json` | Address bar paths on Members, Events, and Recycle Bin, the status bar text on Events and Recycle Bin, and the message shown when there are no upcoming events |
| `src/content/recycle-bin.json` | The joke files in the Recycle Bin (`name`, `from`, `size`, optional `"folder": true`) |
| `src/content/boot-log.json` | Boot screen lines. `kind` is `kernel` (needs a `time`), `ok`, `warn`, or `plain` |
| `src/content/easter-eggs.json` | Every popup's text (clock, desktop, Recycle Bin, Konami code) and the blue screen. `icon` is `error`, `warning`, or `info` |

The JSON files must stay valid JSON: double quotes everywhere and commas between items, but no comma after the last one. If `npm run build` fails after an edit, a missing or extra comma is the usual cause.

## Deploying to Cloudflare Pages

1. Push this repo to GitHub.
2. In the Cloudflare dashboard, go to **Workers & Pages > Create > Pages > Connect to Git** and pick the repo.
3. Use these build settings:
   - **Framework preset:** None (or Vite)
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Environment variable (optional):** `NODE_VERSION` = `20` or newer
4. Click **Save and Deploy**. Each later push to `main` redeploys the site.

To deploy from your computer instead, use Wrangler:

```powershell
npm run build
npx wrangler pages deploy dist --project-name crhscsclub-website
```

## How it works

```
src/
  components/   MacFrame, BootSequence, Desktop, Taskbar, StartMenu, Window,
                DesktopIcon, BlueScreen, MessageBox, MobileShell, easterEggs
  windows/      HomeWindow, MembersWindow, EventsWindow, RecycleBinWindow, registry
  content/      home.md, members.json, events.json, site.json,
                recycle-bin.json, boot-log.json, easter-eggs.json
  hooks/        useWindowManager, useDialogs, useUiScale
  styles/       base, mac, boot, desktop, windows, pages, mobile
  App.tsx
  main.tsx
```

### Libraries

| Library | Used for |
| --- | --- |
| [98.css](https://github.com/jdan/98.css) | Windows look: pixel font, bevels, title bars, buttons, group boxes, tables, scrollbars |
| [react-rnd](https://github.com/bokuweb/react-rnd) | Dragging and resizing windows |
| [@xterm/xterm](https://xtermjs.org/) + `@xterm/addon-fit` | The terminal on the boot screen |
| [pixelarticons](https://pixelarticons.com/) | All icons |
| [usehooks-ts](https://usehooks-ts.com/) | Media queries, window size, resize observer, click-outside, event listeners, clock interval |
| [react-konami-code](https://github.com/vmarchesin/react-konami-code) | Konami code detection |
| [front-matter](https://github.com/jxson/front-matter) | Reading the header block in `home.md` (it's YAML, so quote values that start with `@`) |
| [marked](https://marked.js.org/) | Turning `home.md` into HTML |
| [dayjs](https://day.js.org/) | Parsing, comparing, and formatting event dates and the clock |

98.css ships one CSS rule that Vite's minifier considers invalid. `css.lightningcss.errorRecovery` in `vite.config.ts` drops it, so the build shows a harmless warning about `@media (not(hover))`.

- **Adding a window:** create a component in `src/windows/` and add an entry to `WINDOWS` in `src/windows/registry.tsx`. Add its id to `DESKTOP_ICONS` or `MENU_ITEMS` to show it on the desktop or in the Start menu.
- **Boot sequence:** a Linux-style boot log from `src/content/boot-log.json`, always 2 seconds long. It runs on every page load. Click or press any key to skip. Visitors with "reduce motion" turned on see the full log at once for under half a second instead.
- **URL hash:** the focused window's id goes in the URL (`#members`, `#events`, and so on), so a shared link opens that window.
- **Keyboard:** Tab moves between desktop icons, taskbar buttons, and window contents. Arrow keys move between icons. Enter opens an icon. Escape closes the focused window or the Start menu.
- **Look:** 98.css as it ships, with no overrides to its components. Members, Events, and Recycle Bin are Explorer-style lists; Home is a document with group boxes. Layout styles are in `src/styles/`.

## Easter eggs

- Double-click the **Recycle Bin**, then try its buttons.
- **Start > Shut Down...** has a surprise.
- Click the taskbar clock 5 times in a row.
- Double-click empty desktop space 10 times.
- Enter the Konami code: Up Up Down Down Left Right Left Right B A.

Every popup can be dismissed with its buttons, the X, or Escape. None of them block the rest of the site.
