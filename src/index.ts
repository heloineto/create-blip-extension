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
import copyFileSystemNode from './utils/copyFileSystemNode.js';

type Answers = Partial<{
    template: Template;
    overwrite: boolean;
    packageName: string;
    projectName: string;
}>;

const renameFiles: Record<string, string | undefined> = {
    _gitignore: '.gitignore'
};

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

    const template = answers.template?.name || argTemplate;
    const overwrite = answers.overwrite || false;
    const packageName = answers.packageName || projectName;

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

    const write = (file: string, content?: string) => {
        const targetPath = path.join(root, renameFiles[file] ?? file);
        if (content) {
            fs.writeFileSync(targetPath, content);
        } else {
            copyFileSystemNode(path.join(templateDir, file), targetPath);
        }
    };

    const files = fs.readdirSync(templateDir);
    for (const file of files.filter((f) => f !== 'package.json')) {
        write(file);
    }

    const pkg = JSON.parse(
        fs.readFileSync(path.join(templateDir, `package.json`), 'utf-8')
    );

    pkg.name = packageName;

    write('package.json', JSON.stringify(pkg, null, 4) + '\n');

    // const appSettings = JSON.parse(
    //     fs.readFileSync(
    //         path.join(templateDir, '/src/config/appsettings.json'),
    //         'utf-8'
    //     )
    // );

    // appSettings.segment.prefix = packageName.startsWith('blip-')
    //     ? packageName.replace('blip-', '')
    //     : packageName;

    // console.log('templatePath', appSettings);

    // write('package.json', JSON.stringify(pkg, null, 4) + '\n');

    // fs.copyFileSync(
    //     path.join(templatePath, '/src/config/appsettings.json'),
    //     path.join(templatePath, '/src/config/appsettings.development.json')
    // );

    logDoneMessage({ root });
}

main();
