import { Component, Inject, Prop, Provide, Vue, Watch } from 'vue-property-decorator';
import { Row } from 'ant-design-vue';

import AceEditor, { EditorConfiguration, EditorMenuOption } from '../..';

Vue.use(Row);

@Component({
    name: 'AceEditorFooter',
    inheritAttrs: !1,
    components: {
        'editor-action': () => import('../action/action.vue')
    }
})
export default class AceEditorFooter extends Vue {
    @Inject()
        public getContext!: () => AceEditor;
    @Inject()
        public getConfig!: () => EditorConfiguration;

    public newLineModeSelections: EditorMenuOption[] = [{
        name: 'auto', type: 'auto'
    }, {
        name: 'unix', type: 'unix'
    }, {
        name: 'windows', type: 'windows'
    }];
    public tabSizeSelections: EditorMenuOption[] = [{
        name: '2空格', type: 2
    }, {
        name: '4空格', type: 4
    }];
    public get showFooter() {
        return this.getContext().showFooter;
    }
    public get modeSelections() :EditorMenuOption[] {
        return this.getConfig().supported.modes.map(({ name, id }) => ({
            name,
            type: id
        }));
    }
    public get enableThemeChange() {
        return this.getContext().enableThemeChange;
    }
    public get enableModeChange() {
        return this.getContext().enableModeChange;
    }
    public get themeSelections() :EditorMenuOption[] {
        return this.getConfig().supported.themes.map(({ theme }) => ({
            name: theme,
            type: theme
        }))
    }
    public get config() {
        return this.getConfig();
    }

    public setUseWrapMode(useWrapMode: boolean) {
        this.getContext().setUseWrapMode(useWrapMode);
    }

    public setNewLineMode(newLineMode: string) {
        this.getContext().setNewLineMode(newLineMode);
    }

    public setTabSize(tabSize: number) {
        this.getContext().setTabSize(tabSize);
    }

    public setMode(modeId: string) {
        this.getContext().setMode(modeId, !1);
    }

    public setTheme(theme: string) {
        this.getContext().setTheme(theme);
    }
}