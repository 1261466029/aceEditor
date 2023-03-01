const path = require('path');

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

        config.resolve.alias.set('__ACE_EDITOR__', path.resolve(__dirname, 'src/components/AceEditor'));
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
