import path from 'node:path';

function logDoneMessage({ root }: { root: string }) {
    console.log(`\nDone. Now run:\n`);

    if (root !== process.cwd()) {
        const cdProjectName = path.relative(process.cwd(), root);

        console.log(
            `  cd ${
                cdProjectName.includes(' ')
                    ? `"${cdProjectName}"`
                    : cdProjectName
            }`
        );
    }

    console.log('  git init');
    console.log('  npm install');
    console.log('  npm run start\n');
}

export default logDoneMessage;
