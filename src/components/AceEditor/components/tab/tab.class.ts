import { Component, Inject, Prop, Provide, Vue, Watch } from 'vue-property-decorator';
import { Row, Icon, Input, Tooltip } from 'ant-design-vue';

import AceEditor, { EditorMenuOption, Page } from '../..';
import { formatPageTitle } from '../../util';

Vue.use(Row);
Vue.use(Icon);
Vue.use(Input);
Vue.use(Tooltip);

@Component({
    name: 'AceEditorTab',
    inheritAttrs: !1,
    components: {
        'editor-action': () => import('../action/action.vue')
    }
})
export default class AceEditorTab extends Vue {
    @Inject()
        public getContext!: () => AceEditor;
    @Prop()
        public page!: Page;
    public get toggleDisabled() {
        return this.getContext().toggleDisabled || this.page.toggleDisabled;
    }
    public get addPageDisabled() {
        return this.getContext().addPageDisabled
    }
    public get closePageDisabled() {
        return this.getContext().closePageDisabled
    }
    public get menuSelections() :EditorMenuOption[] {
        return [{
            name: '关闭页面',
            type: 'closePage',
            attrs: {
                disabled: this.closePageDisabled || this.page.isFixed
            }
        }, {
            name: this.page.isFixed ? '取消固定' : '固定选项卡',
            type: 'changeIsFixed'
        }];
    }

    public selectMenuOption(option: EditorMenuOption) {
        if (option.type === 'closePage') {
            this.closePage();
        } else if(option.type === 'changeIsFixed') {
            this.page.isFixed = !this.page.isFixed;
        }

        return this;
    }

    public changePageTitle() {
        const page = this.page;
        page.title = formatPageTitle(page.title, page, !1);
    }

    private closePage() {
        const id = this.page.id;
        return this.getContext().closePage(id, !1);
    }
}