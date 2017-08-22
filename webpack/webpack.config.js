module.exports = {
    devtool: 'source-map',
    entry: './src/index.tsx',
    externals: {
        react: 'React',
        'react-dom': 'ReactDOM'
    },
    module: {
        rules: [
            { enforce: 'pre', test: /\.js$/, use: 'source-map-loader' },
            { test: /\.tsx?$/, use: 'awesome-typescript-loader' }
        ]
    },
    output: {
        filename: 'bundle.js',
        path: __dirname + '/dist'
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.json']
    }
};
