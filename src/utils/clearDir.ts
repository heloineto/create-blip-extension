import fs from 'node:fs';
import path from 'node:path';

function clearDir(dir: string) {
    if (!fs.existsSync(dir)) {
        return;
    }

    for (const file of fs.readdirSync(dir)) {
        if (file === '.git') {
            continue;
        }
        fs.rmSync(path.resolve(dir, file), { recursive: true, force: true });
    }
}

export default clearDir;
