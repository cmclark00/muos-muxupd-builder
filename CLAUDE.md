# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A browser-based tool for creating custom `.muxupd` archive files for muOS (MustardOS). This is a **pure client-side application** with no backend - all ZIP generation happens in the browser using JSZip.

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

**No build process** - The app uses CDN-hosted dependencies (Tailwind CSS, JSZip). Edit files and refresh browser to see changes.

## Architecture

### File Structure
- `index.html` - Complete UI with muOS yellow theme (#FFC107)
- `app.js` - All application logic (state management, file handling, ZIP generation)
- `style.css` - Custom styles beyond Tailwind (drag-drop states, tree view, etc.)
- `README.md` - User-facing documentation
- `HOSTING.md` - Deployment guide

### Core Concepts

**State Management (app.js:3-18)**
```javascript
const state = {
    sdCard: 'sd1' | 'sd2',           // User's SD card selection
    basePath: '/mnt/mmc' | '/mnt/sdcard',  // Computed from sdCard
    files: { roms: [], bios: [], ... },    // File objects organized by category
    romSystem: string                       // Selected ROM system (nes, snes, etc.)
}
```

**Path Mapping Logic (app.js:21-35)**
- `PATH_MAP`: Maps SD card selection to filesystem paths
- `CATEGORY_PATHS`: Functions that generate full paths for each content type
- ROMs are special: path includes system name (e.g., `/mnt/mmc/ROMS/nes/`)
- All other categories have fixed paths relative to basePath (e.g., `/mnt/mmc/MUOS/bios/`)

**muOS Filesystem Structure**
The generated .muxupd (ZIP) file must match muOS's expected structure:
```
mnt/
└── [mmc or sdcard]/
    ├── ROMS/
    │   └── [system]/        # e.g., nes, snes, psx
    └── MUOS/
        ├── bios/
        ├── save/
        │   ├── file/
        │   └── state/
        ├── theme/
        ├── music/
        ├── screenshot/
        └── info/
            └── config/
```

### Key Functions

**File Upload Flow**
1. `initUploadZones()` - Sets up drag-drop and click upload for all zones
2. `handleFiles()` - Processes uploaded files, checks for duplicates by name+size
3. `renderFileList()` - Updates UI to show uploaded files with remove buttons
4. `updatePreview()` - Rebuilds tree view of final archive structure
5. `updateGenerateButton()` - Enables/disables generate button based on file count

**Archive Generation (app.js:304-388)**
1. Creates JSZip instance
2. Iterates through `state.files` by category
3. For each file, computes correct path using `CATEGORY_PATHS`
4. Strips leading slash (ZIP paths are relative)
5. Adds file to ZIP with path: `mnt/[mmc|sdcard]/...`
6. Generates ZIP blob with DEFLATE compression (level 6)
7. Triggers browser download with timestamp filename: `Custom_muOS_[timestamp].muxupd`

**Tree Preview (app.js:256-295)**
- `addToTree()` - Recursively builds nested object representing filesystem tree
- `renderTree()` - Renders tree as HTML with folder/file icons
- Automatically sorts: folders first, then files alphabetically

## Adding New Content Categories

To add a new content type (e.g., "covers"):

1. **Add to state** (app.js:3-18):
   ```javascript
   files: {
       // ... existing categories
       covers: []
   }
   ```

2. **Add path mapping** (app.js:26-35):
   ```javascript
   const CATEGORY_PATHS = {
       // ... existing paths
       covers: () => `${state.basePath}/MUOS/info/catalogue`
   };
   ```

3. **Add HTML section** (index.html): Copy one of the existing upload sections and change:
   - Section heading
   - `data-category="covers"` attribute on `.upload-zone`
   - Path description text

That's it! The existing file upload, preview, and ZIP generation logic will automatically handle the new category.

## Design System

**muOS Theme Colors:**
- Primary: `#FFC107` (muOS yellow) - buttons, accents, headings
- Dark background: `#1a1a1a` (muos-dark)
- Card background: `#2a2a2a` (muos-gray)
- Border: `#4a4a4a` (gray-700)

**Tailwind configuration** is in `<script>` tag in index.html - customize colors there.

## Common Modifications

**Adding new ROM systems:**
Edit the `<select id="rom-system">` dropdown in index.html (~line 90-110).

**Changing compression level:**
In `generateMuxupd()` function, modify `compressionOptions: { level: 6 }` (range: 0-9).

**Adjusting 2GB warning threshold:**
In `updatePreview()` function (app.js:221), change `2 * 1024 * 1024 * 1024`.

**Modifying file duplicate detection:**
In `handleFiles()` function (app.js:154), currently checks name+size. Modify this logic to use different criteria.

## Browser Compatibility

Requires modern browser with:
- File API for uploads
- Drag & Drop API
- JSZip for client-side ZIP generation
- No polyfills needed for target browsers (Chrome, Firefox, Safari, Edge)

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
