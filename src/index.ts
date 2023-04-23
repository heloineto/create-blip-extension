import minimist from 'minimist';
import prompts from 'prompts';
import formatTargetDir from './formatTargetDir.js';
import path from 'node:path';
import { red } from 'kolorist';
import { DEFAULT_TARGET_DIR } from './constants.js';
import questions from './questions/index.js';
import clearDir from './clearDir.js';
import fs from 'node:fs';
import { Template } from './templates.js';
import logDoneMessage from './logDoneMessage.js';

type Answers = Partial<{
    template: Template;
    overwrite: boolean;
    packageName: string;
    projectName: string;
}>;

const argv = minimist<{
    t?: string;
    template?: string;
}>(process.argv.slice(2), { string: ['_'] });
const cwd = process.cwd();

async function main() {
    const argTargetDir = formatTargetDir(argv._[0]);
    const argTemplate = argv.template || argv.t;

    let targetDir = argTargetDir || DEFAULT_TARGET_DIR;
    const projectName =
        targetDir === '.' ? path.basename(path.resolve()) : targetDir;

    const answers: Answers | null = await prompts(
        [
            questions.projectName({
                argTargetDir,
                onChange: (dir) => (targetDir = dir)
            }),
            questions.overwrite({ targetDir }),
            questions.overwriteChecker(),
            questions.packageName({ projectName }),
            questions.template({ argTemplate })
        ],
        {
            onCancel: () => {
                throw new Error(red('✖') + ' Operation cancelled');
            }
        }
    ).catch((cancelled: any) => {
        console.log(cancelled.message);
        return null;
    });

    if (answers === null) {
        return;
    }

    // const template = answers.template || argTemplate;
    const overwrite = answers.overwrite || false;
    // const packageName = answers.packageName || projectName;

    const root = path.join(cwd, targetDir);

    if (overwrite) {
        clearDir(root);
    } else if (!fs.existsSync(root)) {
        fs.mkdirSync(root, { recursive: true });
    }

    console.log(`\nScaffolding project in ${root}...`);

    logDoneMessage({ root });
}

main();
