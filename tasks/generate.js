'use strict';

const fs = require('fs-extra');
const path = require('path');
const readline = require('readline');

const root = (...args) => path.join.apply(null, [process.cwd()].concat(args));
const src = (...args) => root.apply(null, ['src'].concat(args));
const components = (...args) => src.apply(null, ['components'].concat(args));

module.exports = (type, tag) => {
    const remains = getRemainingQuestions(type, tag);

    return ask(remains.questions)
        .then((answers) => build(Object.assign(answers, remains.answers)))
        .catch(console.error);
};

const getRemainingQuestions = (type, tag) => {
    const questions = [
        getRemainingType(type),
        getRemainingTag(tag)
    ];

    return questions.reduce((remains, question) => {
        remains.answers = Object.assign(remains.answers, question.answers || {});
        remains.questions = remains.questions.concat(question.questions || []);

        return remains;
    }, {
        answers: [],
        questions: []
    });
};

const getRemainingType = (type) => {
    type = getType(type);

    if (type) {
        return {
            answers: {
                type
            }
        };
    } else {
        return {
            questions: [
                { name: 'type', question: 'Component type:', test: checkIsValidType, transform: getType }
            ]
        };
    }
};

const getType = (type) => {
    switch(type) {
        case 'c':
        case 'cl':
        case 'class':
            return 'class';
        case 'f':
        case 'fn':
        case 'func':
        case 'function':
        case 'functional':
            return 'functional';
        default:
            return '';
    }
};

const checkIsValidType = (type) =>
    [
        'c', 'cl', 'class',
        'f', 'fn', 'func', 'function', 'functional'
    ].indexOf(type.trim()) !== -1;

const getRemainingTag = (tag) => {
    if (tag) {
        return {
            answers: {
                tag
            }
        };
    } else {
        return {
            questions: [
                { name: 'tag', question: 'Tag name (in dash-case):', test: checkIsValidTag }
            ]
        };
    }
};

const checkIsValidTag = (value) =>
    /^[a-z](\-?[a-z0-9])+$/i.test(value);

const ask = (questions, reader) => {
    if (questions.length > 0) {
        return askNextQuestion(questions, reader);
    } else {
        return Promise.resolve({});
    }
};

const askNextQuestion = (questions, reader) => new Promise((resolve) => {
    const question = questions[0];
    const { answer, name } = question;
    const test = getFunctionFallback(question.test, () => true);
    const transform = getFunctionFallback(question.transform, (value) => value);
    reader = createReader(reader);

    reader.question(question.question.trim() + ' ', (answer) => {
        if (test(answer)) {
            ask(questions.slice(1), reader)
                .then((answers) => Object.assign({ [name]: transform(answer) }, answers))
                .then(resolve)
                .then(() => reader.close());
        } else {
            ask(questions, reader).then((answers) => resolve(answers));
        }
    });
});

const getFunctionFallback = (fn, fallback) => {
    if (typeof fn !== 'function') {
        fn = fallback;
    }

    return fn;
};

const createReader = (reader) => {
    if (!reader) {
        reader = readline.createInterface({
            input: process.stdin,
            output: process.stdin
        });
    }

    return reader;
};


const build = (answers) => {
    const { tag, type } = answers;
    const pascalTag = dashToPascal(tag);

    createFile(components(`${ pascalTag }.tsx`), getComponent(pascalTag, type));
    createFile(components('__tests__', `${ pascalTag }.spec.tsx`), getSpec(pascalTag));
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

const getComponent = (tag, type) =>
    type === 'class' ? getClassComponent(tag) : getFunctionalComponent(tag);

const getClassComponent = (tag) =>
`import React from 'react';

export class ${ tag } extends React.Component<any, undefined> {
    render() {
        return ${ getDOM(tag) };
    }
}

`;

const getFunctionalComponent = (tag) =>
`import React from 'react';

export const ${ tag } = (props: any) =>
    ${ getDOM(tag) }

`;

const getDOM = (tag) => `<div>${ tag }</div>;`;

const getSpec = (tag) =>
`import from 'react';
import { shallow } from 'enzyme';

import { ${ tag } } from '../${ tag }';

describe('Component: ${ tag }', () => {
    test('should render without error', () => {
        expect(shallow(<${ tag } />).contains('<div>${ tag }</div>')).toBe(true);
    });
});

`;

if (!module.parent) {
    module.exports.apply(null, Array.from(process.argv).slice(2));
}
