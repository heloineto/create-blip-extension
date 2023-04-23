import { reset } from 'kolorist';
import formatTargetDir from '../formatTargetDir.js';
import { DEFAULT_TARGET_DIR } from '../constants.js';
import prompts from 'prompts';

type Properties = {
    argTargetDir: string | undefined;
    onChange: (targetDir: string) => void;
};

function projectName({
    argTargetDir,
    onChange
}: Properties): prompts.PromptObject<'projectName'> {
    return {
        type: argTargetDir ? null : 'text',
        name: 'projectName',
        message: reset('Project name:'),
        initial: DEFAULT_TARGET_DIR,
        onState: (state) => {
            const targetDir =
                formatTargetDir(state.value) || DEFAULT_TARGET_DIR;

            onChange(targetDir);
        }
    };
}

export default projectName;
