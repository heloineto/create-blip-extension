import { reset } from 'kolorist';
import prompts from 'prompts';

type Properties = {
    projectName: string;
};

function packageName({
    projectName
}: Properties): prompts.PromptObject<'packageName'> {
    return {
        type: () => (isValidPackageName(projectName) ? null : 'text'),
        name: 'packageName',
        message: reset('Package name:'),
        initial: () => toValidPackageName(projectName),
        validate: (dir) =>
            isValidPackageName(dir) || 'Invalid package.json name'
    };
}

function isValidPackageName(projectName: string) {
    return /^(?:@[a-z\d\-*~][a-z\d\-*._~]*\/)?[a-z\d\-~][a-z\d\-._~]*$/.test(
        projectName
    );
}

function toValidPackageName(projectName: string) {
    return projectName
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/^[._]/, '')
        .replace(/[^a-z\d\-~]+/g, '-');
}

export default packageName;
