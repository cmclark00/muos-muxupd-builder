# muOS .muxupd Builder

A simple, browser-based tool for creating custom `.muxupd` archive files for [muOS](https://muos.dev). Perfect for setting up your muOS device with your preferred ROMs, BIOS files, saves, themes, apps, artwork and more.

Built for **MustardOS 2606.0 Andromeda**.

## Features

- **Zero Installation Required** - Runs entirely in your web browser
- **muOS-Themed UI** - Clean, minimalist design with the signature muOS yellow aesthetic
- **Drag & Drop Support** - Easily add files and folders by dragging them into upload zones
- **SD Card Selection** - Choose between SD1 (`/mnt/mmc`) or SD2 (`/mnt/sdcard`)
- **Every muOS system** - The system list comes straight from muOS's own core manifest, so ROM folders are auto-detected on the device
- **BIOS checking** - BIOS files muOS knows are checked for the right name, location and MD5
- **Andromeda-ready archives** - Every archive includes the `manifest.sha256` that muOS now checks before installing, and stays inside the Archive Manager's size limits
- **Automatic splitting** - Large collections are split into several `.muxupd` files
- **Theme and app unpacking** - `.muxthm` and `.muxapp` files are unpacked to the folder layout muOS uses
- **Multiple Content Types** - Support for:
  - ROMs (with system selection)
  - BIOS files
  - Save files & save states
  - Themes
  - Applications
  - Artwork (box art, previews, splash screens, descriptions, manuals, videos)
  - Music
  - Screenshots
  - RetroArch configs
- **Live Preview** - See your archive structure before generating

## Quick Start

### Option 1: Run Locally

1. Download all files (`index.html`, `app.js`, `systems.js`, `style.css`)
2. Open `index.html` in any modern web browser
3. Start adding your files!

### Option 2: Host Online

1. Upload files to any static web hosting service (GitHub Pages, Netlify, etc.)
2. Access via the hosted URL

## How to Use

### 1. Select Storage Location

Choose where you want your content installed:
- **SD1** - `/mnt/mmc` (primary SD card)
- **SD2** - `/mnt/sdcard` (secondary SD card)

The app will automatically update all file paths based on your selection.

If you choose SD2:
- SD2 must be inserted when you install the archive, or the files end up on internal storage.
- When SD2 has a `MUOS/<folder>` (bios, save, theme, ...), muOS uses it instead of SD1's, so installing to SD2 makes SD2's copy the active one.

### 2. Add Your Content

#### ROMs
1. Select the system from the dropdown, or choose "Custom Folder Name" and enter your own
2. Drag & drop your ROM files or folders, or click to browse
3. Files are placed in `/mnt/[mmc|sdcard]/ROMS/[folder]/`

The dropdown uses folder names muOS recognises, so the right core is picked automatically. If you drop a folder whose name muOS recognises for that system (e.g. `nes` or `famicom`), its contents go straight into the system folder. Other folders are kept as subfolders.

The ROM section also lists the BIOS files the selected system can use.

#### BIOS Files
- Placed in `/mnt/[mmc|sdcard]/MUOS/bios/`
- Files muOS knows about are marked as verified, or flagged if the MD5 or location doesn't match what muOS expects

#### Save Files & States
- **Save Files** → `/mnt/[mmc|sdcard]/MUOS/save/file/`
- **Save States** → `/mnt/[mmc|sdcard]/MUOS/save/state/`

muOS sorts saves into a folder per core (e.g. `file/mGBA/`). Drop your whole `file` or `state` folder to keep that structure.

#### Themes
- Placed in `/mnt/[mmc|sdcard]/MUOS/theme/`
- Andromeda stores themes as folders rather than `.muxthm` archives. Drop a theme folder, or a `.muxthm` file and it will be unpacked to `theme/<name>/` for you

#### Applications
- Placed in `/mnt/[mmc|sdcard]/MUOS/application/`
- Drop app folders (each containing a `mux_launch.sh`) or `.muxapp` files, which are unpacked for you

#### Artwork
- Placed in `/mnt/[mmc|sdcard]/MUOS/info/catalogue/[System]/[type]/`
- Pick the system and type (box art, grid, preview, splash, description text, manual, video)
- Name each file after its ROM without the extension, e.g. `Super Mario Bros (USA).png`

#### Music
- Add background music files (`.ogg`, `.mp3`, etc.)
- Placed in `/mnt/[mmc|sdcard]/MUOS/music/`

#### Screenshots
- Placed in `/mnt/[mmc|sdcard]/MUOS/screenshot/`

#### RetroArch Configs
- Placed in `/opt/muos/share/info/config/` on the system partition, whichever SD card you selected

### 3. Review Your Archive

The **Archive Preview** section shows:
- Complete directory structure
- Total file count and size
- How many `.muxupd` files will be created
- Anything muOS would reject, with one-click fixes

### 4. Generate & Download

1. Click the **"Generate .muxupd File"** button
2. Wait for the archive to be created (progress bar shown)
3. Your file will automatically download as `Custom_muOS_[timestamp].muxupd` (or `..._part1of3.muxupd` and so on when split)

### 5. Install on Your Device

1. Copy the `.muxupd` file(s) to the `ARCHIVE` folder on your SD card
2. Open **Archive Manager** in muOS
3. Select your custom `.muxupd` file and install it. muOS checks every file against the manifest first.

## muOS Archive Limits

Since Andromeda, the Archive Manager checks every archive and refuses any that break these rules. The builder enforces them for you:

| Rule | What the builder does |
| --- | --- |
| Max 2 GB uncompressed per archive | Splits content into several archives |
| Max 16,384 files per archive | Splits content into several archives |
| Max 512 MB per file | Flags the file - copy it to the SD card directly, or convert disc images to CHD |
| `manifest.sha256` must list every file | Hashes every file and writes the manifest |
| No compression ratio over 1000:1 | Stores files uncompressed (muOS recommends this anyway) |

muOS also can't verify files whose names contain `[`, `]`, `*` or `?` in updates over 256 MB. Those files go into separate archives of up to 128 MB, or you can rename them with one click (`[` `]` become `(` `)`).

## Tips & Best Practices

### File Organization

- Organize ROMs by system
- Use the custom folder name option for systems not in the list (you'll need to assign a core on the device)
- Convert large disc images to CHD to stay under the 512 MB per-file limit

### Testing

Before creating a full archive:
1. Test with a small subset of files first
2. Install on your device to verify everything works
3. Then create your full custom archive

## Browser Compatibility

Works on all modern browsers:
- Chrome/Edge (recommended)
- Firefox
- Safari
- Opera

Requires JavaScript to be enabled.

## Technical Details

### Archive Format

`.muxupd` files are standard ZIP archives with a custom extension. muOS extracts them to `/`, so the internal structure mirrors the device filesystem:

```
manifest.sha256          # SHA-256 of every file, checked before installing
mnt/
└── mmc/  (or sdcard/)
    ├── ROMS/
    │   ├── nes/
    │   ├── snes/
    │   └── ...
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
opt/
└── muos/share/info/config/   # RetroArch configs
```

### Updating for New muOS Releases

The system list, folder names and BIOS hashes in `systems.js` are generated from the [MustardOS/internal](https://github.com/MustardOS/internal) repository:

```bash
git clone --depth 1 https://github.com/MustardOS/internal.git
python3 tools/gen-systems.py internal > systems.js
```

### Libraries Used

- [Tailwind CSS](https://tailwindcss.com/) - UI styling
- [zip.js](https://gildas-lormeau.github.io/zip.js/) - Streaming ZIP generation
- [hash-wasm](https://github.com/Daninet/hash-wasm) - Streaming SHA-256 and MD5 hashing
- [StreamSaver.js](https://github.com/jimmywarting/StreamSaver.js) - Writing archives straight to disk

## Troubleshooting

### Files not appearing in archive
- Make sure you clicked "Generate" after adding files
- Check that files were successfully added (should appear in the file list)

### Archive won't install on device
- Make sure you're on MustardOS 2606.0 Andromeda or newer
- Verify the file has `.muxupd` extension and wasn't modified after download (the manifest check will fail)
- Check that your paths are correct (SD1 vs SD2)

### Theme doesn't show up
- Make sure the theme sits in its own folder under `MUOS/theme/` (check the preview)

## Contributing

Found a bug or have a feature request? This tool is open source and welcomes contributions!

## License

MIT License - Free to use, modify, and distribute.

## Credits

Created for the muOS community. muOS is developed by the team at [MustardOS](https://github.com/MustardOS).

---

**For more information about muOS:**
- Website: https://muos.dev
- GitHub: https://github.com/MustardOS
- Community: https://community.muos.dev
