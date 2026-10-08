# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A browser-based tool for creating custom `.muxupd` archive files for muOS (MustardOS). This is a **pure client-side application** with no backend - all ZIP generation happens in the browser using zip.js with streaming support. Targets MustardOS 2606.0 Andromeda.

## Running & Testing

**Local development:**
```bash
# Option 1: Open directly in browser
open index.html

# Option 2: Use a local server
python3 -m http.server 8000
# Then visit http://localhost:8000

# Option 3: Node.js
npx serve
```

**Live site:**
- Hosted on GitHub Pages at: https://cmclark00.github.io/muos-muxupd-builder/
- Any push to `main` branch automatically updates the live site within 1-2 minutes

**No build process** - The app uses CDN-hosted dependencies (Tailwind CSS, zip.js, hash-wasm, StreamSaver.js). Edit files and refresh browser to see changes.

## Architecture

### File Structure
- `index.html` - Complete UI with muOS yellow theme (#FFC107)
- `app.js` - All application logic (state management, file handling, archive planning, ZIP generation)
- `systems.js` - Generated system data (`MUOS_VERSION`, `MUOS_SYSTEMS`) - do not edit by hand
- `tools/gen-systems.py` - Regenerates `systems.js` from a checkout of MustardOS/internal
- `style.css` - Custom styles beyond Tailwind (drag-drop states, tree view, notices, badges)
- `README.md` - User-facing documentation
- `HOSTING.md` - Deployment guide

### Target muOS Version

The builder targets **MustardOS 2606.0 Andromeda**. The device-side behaviour it has to satisfy lives in the [MustardOS/internal](https://github.com/MustardOS/internal) repo:
- `script/mux/extract.sh` - how each archive type is installed (`.muxupd` is verified against `manifest.sha256`, then extracted to `/`)
- `script/var/zip.sh` - `SAFE_ARCHIVE` limits (entries, per-file size, total size, compression ratio, unsafe paths)
- `script/device/bind.sh` - which `MUOS/` folders exist and that SD2 takes priority over SD1
- `share/info/manifest/{libretro,external}.json` - systems, recognised ROM folder names, BIOS files (source of `systems.js`)

### Core Concepts

**State Management** (`state` in app.js)
```javascript
const state = {
    sdCard: 'sd1' | 'sd2',                 // User's SD card selection
    basePath: '/mnt/mmc' | '/mnt/sdcard',  // Computed from sdCard
    files: { roms: [], bios: [], ... },    // fileData objects organized by category
    romFolder: string,                     // Folder under ROMS/ for new ROMs (nes, psx, ...)
    catalogueSystem: string,               // Folder under MUOS/info/catalogue/ for new artwork
    catalogueType: string                  // box, grid, preview, splash, text, manual, video
}
```

Each `fileData` stores `file`, `name`, `size`, `relativePath`, plus its destination choice (`romFolder`, or `catalogue` + `catalogueType`) so changing a dropdown later doesn't move files already added.

**Path Mapping Logic**
- `PATH_MAP`: Maps SD card selection to filesystem paths
- `CATEGORY_PATHS`: Functions taking a `fileData` and returning the destination folder for each content type
- ROMs and artwork use per-file values (e.g. `/mnt/mmc/ROMS/nes/`, `/mnt/mmc/MUOS/info/catalogue/Sony PlayStation/box/`)
- RetroArch configs go to `/opt/muos/share/info/config` regardless of SD card
- `getZipPath()` joins the category path with `relativePath` and strips the leading slash

**Folder handling** (`normalizePath()`)
- ROMs: the top-level dropped/picked folder is stripped if it's a name muOS recognises for the selected system, otherwise kept as a subfolder
- Themes and applications (`KEEP_TOP_FOLDER`): the top folder is the theme/app name, so it's kept unless it's just a `theme`/`application` container
- Everything else: the top folder is stripped
- `.muxthm`/`.muxapp` files are unpacked in the browser by `expandPackedArchive()` (`PACKED_ARCHIVES`), because muOS only unpacks them when they're installed on their own, not inside a `.muxupd`

**muOS Filesystem Structure**
The generated .muxupd (ZIP) file is extracted to `/` on the device:
```
manifest.sha256
mnt/
└── [mmc or sdcard]/
    ├── ROMS/
    │   └── [folder]/        # e.g., nes, snes, psx
    └── MUOS/
        ├── application/
        ├── bios/
        ├── save/
        │   ├── file/
        │   └── state/
        ├── theme/
        ├── music/
        ├── screenshot/
        └── info/
            └── catalogue/
opt/muos/share/info/config/
```

### Key Functions

**File Upload Flow**
1. `initUploadZones()` - Sets up drag-drop and click upload for all zones
2. `addFiles()` - Unpacks packed archives, normalizes paths, skips files whose destination already exists
3. `checkBios()` - Checks BIOS files against `KNOWN_BIOS` (name, location, MD5 via hash-wasm)
4. `renderFileList()` - Updates UI to show uploaded files with badges and remove buttons
5. `updatePreview()` - Rebuilds tree view and archive notices
6. `updateGenerateButton()` - Enables/disables generate button based on the archive plan

**Archive Planning** (`planArchives()`)
- Enforces `ARCHIVE_LIMITS` (from muOS `SAFE_ARCHIVE`): 16,384 entries, 512 MiB per file, 2 GiB total per archive
- Splits content into several parts when needed; the manifest counts towards the limits
- Files with `[ ] * ?` in their path go into separate parts of up to 128 MiB (`WILDCARD_PART_BYTES`): muOS verifies updates over 256 MiB with `unzip -p <name>`, which treats those characters as wildcards
- Files over 512 MiB, and wildcard files too big for a small part, block generation until removed or renamed

**Archive Generation** (`generateMuxupd()` → `writeArchive()`)
1. Creates a StreamSaver writable stream per part (writes directly to disk)
2. Creates a zip.js ZipWriter with `level: 0` (STORE) - muOS asks for uncompressed archives and rejects entries compressed more than 1000:1
3. For each file: streams it through SHA-256 (`hashFile()`), then adds it with BlobReader
4. Adds `manifest.sha256` (`<sha256>  <path>` per line, sha256sum format) and closes the writer

**Tree Preview**
- `addToTree()` - Recursively builds nested object representing filesystem tree
- `renderTree()` - Renders tree as HTML with folder/file icons
- Automatically sorts: folders first, then files alphabetically

## Adding New Content Categories

To add a new content type (e.g., "overlays"):

1. **Add to state** (`state.files` in app.js):
   ```javascript
   files: {
       // ... existing categories
       overlays: []
   }
   ```

2. **Add path mapping** (`CATEGORY_PATHS` in app.js):
   ```javascript
   const CATEGORY_PATHS = {
       // ... existing paths
       overlays: () => `${state.basePath}/MUOS/overlay`
   };
   ```

3. **Add HTML section** (index.html): Copy one of the existing upload sections and change:
   - Section heading
   - `data-category="overlays"` attribute on `.upload-zone`
   - Path description text

That's it! The existing file upload, preview, and ZIP generation logic will automatically handle the new category. Check `script/device/bind.sh` in MustardOS/internal first to make sure muOS actually reads the folder.

## Design System

**muOS Theme Colors:**
- Primary: `#FFC107` (muOS yellow) - buttons, accents, headings
- Dark background: `#1a1a1a` (muos-dark)
- Card background: `#2a2a2a` (muos-gray)
- Border: `#4a4a4a` (gray-700)

**Tailwind configuration** is in `<script>` tag in index.html - customize colors there.

## Common Modifications

**Updating systems for a new muOS release:**
```bash
git clone --depth 1 https://github.com/MustardOS/internal.git
python3 tools/gen-systems.py internal > systems.js
```
Preferred ROM folder names per system are in `PREFERRED_FOLDERS` in the generator.

**Changing archive limits:**
Edit `ARCHIVE_LIMITS` in app.js. Keep them in sync with `SAFE_ARCHIVE` in muOS `script/var/zip.sh`, or archives will be rejected on the device.

**Changing compression level:**
Don't. `writeArchive()` uses `level: 0` on purpose (see Archive Generation above).

**Modifying duplicate detection:**
`addFiles()` skips a file when another file in the same category already has the same `getZipPath()`.

## Browser Compatibility

Requires modern browser with:
- File API for uploads
- Drag & Drop API
- Streams API (for large file handling)
- WebAssembly (hash-wasm for SHA-256/MD5)
- zip.js + StreamSaver.js for streaming ZIP generation
- Works best in Chrome, Firefox, Edge (Safari may have limitations with large files)

## Deployment

**GitHub Pages** (current setup):
```bash
git add .
git commit -m "Description"
git push
# Live in 1-2 minutes
```

**Alternative hosting**: Any static file host works (Netlify, Vercel, etc.) - see HOSTING.md.

## muOS Resources

- muOS Website: https://muos.dev
- muOS GitHub: https://github.com/MustardOS
- Community Forum: https://community.muos.dev
- Archive format: Standard ZIP with .muxupd extension
