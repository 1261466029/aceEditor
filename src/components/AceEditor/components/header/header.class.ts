import { Component, Inject, Prop, Provide, Vue, Watch } from 'vue-property-decorator';
import { Row, Icon, Tooltip } from 'ant-design-vue';

import AceEditor, { EditorConfiguration, EditorMenuOption } from '../..';
import { createID } from '../../util';

Vue.use(Row);
Vue.use(Icon);
Vue.use(Tooltip);

@Component({
    name: 'AceEditorHeader',
    inheritAttrs: !1,
    components: {
        'editor-tab': () => import('../tab/tab.vue'),
        'editor-action': () => import('../action/action.vue')
    }
})
export default class AceEditorHeader extends Vue {
    @Inject()
        public getContext!: () => AceEditor;
    @Inject()
        public getConfig!: () => EditorConfiguration;

    public get showHeader() {
        return this.getContext().showHeader;
    }
    public get showActions() {
        return this.getContext().showActions;
    }
    public get toggleDisabled() {
        return this.getContext().toggleDisabled;
    }
    public get name() {
        return this.getContext().name;
    }
    public get hoverTitle() {
        return this.getContext().hoverTitle || this.getContext().name;
    }
    public get pages() {
        return this.getContext().pages;
    }
    public get hasActionsSlot() {
        return !!this.$scopedSlots?.default;
    }
    public get addPageDisabled() {
        return this.getContext().addPageDisabled
    }
    public get closePageDisabled() {
        return this.getContext().closePageDisabled
    }
    public get modeSelections() :EditorMenuOption[] {
        return this.getConfig().supported.modes.map(({ name, id }) => ({
            name,
            type: id
        }))
    }

    public selectMode(modeId: string) {
        return this.getContext().setPage({
            id: createID(),
            title: '',
            hoverTitle: '',
            modeId,
            value: '',
            active: !1,
            isFixed: !1,
            passive: !1,
            toggleDisabled: !1,
            inputTitleDisabled: !1,
            options: {},
            freezing: {
                ranges: [],
                markers: []
            }
        });
    }
}