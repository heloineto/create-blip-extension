import { blue, yellow } from 'kolorist';

type ColorGetter = (str: string | number) => string;

export type Template = {
    name: string;
    display: string;
    color: ColorGetter;
};

const templates: Template[] = [
    {
        name: 'typescript',
        display: 'TypeScript',
        color: blue
    },
    {
        name: 'javascript',
        display: 'JavaScript',
        color: yellow
    }
];

export default templates;
