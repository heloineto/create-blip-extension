import fs from 'node:fs';
import path from 'node:path';
import writeFile from './writeFile.js';

interface Properties {
    root: string;
    templateDir: string;
    packageName: string;
}

const createAppSettings = ({ templateDir, packageName, root }: Properties) => {
    const appSettings = JSON.parse(
        fs.readFileSync(
            path.join(templateDir, '/src/config/appsettings.json'),
            'utf-8'
        )
    );

    appSettings.segment.prefix = packageName.startsWith('blip-')
        ? packageName.replace('blip-', '')
        : packageName;

    writeFile({
        file: '/src/config/appsettings.json',
        content: JSON.stringify(appSettings, null, 4) + '\n',
        root,
        templateDir,
    });

    appSettings.env = 'dev';

    writeFile({
        file: '/src/config/appsettings.development.json',
        content: JSON.stringify(appSettings, null, 4) + '\n',
        root,
        templateDir,
    });
};

export default createAppSettings;
