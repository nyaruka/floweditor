const paths = require('../webpack/paths');
const { typingsForCssModulesLoader, postCSSLoader } = require('../webpack/loaders');

module.exports = (baseConfig, env, config) => {
    config.module.rules.push({
        test: /\.(ts|tsx)$/,
        loader: require.resolve('awesome-typescript-loader')
    });
    config.module.rules.push(
        {
            test: /\.s?css$/,
            include: [paths.component],
            use: ['style-loader', typingsForCssModulesLoader(), postCSSLoader, 'sass-loader']
        },
        {
            test: /\.s?css$/,
            include: [paths.lib],
            exclude: [paths.component],
            use: ['style-loader', 'css-loader', postCSSLoader, 'sass-loader']
        }
    );
    config.resolve.extensions.push('.ts', '.tsx');
    return config;
};
