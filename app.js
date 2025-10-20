// muOS .muxupd Builder - Main Application
// State management
const state = {
    sdCard: 'sd1', // 'sd1' or 'sd2'
    basePath: '/mnt/mmc',
    files: {
        roms: [],
        bios: [],
        saves: [],
        states: [],
        themes: [],
        music: [],
        screenshots: [],
        config: []
    },
    romSystem: 'custom',
    customRomSystem: ''
};

// Path mapping
const PATH_MAP = {
    sd1: '/mnt/mmc',
    sd2: '/mnt/sdcard'
};

const CATEGORY_PATHS = {
    roms: (system) => `${state.basePath}/ROMS/${system}`,
    bios: () => `${state.basePath}/MUOS/bios`,
    saves: () => `${state.basePath}/MUOS/save/file`,
    states: () => `${state.basePath}/MUOS/save/state`,
    themes: () => `${state.basePath}/MUOS/theme`,
    music: () => `${state.basePath}/MUOS/music`,
    screenshots: () => `${state.basePath}/MUOS/screenshot`,
    config: () => `${state.basePath}/MUOS/info/config`
};

// Utility functions
function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getTotalFileCount() {
    return Object.values(state.files).reduce((total, files) => total + files.length, 0);
}

function getTotalFileSize() {
    let total = 0;
    Object.values(state.files).forEach(files => {
        files.forEach(fileData => total += fileData.size);
    });
    return total;
}

// SD Card selection handlers
function initSDCardSelection() {
    const sd1Btn = document.getElementById('sd1-btn');
    const sd2Btn = document.getElementById('sd2-btn');
    const currentPathEl = document.querySelector('#current-path span');

    sd1Btn.addEventListener('click', () => {
        state.sdCard = 'sd1';
        state.basePath = PATH_MAP.sd1;
        sd1Btn.classList.add('active');
        sd2Btn.classList.remove('active');
        currentPathEl.textContent = state.basePath;
        updatePreview();
    });

    sd2Btn.addEventListener('click', () => {
        state.sdCard = 'sd2';
        state.basePath = PATH_MAP.sd2;
        sd2Btn.classList.add('active');
        sd1Btn.classList.remove('active');
        currentPathEl.textContent = state.basePath;
        updatePreview();
    });
}

// ROM system selection handler
function initROMSystemSelection() {
    const systemSelect = document.getElementById('rom-system');
    const customInput = document.getElementById('rom-system-custom');

    systemSelect.addEventListener('change', (e) => {
        if (e.target.value === 'custom') {
            customInput.classList.remove('hidden');
            state.romSystem = customInput.value || 'custom';
        } else {
            customInput.classList.add('hidden');
            state.romSystem = e.target.value;
        }
        updatePreview();
    });

    customInput.addEventListener('input', (e) => {
        state.romSystem = e.target.value || 'custom';
        updatePreview();
    });
}

// File upload handlers
function initUploadZones() {
    const uploadZones = document.querySelectorAll('.upload-zone');

    uploadZones.forEach(zone => {
        const category = zone.dataset.category;
        const fileInput = zone.querySelector('.file-input');
        const folderInput = zone.querySelector('.folder-input');
        const uploadBtn = zone.querySelector('.upload-btn');
        const folderBtn = zone.querySelector('.folder-btn');
        const fileListEl = zone.parentElement.querySelector('.file-list');

        // Click to upload files
        uploadBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            fileInput.click();
        });

        // Click to upload folder
        folderBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            folderInput.click();
        });

        // File input change
        fileInput.addEventListener('change', (e) => {
            handleFiles(category, e.target.files, fileListEl);
            e.target.value = ''; // Reset input
        });

        // Folder input change
        folderInput.addEventListener('change', (e) => {
            handleFiles(category, e.target.files, fileListEl);
            e.target.value = ''; // Reset input
        });

        // Drag and drop with folder support
        zone.addEventListener('dragover', (e) => {
            e.preventDefault();
            zone.classList.add('drag-over');
        });

        zone.addEventListener('dragleave', () => {
            zone.classList.remove('drag-over');
        });

        zone.addEventListener('drop', async (e) => {
            e.preventDefault();
            zone.classList.remove('drag-over');

            // Handle both files and folders
            const items = e.dataTransfer.items;
            if (items) {
                const files = await getAllFilesFromDrop(items);
                if (files.length > 0) {
                    handleFilesWithPaths(category, files, fileListEl);
                }
            } else {
                // Fallback for browsers that don't support items
                handleFiles(category, e.dataTransfer.files, fileListEl);
            }
        });
    });
}

