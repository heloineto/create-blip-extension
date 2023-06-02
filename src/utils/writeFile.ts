import fs from 'node:fs';
import path from 'node:path';
import copyFileSystemNode from './copyFileSystemNode.js';

const renameFiles: Record<string, string | undefined> = {
    _gitignore: '.gitignore',
};

interface Properties {
    root: string;
    templateDir: string;
    file: string;
    content?: string;
}

function writeFile({ file, content, root, templateDir }: Properties) {
    const targetPath = path.join(root, renameFiles[file] ?? file);
    if (content) {
        fs.writeFileSync(targetPath, content);
    } else {
        copyFileSystemNode(path.join(templateDir, file), targetPath);
    }
}

export default writeFile;
