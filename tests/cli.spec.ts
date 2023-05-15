import { join } from 'node:path';
import type { ExecaSyncReturnValue, SyncOptions } from 'execa';
import { execaCommandSync } from 'execa';
import fs from 'fs-extra';
import { afterEach, beforeAll, expect, test } from 'vitest';

const CLI_PATH = join(__dirname, '..');

const projectName = 'test-app';
const genPath = join(__dirname, projectName);

const run = (
    args: string[],
    options: SyncOptions = {}
): ExecaSyncReturnValue => {
    return execaCommandSync(`node ${CLI_PATH} ${args.join(' ')}`, options);
};

const createNonEmptyDir = () => {
    fs.mkdirpSync(genPath);

    const pkgJson = join(genPath, 'package.json');
    fs.writeFileSync(pkgJson, '{ "foo": "bar" }');
};

const templates = ['javascript', 'typescript'] as const;

type TemplateFiles = Record<(typeof templates)[number], string[]>;

const templateFiles = templates.reduce((acc, template) => {
    const files = fs
        .readdirSync(join(CLI_PATH, `template-${template}`))
        .map((filePath) =>
            filePath === '_gitignore' ? '.gitignore' : filePath
        )
        .sort();

    return {
        ...acc,
        [template]: files
    };
}, {}) as TemplateFiles;

beforeAll(() => fs.remove(genPath));
afterEach(() => fs.remove(genPath));

test('prompts for the project name if none supplied', () => {
    const { stdout } = run([]);
    expect(stdout).toContain('Project name:');
});

test('prompts for the template if none supplied when target dir is current directory', () => {
    fs.mkdirpSync(genPath);
    const { stdout } = run(['.'], { cwd: genPath });
    expect(stdout).toContain('Select a template:');
});

test('prompts for the template if none supplied', () => {
    const { stdout } = run([projectName]);
    expect(stdout).toContain('Select a template:');
});

test('prompts for the template on not supplying a value for --template', () => {
    const { stdout } = run([projectName, '--template']);
    expect(stdout).toContain('Select a template:');
});

test('prompts for the template on supplying an invalid template', () => {
    const { stdout } = run([projectName, '--template', 'unknown']);
    expect(stdout).toContain(
        `"unknown" isn't a valid template. Please choose from below:`
    );
});

test('asks to overwrite non-empty target directory', () => {
    createNonEmptyDir();
    const { stdout } = run([projectName], { cwd: __dirname });
    expect(stdout).toContain(`Target directory "${projectName}" is not empty.`);
});

test('asks to overwrite non-empty current directory', () => {
    createNonEmptyDir();
    const { stdout } = run(['.'], { cwd: genPath });
    expect(stdout).toContain(`Current directory is not empty.`);
});

test('successfully scaffolds a project based on the starter templates', () => {
    for (const template of templates) {
        const { stdout } = run([projectName, '--template', template], {
            cwd: __dirname
        });
        const generatedFiles = fs.readdirSync(genPath).sort();

        expect(stdout).toContain(`Scaffolding project in ${genPath}`);
        expect(templateFiles[template]).toEqual(generatedFiles);

        fs.removeSync(genPath);
    }
});

test('works with the -t alias', () => {
    const { stdout } = run([projectName, '-t', 'typescript'], {
        cwd: __dirname
    });
    const generatedFiles = fs.readdirSync(genPath).sort();

    expect(stdout).toContain(`Scaffolding project in ${genPath}`);
    expect(templateFiles['typescript']).toEqual(generatedFiles);
});

test('changes the package name and prefix', () => {
    const { stdout } = run([projectName, '-t', 'typescript'], {
        cwd: __dirname
    });

    const readJson = (file: string) => {
        const filePath = join(genPath, file);

        return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    };

    const pkgJson = readJson('package.json');

    expect(pkgJson.name).toBe(projectName);

    const appSettingsJson = readJson('src/config/appsettings.json');

    const prefix = projectName.startsWith('blip-')
        ? projectName.replace('blip-', '')
        : projectName;

    expect(appSettingsJson.env).toBe('prd');
    expect(appSettingsJson.segment.prefix).toBe(prefix);

    const appSettingsDevJson = readJson(
        'src/config/appsettings.development.json'
    );

    expect(appSettingsDevJson.env).toBe('dev');
    expect(appSettingsDevJson.segment.prefix).toBe(prefix);
});