// Helper functions for drag-and-drop folder support
async function getAllFilesFromDrop(items) {
    const files = [];
    const entries = [];

    // Collect all entries
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.kind === 'file') {
            const entry = item.webkitGetAsEntry();
            if (entry) {
                entries.push(entry);
            }
        }
    }

    // Process all entries
    for (const entry of entries) {
        const entryFiles = await getFilesFromEntry(entry);
        files.push(...entryFiles);
    }

    return files;
}

async function getFilesFromEntry(entry, path = '') {
    const files = [];

    if (entry.isFile) {
        // Get the file
        const file = await new Promise((resolve, reject) => {
            entry.file(resolve, reject);
        });
        // Add relative path metadata
        files.push({
            file: file,
            relativePath: path ? `${path}/${file.name}` : file.name
        });
    } else if (entry.isDirectory) {
        // Read directory contents (must call readEntries multiple times)
        const reader = entry.createReader();
        let allEntries = [];

        // Keep reading until we get all entries
        while (true) {
            const entries = await new Promise((resolve, reject) => {
                reader.readEntries(resolve, reject);
            });

            if (entries.length === 0) {
                break; // No more entries
            }

            allEntries.push(...entries);
        }

        // Recursively process directory contents
        for (const childEntry of allEntries) {
            const newPath = path ? `${path}/${entry.name}` : entry.name;
            const childFiles = await getFilesFromEntry(childEntry, newPath);
            files.push(...childFiles);
        }
    }

    return files;
}

function handleFilesWithPaths(category, filesWithPaths, fileListEl) {
    filesWithPaths.forEach(({ file, relativePath }) => {
        // Check if file already exists
        const exists = state.files[category].some(f =>
            f.name === file.name && f.size === file.size && f.relativePath === relativePath
        );

        if (!exists) {
            state.files[category].push({
                file: file,
                name: file.name,
                size: file.size,
                relativePath: relativePath
            });
        }
    });

    renderFileList(category, fileListEl);
    updatePreview();
    updateGenerateButton();
}

function handleFiles(category, fileList, fileListEl) {
    const files = Array.from(fileList);

    files.forEach(file => {
        // Extract relative path from webkitRelativePath or use just filename
        let relativePath = '';
        if (file.webkitRelativePath) {
            // Get path relative to selected folder
            const parts = file.webkitRelativePath.split('/');
            // Remove first part (folder name) and join the rest
            if (parts.length > 1) {
                relativePath = parts.slice(1).join('/');
            } else {
                relativePath = file.name;
            }
        } else {
            relativePath = file.name;
        }

        // Check if file already exists (by name and size)
        const exists = state.files[category].some(f =>
            f.name === file.name && f.size === file.size && f.relativePath === relativePath
        );

        if (!exists) {
            // Store file with metadata
            state.files[category].push({
                file: file,
                name: file.name,
                size: file.size,
                relativePath: relativePath
            });
        }
    });

    renderFileList(category, fileListEl);
    updatePreview();
    updateGenerateButton();
}

function renderFileList(category, fileListEl) {
    fileListEl.innerHTML = '';

    if (state.files[category].length === 0) {
        return;
    }

    state.files[category].forEach((fileData, index) => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        const displayPath = fileData.relativePath || fileData.name;
        fileItem.innerHTML = `
            <span class="file-name" title="${displayPath}">${displayPath}</span>
            <span class="file-size">${formatBytes(fileData.size)}</span>
            <button class="remove-btn" data-category="${category}" data-index="${index}">Remove</button>
        `;
        fileListEl.appendChild(fileItem);
    });

    // Add remove button handlers
    fileListEl.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const category = e.target.dataset.category;
            const index = parseInt(e.target.dataset.index);
            removeFile(category, index, fileListEl);
        });
    });
}

function removeFile(category, index, fileListEl) {
    state.files[category].splice(index, 1);
    renderFileList(category, fileListEl);
    updatePreview();
    updateGenerateButton();
}

// Preview tree generation
function updatePreview() {
    const previewTree = document.getElementById('preview-tree');
    const totalFiles = document.getElementById('total-files');
    const totalSize = document.getElementById('total-size');

    const fileCount = getTotalFileCount();
    const fileSize = getTotalFileSize();

    totalFiles.textContent = fileCount;
    totalSize.textContent = formatBytes(fileSize);

    if (fileCount === 0) {
        previewTree.innerHTML = '<p class="text-gray-500 italic">No files added yet...</p>';
        return;
    }

    // Show warning for large archives
    if (fileSize > 2 * 1024 * 1024 * 1024) { // 2GB
        const warning = document.createElement('div');
        warning.className = 'warning-message mb-4';
        warning.textContent = 'Warning: Archive size exceeds 2GB. Consider splitting into multiple archives for better compatibility.';
        previewTree.parentElement.insertBefore(warning, previewTree);
    } else {
        const existingWarning = previewTree.parentElement.querySelector('.warning-message');
        if (existingWarning) {
            existingWarning.remove();
        }
    }

    // Build tree structure
    const tree = {};

    // Add files to tree
    Object.entries(state.files).forEach(([category, files]) => {
        if (files.length === 0) return;

        let basePath;
        if (category === 'roms') {
            basePath = CATEGORY_PATHS.roms(state.romSystem);
        } else {
            basePath = CATEGORY_PATHS[category]();
        }

        files.forEach(fileData => {
            // Use relativePath to preserve folder structure
            const fullPath = `${basePath}/${fileData.relativePath}`;
            addToTree(tree, fullPath.split('/').filter(p => p));
        });
    });

    previewTree.innerHTML = renderTree(tree);
}

