import template from './template.js';
import overwrite from './overwrite.js';
import overwriteChecker from './overwriteChecker.js';
import packageName from './packageName.js';
import projectName from './projectName.js';

const questions = {
    projectName,
    overwrite,
    overwriteChecker,
    packageName,
    template,
};

export default questions;
