import prompts from 'prompts';
import { red } from 'kolorist';

function overwriteChecker(): prompts.PromptObject<'overwriteChecker'> {
    return {
        type: (_, previousResponses) => {
            const { overwrite } = previousResponses as { overwrite?: boolean };

            if (overwrite === false) {
                throw new Error(red('✖') + ' Operation cancelled');
            }
            return null;
        },
        name: 'overwriteChecker'
    };
}

export default overwriteChecker;
