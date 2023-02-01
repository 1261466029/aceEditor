const path = require('path');
const compressionWebpackPlugin = require('compression-webpack-plugin');
const productionGzipExtensions = /\.(js|css|json|txt|html|htm|ico|svg)(\?.*)?$/i;

module.exports = {
    publicPath: '',
    lintOnSave: !1,
    runtimeCompiler: !0,
    productionSourceMap: !1,
    parallel: !0,
    chainWebpack: config => {
        const svgRule = config.module.rule('svg');
        svgRule.uses.clear();
        svgRule.use('vue-svg-loader').loader('vue-svg-loader');
    },
    
    css: {
        requireModuleExtension: !0,
    },

    pluginOptions: {
      	'style-resources-loader': {
			preProcessor: 'less',
			patterns: [
				'src/static/less/base.less',
			],
		}
    }
}
