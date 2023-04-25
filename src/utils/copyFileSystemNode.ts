import fs from 'node:fs';
import path from 'node:path';

function copyDirectory(srcDir: string, destDir: string) {
    fs.mkdirSync(destDir, { recursive: true });

    for (const file of fs.readdirSync(srcDir)) {
        const srcFile = path.resolve(srcDir, file);
        const destFile = path.resolve(destDir, file);
        copyFileSystemNode(srcFile, destFile);
    }
}

function copyFileSystemNode(src: string, dest: string) {
    const stat = fs.statSync(src);
    if (stat.isDirectory()) {
        copyDirectory(src, dest);
    } else {
        fs.copyFileSync(src, dest);
    }
}

export default copyFileSystemNode;
