module.exports = {
    inputDir: "./src/icons", // (required)
    outputDir: "./src/fonts/icons", // (required)
    fontTypes: ["eot", "svg", "ttf", "woff2", "woff"],
    assetTypes: ['css'],
    fontsUrl: "../fonts/icons",
    pathOptions: {
        css: "./src/scss/icons.scss",
    },
    getIconId: ({
        basename,
        relativeDirPath,
        absoluteFilePath,
        relativeFilePath,
        index,
    }) => [basename].join("_"),
};
