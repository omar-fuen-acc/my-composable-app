import fs from 'fs';
import { fileURLToPath } from 'url';

function getCurrentFolder() {
    const folder = fileURLToPath(new URL('.', import.meta.url));
    const filePath = folder.includes('\\') ? folder.replaceAll('\\', '/') : folder;
    const colon = filePath.indexOf(':');
    return colon === 1 ? filePath.substring(colon + 1) : filePath;
}

function copyFolder(src, target) {
    if (!fs.existsSync(target)) fs.mkdirSync(target, { recursive: true });
    fs.readdirSync(src).forEach(f => {
        const srcPath = `${src}/${f}`;
        const targetPath = `${target}/${f}`;
        fs.statSync(srcPath).isDirectory() ? copyFolder(srcPath, targetPath) : fs.copyFileSync(srcPath, targetPath);
    });
}

const base = getCurrentFolder();
const src = `${base}src/resources`;
const target = `${base}dist/resources`;

if (fs.existsSync(src)) {
    copyFolder(src, target);
    console.log('Resources copied to dist/');
} else {
    console.error('ERROR: src/resources folder not found');
}
