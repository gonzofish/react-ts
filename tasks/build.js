// tsc && rollup
'use strict';

const path = require('path');

const rollup = require('./rollup');
const tsc = require('./tsc');


const compile = () => Promise.all([2015, 5].map((type) =>
    tsc(root('configs', `tsconfig.es${ type }.json`))
));

const root = (...args) =>
    path.resolve.apply(
        null,
        [__dirname, '..'].concat(args)
    );
const libName = require(root('package.json')).name;

const _rollup = () => rollup(libName, {
    dist: root('dist'),
    es2015: root('out-tsc', 'es2015'),
    es5: root('out-tsc', 'es5'),
    root: root()
});

return Promise.resolve()
    .then(compile)
    .then(rollup)
    .catch((error) => {
        console.error(error);
    });
