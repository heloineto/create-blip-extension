const { execSync } = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs');
const cwd = process.cwd();

const fetchTemplate = (branch) => {
    const templateName = `template-${branch}`;
    const templatePath = path.join(cwd, templateName);

    execSync(
        `npx degit heloineto/blip-extension-template#${branch} ${templateName} --force`
    );

    fs.renameSync(
        path.join(templatePath, '.gitignore'),
        path.join(templatePath, '_gitignore')
    );

    const appSettings = require(path.join(templatePath, '/src/config/appsettings.json'));
    appSettings.env = 'dev';

    // Overwrite the package.json
    fs.writeFileSync(
        path.join(templatePath, '/src/config/appsettings.development.json'),
        JSON.stringify(appSettings, null, 4)
    );
};

const fetchTemplates = () => {
    fetchTemplate('typescript');
    fetchTemplate('javascript');
};

fetchTemplates();
