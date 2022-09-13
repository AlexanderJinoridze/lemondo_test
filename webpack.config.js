const path = require("path");
const HTMLWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

const isDev = process.env.NODE_ENV === "development";
const isProd = !isDev;

const filename = ext => (isDev ? `[name].${ext}` : `[name].[hash].${ext}`);

const optimization = () => {
    const config = {
        splitChunks: {
            chunks: "all",
        },
    };

    if (isProd) {
        config.minimize = true;
        config.minimizer = [`...`, new CssMinimizerPlugin()];
    }

    return config;
};

const cssLoaders = extra => {
    const loaders = [
        {
            loader: MiniCssExtractPlugin.loader,
            options: {},
        },
        {
            loader: "css-loader",
            options: { url: true, sourceMap: true },
        },
        "postcss-loader",
    ];

    if (extra) {
        loaders.push(extra);
    }

    return loaders;
};

const plugins = () => {
    const base = [
        new HTMLWebpackPlugin({
            template: "./pages/index.html",
            inject: false,
            minify: {
                removeStyleLinkTypeAttributes: false,
                removeScriptTypeAttributes: false,
                collapseWhitespace: isProd,
            },
        }),
        new CleanWebpackPlugin(),
        new MiniCssExtractPlugin({
            filename: filename("css"),
        }),
    ];

    return base;
};

module.exports = {
    target: "web",
    context: path.join(__dirname, "src"),
    entry: "./index.js",
    output: {
        filename: filename("js"),
        path: path.join(__dirname, "dist"),
    },
    optimization: optimization(),
    devServer: {
        hot: false,
        liveReload: false,
        port: 4200,
    },
    devtool: isDev ? "source-map" : false,
    plugins: plugins(),
    module: {
        rules: [
            {
                test: /\.css$/,
                use: cssLoaders(),
            },
            {
                test: /\.s[ac]ss$/,
                use: cssLoaders("sass-loader"),
            },
            {
                test: /\.(png|jpg|jpeg|svg|gif)$/,
                type: "asset/inline",
            },
            {
                test: /\.(ttf|woff|woff2|eot)$/,
                type: "asset/resource",
            },
            {
                test: /\.m?js$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ["@babel/preset-env"],
                    },
                },
            },
        ],
    },
};