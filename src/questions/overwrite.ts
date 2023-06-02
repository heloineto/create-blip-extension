import prompts from 'prompts';
import fs from 'node:fs';

type Properties = {
    targetDir: string;
};

function overwrite({
    targetDir,
}: Properties): prompts.PromptObject<'overwrite'> {
    return {
        type: () =>
            !fs.existsSync(targetDir) || isEmptyDir(targetDir)
                ? null
                : 'confirm',
        name: 'overwrite',
        message: () =>
            (targetDir === '.'
                ? 'Current directory'
                : `Target directory "${targetDir}"`) +
            ` is not empty. Remove existing files and continue?`,
    };
}

function isEmptyDir(path: string) {
    const files = fs.readdirSync(path);

    return files.length === 0 || (files.length === 1 && files[0] === '.git');
}

export default overwrite;
