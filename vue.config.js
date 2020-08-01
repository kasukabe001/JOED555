module.exports = {
  publicPath: './',
  productionSourceMap: false,
  configureWebpack: {
    devtool: 'source-map',
    target: 'web', // 'electron-main'
    optimization: {
      splitChunks: {
        maxSize: 5000000
      }
    }
  }
}
