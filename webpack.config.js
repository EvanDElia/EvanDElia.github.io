const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const dist = path.join(__dirname, 'dist');

module.exports = (env = {}) => {
    const isEnvProduction = !!env.prod;
    const isEnvDevelopment = !isEnvProduction;

    const webpackConfig = {
        mode: isEnvDevelopment ? 'development' : 'production',
        output: {
            path: dist,
            filename: 'scripts.js'
        },
        entry: './src/index.js',
        devtool: isEnvDevelopment ? 'cheap-module-source-map' : 'hidden-source-map',
        resolve: {
            extensions: ['.js', '.json', '.ts', '.tsx'],
        },
        plugins: [
            new MiniCssExtractPlugin({
                filename: 'styles.css'
            }),
            new HtmlWebpackPlugin({
                filename: 'index.html',
                template: path.join('src', 'index.ejs'),
            }),
        ],
        module: {
            rules: [
                {
                    test: /\.m?js$/,
                    exclude: /(node_modules)/,
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                        cacheDirectory: true,
                    }
                },
                {
                    test: /\.(le|c)ss$/,
                    exclude: /node_modules/,
                    use: [ {
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            hmr: !!isEnvDevelopment,
                        },
                    },
                        'css-loader',
                        'postcss-loader',
                        'less-loader',
                    ]
                },
            ]
        }
    }

    if (isEnvDevelopment) {

        webpackConfig.resolve.alias = {
            ...webpackConfig.resolve.alias
        };

        // add devServer config in dev mode
        // https key and cert are only generated for dev
        webpackConfig.devServer = {
            contentBase: dist,
            compress: true,
            host: 'localhost',
            hot: true,
            port: 8080,
            stats: {
                colors: true,
                chunks: false,
            },
            before(app, server, compiler) {
                const watchFiles = ['.ejs', '.html'];

                compiler.plugin('done', () => {
                    const changedFiles = Object.keys(compiler.watchFileSystem.watcher.mtimes);

                    if (changedFiles.some(filePath => watchFiles.includes(path.parse(filePath).ext))) {
                        server.sockWrite(server.sockets, 'content-changed');
                    }
                });
            }
        };
    }

    return webpackConfig;
}