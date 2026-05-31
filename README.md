# EpubReader

A browser-based EPUB reading experience built with Angular 21.2.11.

## What this app does

- Load `.epub` files from your local machine
- Render EPUB pages and images in the browser
- Show chapter navigation from the EPUB index
- Support read-aloud audio using the Web Speech API
- Expose speech controls for voice selection, pitch, rate, and volume
- Show loading progress while EPUB content is parsed
- Support server-side rendering with Angular SSR

## Getting started

### Install dependencies

```bash
npm install
```

### Start development server

```bash
npm start
```

Then open:

```text
http://localhost:4200
```

### Build for production

```bash
npm run build
```

The build artifacts are written to `dist/epub-reader`.

### Watch build during development

```bash
npm run watch
```

### Run unit tests

```bash
npm test
```

### Serve SSR build

After building, start the server-side rendered app with:

```bash
npm run serve:ssr:epub-reader
```

Then open:

```text
http://localhost:4000
```

### Lint the project

```bash
npm run lint
```

## Application workflow

1. Open the app in the browser.
2. Click **Select EPUB** and choose a `.epub` file.
3. Wait for the EPUB loader to parse the file and load pages, images, and chapter metadata.
4. Read the book content in the main reader panel.
5. Click **Read aloud** to start or stop speech playback.
6. Use **Audio Options** to:
   - choose a voice
   - adjust pitch
   - adjust rate
   - adjust volume
7. Click **Chapters** to open the chapter navigator and jump to sections quickly.

## Notes

- Speech playback uses the browser's built-in `speechSynthesis` support.
- EPUB files are loaded locally in the browser; no EPUB upload server is required.
- Images are extracted from the EPUB archive and displayed in-page.
- Chapter navigation is built from the EPUB index when available.

## Project commands

| Command | Description |
| --- | --- |
| `npm install` | Install dependencies |
| `npm start` | Start Angular development server |
| `npm run build` | Build production artifacts |
| `npm run watch` | Build in watch mode |
| `npm test` | Run unit tests |
| `npm run serve:ssr:epub-reader` | Serve the SSR build locally |
| `npm run lint` | Run linter checks |

## Directory highlights

- `src/app/component/reader` — main EPUB reader UI
- `src/app/component/epub/epub-display` — EPUB page rendering and image handling
- `src/app/service/epub` — EPUB parsing and index generation
- `src/app/service/text-to-speech` — browser speech playback controls
- `src/app/service/save-to-local-storage` — save/load support for browser storage
- `src/app/service/zip` — ZIP/EPUB archive extraction
