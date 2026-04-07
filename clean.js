import fs from 'fs';
import { fileURLToPath } from 'url';

function getCurrentFolder() {
    const folder = fileURLToPath(new URL('.', import.meta.url));
    const filePath = folder.includes('\\') ? folder.replaceAll('\\', '/') : folder;
    const colon = filePath.indexOf(':');
    return colon === 1 ? filePath.substring(colon + 1) : filePath;
}

function removeDirectory(folder) {
    if (fs.existsSync(folder)) {
        fs.readdirSync(folder).forEach(f => {
            const path = `${folder}/${f}`;
            fs.statSync(path).isDirectory() ? removeDirectory(path) : fs.rmSync(path);
        });
        fs.rmdirSync(folder);
    }
}

removeDirectory(getCurrentFolder() + 'dist');
console.log('Cleaned dist folder');