function addToTree(tree, pathParts) {
    if (pathParts.length === 0) return;

    const [current, ...rest] = pathParts;

    if (!tree[current]) {
        tree[current] = rest.length === 0 ? null : {};
    }

    if (rest.length > 0 && tree[current] !== null) {
        addToTree(tree[current], rest);
    }
}

function renderTree(tree, indent = 0) {
    let html = '';
    const entries = Object.entries(tree).sort(([a], [b]) => {
        // Folders first, then files
        const aIsFolder = tree[a] !== null;
        const bIsFolder = tree[b] !== null;
        if (aIsFolder && !bIsFolder) return -1;
        if (!aIsFolder && bIsFolder) return 1;
        return a.localeCompare(b);
    });

    entries.forEach(([name, children]) => {
        const isFolder = children !== null;
        const icon = isFolder ? '📁' : '📄';
        const className = isFolder ? 'tree-folder' : 'tree-file';
        const indentStr = '  '.repeat(indent);

        html += `<div class="${className}">${indentStr}${icon} ${name}</div>`;

        if (isFolder && children) {
            html += renderTree(children, indent + 1);
        }
    });

    return html;
}

// Generate .muxupd file
function updateGenerateButton() {
    const generateBtn = document.getElementById('generate-btn');
    const hasFiles = getTotalFileCount() > 0;
    generateBtn.disabled = !hasFiles;
}

async function generateMuxupd() {
    const generateBtn = document.getElementById('generate-btn');
    const progress = document.getElementById('progress');
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');

    generateBtn.disabled = true;
    progress.classList.remove('hidden');

    try {
        const zip = new JSZip();
        let processedFiles = 0;
        const totalFiles = getTotalFileCount();

        // Add all files to ZIP
        for (const [category, files] of Object.entries(state.files)) {
            if (files.length === 0) continue;

            let basePath;
            if (category === 'roms') {
                basePath = CATEGORY_PATHS.roms(state.romSystem);
            } else {
                basePath = CATEGORY_PATHS[category]();
            }

            for (const fileData of files) {
                // Use relativePath to preserve folder structure
                // Remove leading slash for ZIP path
                const zipPath = `${basePath}/${fileData.relativePath}`.replace(/^\//, '');
                zip.file(zipPath, fileData.file);

                processedFiles++;
                const percent = Math.round((processedFiles / totalFiles) * 100);
                progressBar.style.width = `${percent}%`;
                progressText.textContent = `Adding files... ${processedFiles}/${totalFiles}`;
            }
        }

        // Generate ZIP
        progressText.textContent = 'Generating archive...';
        const blob = await zip.generateAsync({
            type: 'blob',
            compression: 'DEFLATE',
            compressionOptions: { level: 6 }
        }, (metadata) => {
            const percent = Math.round(metadata.percent);
            progressBar.style.width = `${percent}%`;
            progressText.textContent = `Compressing... ${percent}%`;
        });

        // Download
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        const filename = `Custom_muOS_${timestamp}.muxupd`;

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        // Success message
        progressBar.style.width = '100%';
        progressBar.classList.remove('bg-muos-yellow');
        progressBar.classList.add('bg-green-500');
        progressText.textContent = `Success! ${filename} downloaded.`;
        progressText.classList.add('text-green-400');

        setTimeout(() => {
            progress.classList.add('hidden');
            progressBar.style.width = '0%';
            progressBar.classList.add('bg-muos-yellow');
            progressBar.classList.remove('bg-green-500');
            progressText.classList.remove('text-green-400');
            generateBtn.disabled = false;
        }, 3000);

    } catch (error) {
        console.error('Error generating .muxupd:', error);
        progressText.textContent = `Error: ${error.message}`;
        progressText.classList.add('text-red-400');
        generateBtn.disabled = false;
    }
}

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    initSDCardSelection();
    initROMSystemSelection();
    initUploadZones();
    updateGenerateButton();

    // Generate button handler
    document.getElementById('generate-btn').addEventListener('click', generateMuxupd);
});
