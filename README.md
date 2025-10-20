# muOS .muxupd Builder

A simple, browser-based tool for creating custom `.muxupd` archive files for [muOS](https://muos.dev). Perfect for setting up your muOS device with your preferred ROMs, BIOS files, saves, themes, and more.

## Features

- **Zero Installation Required** - Runs entirely in your web browser
- **muOS-Themed UI** - Clean, minimalist design with the signature muOS yellow aesthetic
- **Drag & Drop Support** - Easily add files by dragging them into upload zones
- **SD Card Selection** - Choose between SD1 (`/mnt/mmc`) or SD2 (`/mnt/sdcard`)
- **Multiple Content Types** - Support for:
  - ROMs (with system selection)
  - BIOS files
  - Save files & save states
  - Themes
  - Music
  - Screenshots
  - Config files
- **Live Preview** - See your archive structure before generating
- **Smart Path Mapping** - Automatically creates correct muOS directory structure

## Quick Start

### Option 1: Run Locally

1. Download all files (`index.html`, `app.js`, `style.css`)
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

### 2. Add Your Content

For each content type you want to include:

#### ROMs
1. Select the system from the dropdown (NES, SNES, PS1, etc.)
   - Or choose "Custom System Name" and enter your own
2. Drag & drop your ROM files, or click to browse
3. Files will be placed in `/mnt/[mmc|sdcard]/ROMS/[system]/`

#### BIOS Files
- Add your console BIOS files
- Will be placed in `/mnt/[mmc|sdcard]/MUOS/bios/`

#### Save Files & States
- **Save Files** → `/mnt/[mmc|sdcard]/MUOS/save/file/`
- **Save States** → `/mnt/[mmc|sdcard]/MUOS/save/state/`

#### Themes
- Add custom `.muxthm` theme files
- Will be placed in `/mnt/[mmc|sdcard]/MUOS/theme/`

#### Music
- Add background music files (`.ogg`, `.mp3`, etc.)
- Will be placed in `/mnt/[mmc|sdcard]/MUOS/music/`

#### Screenshots
- Add screenshot files
- Will be placed in `/mnt/[mmc|sdcard]/MUOS/screenshot/`

#### Config Files
- Add custom configuration files
- Will be placed in `/mnt/[mmc|sdcard]/MUOS/info/config/`

### 3. Review Your Archive

The **Archive Preview** section shows:
- Complete directory structure
- Total file count
- Total archive size
- Warning if archive exceeds 2GB

### 4. Generate & Download

1. Click the **"Generate .muxupd File"** button
2. Wait for the archive to be created (progress bar shown)
3. Your file will automatically download as `Custom_muOS_[timestamp].muxupd`

### 5. Install on Your Device

1. Copy the `.muxupd` file to your muOS device
2. Go to **Archive Manager** in muOS
3. Select your custom `.muxupd` file
4. Install it!

## Tips & Best Practices

### For Large ROM Collections

If you have a large library (>2GB):
- Create multiple archives (e.g., one per system)
- Install them one at a time on your device
- The app will warn you when an archive exceeds 2GB

### File Organization

- Keep file names clean (no special characters)
- Organize ROMs by system
- Use the custom system name feature for systems not in the list

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

`.muxupd` files are standard ZIP archives with a custom extension. The internal structure matches the muOS filesystem:

```
mnt/
├── mmc/  (or sdcard/)
    ├── ROMS/
    │   ├── nes/
    │   ├── snes/
    │   └── ...
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

### Libraries Used

- [Tailwind CSS](https://tailwindcss.com/) - UI styling
- [JSZip](https://stuk.github.io/jszip/) - ZIP file generation

## Troubleshooting

### Files not appearing in archive
- Make sure you clicked "Generate" after adding files
- Check that files were successfully added (should appear in the file list)

### Archive won't install on device
- Verify the file has `.muxupd` extension
- Check that your paths are correct (SD1 vs SD2)
- Ensure BIOS files are in the correct format

### Browser crashes with large archives
- Try adding fewer files at once
- Close other browser tabs to free up memory
- Use a desktop browser (mobile browsers may have memory limits)

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
