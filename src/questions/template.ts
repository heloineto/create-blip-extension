import prompts from 'prompts';
import { reset } from 'kolorist';
import templates from '../utils/templates.js';

const templateNames = templates.map(({ name }) => name);

type Properties = {
    argTemplate: string | undefined;
};

function template({
    argTemplate
}: Properties): prompts.PromptObject<'template'> {
    return {
        type:
            argTemplate && templateNames.includes(argTemplate)
                ? null
                : 'select',
        name: 'template',
        message:
            typeof argTemplate === 'string' &&
            !templateNames.includes(argTemplate)
                ? reset(
                      `"${argTemplate}" isn't a valid template. Please choose from below: `
                  )
                : reset('Select a template:'),
        initial: 0,
        choices: templates.map((template) => {
            const templateColor = template.color;

            return {
                title: templateColor(template.display),
                value: template
            };
        })
    };
}

export default template;
