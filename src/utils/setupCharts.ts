import fs from 'node:fs';
import path from 'node:path';
import replace from 'replace-in-file';

const currentName = 'blip-extension-template';

function chartsRenamePackageName({ dir, to }: { to: string; dir: string }) {
    const filesGlob = path
        .join(path.relative(process.cwd(), dir), '/**/*')
        .replace(/\\/g, '/');

    replace.sync({
        files: filesGlob,
        from: new RegExp(currentName, 'g'),
        to,
    });
}

function chartsRenameFolder({ dir, to }: { to: string; dir: string }) {
    const oldPath = path.join(dir, currentName);
    const newPath = path.join(dir, to);

    if (!fs.existsSync(oldPath)) {
        throw new Error(`Charts path not fount. (${oldPath})`);
    }

    fs.renameSync(oldPath, newPath);

    return newPath;
}

interface Properties {
    packageName: string;
    root: string;
}

function setupCharts({ packageName, root }: Properties) {
    const chartsDir = path.join(`${root}/charts`);

    chartsRenameFolder({
        dir: chartsDir,
        to: packageName,
    });

    chartsRenamePackageName({ dir: chartsDir, to: packageName });
}

export default setupCharts;
