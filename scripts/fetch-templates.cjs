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

    // TODO: change the 'env' property to 'dev'
    fs.copyFileSync(
        path.join(templatePath, '/src/config/appsettings.json'),
        path.join(templatePath, '/src/config/appsettings.development.json')
    );

    // get the package.json
    const packageJson = require(path.join(templatePath, '/package.json'));
    // Remove the postinstall script from package.json
    delete packageJson.scripts.postinstall;

    // Overwrite the package.json
    fs.writeFileSync(
        path.join(templatePath, '/package.json'),
        JSON.stringify(packageJson, null, 4)
    );
};

const fetchTemplates = () => {
    fetchTemplate('typescript');
    fetchTemplate('javascript');
};

fetchTemplates();
