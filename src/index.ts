import fs from 'node:fs';
import minimist from 'minimist';
import prompts from 'prompts';
import formatTargetDir from './utils/formatTargetDir.js';
import path from 'node:path';
import { red } from 'kolorist';
import { DEFAULT_TARGET_DIR } from './utils/constants.js';
import questions from './questions/index.js';
import clearDir from './utils/clearDir.js';
import { Template } from './utils/templates.js';
import logDoneMessage from './utils/logDoneMessage.js';
import { fileURLToPath } from 'node:url';
import writeFile from './utils/writeFile.js';
import createAppSettings from './utils/createAppSettings.js';
import setupCharts from './utils/setupCharts.js';

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

const getProjectName = (targetDir: string) =>
    targetDir === '.' ? path.basename(path.resolve()) : targetDir;

async function main() {
    const argTargetDir = formatTargetDir(argv._[0]);
    const argTemplate = argv.template || argv.t;

    let targetDir = argTargetDir || DEFAULT_TARGET_DIR;

    const answers: Answers | null = await prompts(
        [
            // TODO: Fix the bug that happens when the user gives a target dir in the prompt
            // and the directory "blip-extension" already exists. This is a closure problem.
            questions.projectName({
                argTargetDir,
                onChange: (dir) => (targetDir = dir),
            }),
            questions.overwrite({ targetDir }),
            questions.overwriteChecker(),
            questions.packageName({ projectName: getProjectName(targetDir) }),
            questions.template({ argTemplate }),
        ],
        {
            onCancel: () => {
                throw new Error(red('✖') + ' Operation cancelled');
            },
        }
    ).catch((cancelled: any) => {
        console.log(cancelled.message);
        return null;
    });

    if (answers === null) {
        return;
    }

    const template = answers.template?.name || argTemplate;
    const overwrite = answers.overwrite || false;
    const packageName = answers.packageName || getProjectName(targetDir);

    const root = path.join(cwd, targetDir);

    if (overwrite) {
        clearDir(root);
    } else if (!fs.existsSync(root)) {
        fs.mkdirSync(root, { recursive: true });
    }

    console.log(`\nScaffolding project in ${root}...`);

    const templateDir = path.resolve(
        fileURLToPath(import.meta.url),
        '../..',
        `template-${template}`
    );

    const files = fs.readdirSync(templateDir);
    for (const file of files.filter((f) => f !== 'package.json')) {
        writeFile({ file, root, templateDir });
    }

    const pkg = JSON.parse(
        fs.readFileSync(path.join(templateDir, `package.json`), 'utf-8')
    );

    pkg.name = packageName;

    writeFile({
        file: 'package.json',
        content: JSON.stringify(pkg, null, 4) + '\n',
        root,
        templateDir,
    });

    createAppSettings({ templateDir, packageName, root });
    setupCharts({ packageName, root });

    logDoneMessage({ root });
}

main();
