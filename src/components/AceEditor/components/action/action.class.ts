import { Component, Inject, Prop, Provide, Vue, Watch } from 'vue-property-decorator';
import { Dropdown, Menu } from 'ant-design-vue';

import AceEditor, { EditorMenuOption } from '../..';

Vue.use(Dropdown)
Vue.use(Menu)

@Component({
    name: 'AceEditorAction',
    inheritAttrs: !1
})
export default class AceEditorAction extends Vue {
    @Inject()
        public getContext!: () => AceEditor;
    @Prop() public title!: string;
    @Prop({
        default: !1
    })
        public disabled!: boolean;
    @Prop({
        default: () => ['contextmenu']
    })
        public trigger!: string[];
    @Prop({
        default: () => []
    })
        public items!: EditorMenuOption[];
    @Prop()
        public itemStyle!: string|(string|Record<string, unknown>)[]|Record<string, unknown>;
}