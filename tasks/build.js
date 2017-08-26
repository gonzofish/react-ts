// tsc && rollup
'use strict';

const path = require('path');

const rollup = require('./rollup');
const tsc = require('./tsc');


const compile = () => Promise.all([2015, 5].map((type) =>
    tsc(root('configs', `tsconfig.es${ type }.json`))
));

const root = (...args) => path.resolve.apply(
    null,
    [__dirname, '..'].concat(args)
);
const pkg = require(root('package.json'));

const _rollup = () => rollup(pkg.name, {
    dist: root('dist'),
    es2015: root('out-tsc', 'es2015'),
    es5: root('out-tsc', 'es5'),
    root: root()
});

return Promise.resolve()
    .then(compile)
    .then(_rollup)
    .catch((error) => {
        console.error(error);
    });
