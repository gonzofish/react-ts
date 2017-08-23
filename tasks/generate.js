'use strict';

const fs = require('fs-extra');
const path = require('path');
const readline = require('readline');

const root = (...args) => path.join.apply(null, [process.cwd()].concat(args));
const src = (...args) => root.apply(null, ['src'].concat(args));
const components = (...args) => src.apply(null, ['components'].concat(args));

module.exports = (tag) => {
    if (!tag) {
        askForTag().then(build);
    } else {
        build(tag);
    }
};

const askForTag = (reader) => new Promise((resolve, reject) => {
    if (!reader) {
        reader = readline.createInterface({
            input: process.stdin,
            output: process.stdin
        });
    }

    reader.question('What is the tag (in dash-case)? ', (answer) => {
        if (checkIsValidTag(answer)) {
            resolve(answer.toLowerCase());
            reader.close();
        } else {
            process.stdout.write('  Tag is not dash-case\n');
            askForTag(reader).then(resolve);
        }
    });
});

const checkIsValidTag = (value) =>
    /^[a-z](\-?[a-z0-9])+$/i.test(value);

const build = (dashTag) => {
    // add src/components/{ tag }.tsx
    // add src/components/__tests__/{ tag }.spec.tsx
    const tag = dashToPascal(dashTag);

    createFile(components(`${ tag }.tsx`), getComponent(tag));
    createFile(components('__tests__', `${ tag }.spec.tsx`), getSpec(tag));
};

const dashToPascal = (value, replaceChar = '') =>
    value[0].toUpperCase() + value.slice(1).replace(/(-.)/g, (match) =>
        match.replace('-', replaceChar).toUpperCase()
    );

const createFile = (filename, contents) => {
    if (!fs.existsSync(filename)) {
        fs.writeFileSync(filename, contents);
    }
};

const getComponent = (tag) =>
`import * as React from 'react';

export class ${ tag } extends React.Component<any, undefined> {
    render() {
        return <span>${ tag }</span>;
    }
}

`;

const getSpec = (tag) =>
`import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { ${ tag } } from '../${ tag }';

describe('Component: ${ tag }', () => {
    test('renders', () => {
        const div = document.createElement('div');

        ReactDOM.render(
            <${ tag } />,
            div
        );
    });
});

`;

if (!module.parent) {
    module.exports.apply(null, Array.from(process.argv).slice(2));
}
