import { Component, Prop, Provide, Vue, Watch } from 'vue-property-decorator';
import { edit, Editor, EditSession, Range, UndoManager, acequire } from 'brace';

import {
    getModeConfigurationOption,
    getThemeConfigurationOption,
    includeMode,
    includeEditorThemePlugin,
    destroyPages,
    destroyEditor,
    validPageLimit,
    setSessionOptions,
    destroyPage,
    addFreezingRowsRanges,
    formatFreezingRowsRanges,
    removeFreezingRowsRanges,
    initPageDefaultTitle,
    refreshFreezingRowsRanges
} from '../util';
import { findIntersectingFreezingRowsRanges, formatAttrs, formatPageTitle, tryToResetFreezingMarkers } from '../util';
import AceEditor, { BasicPage, EditorConfiguration, EditorEvents, EditorModesProvider, EditorThemesProvider, Page } from '..';
import { FreezingException } from '@/exception';
    
const RangeConstructor = acequire('ace/range').Range;

require('brace/ext/language_tools');
require('brace/ext/searchbox');

@Component({
    name: 'AceEditorIndex',
    inheritAttrs: !1,
    components: {
        'editor-header': () => import('../components/header/header.vue'),
        'editor-footer': () => import('../components/footer/footer.vue')
    }
})
export default class AceEditorIndex extends Vue implements AceEditor {
    @Provide()
        private getContext() {
            return this;
        }
    @Provide()
        private getEditor() {
            return this.editor;
        }
    @Provide()
        private getConfig() {
            return this.config;
        }
    // 名称
    @Prop({
        default: ''
    })
        public name!: string;
    // 悬浮显示的名称
    @Prop({
        default: ''
    })
        public hoverTitle!: string;
    @Prop({
        default: !0
    }) 
        public showHeader!: boolean;
    @Prop({
        default: !0
    }) 
        public showFooter!: boolean;
    @Prop({
        default: !0
    }) 
        public showActions!: boolean;
    @Prop({
        default: () => EditorModesProvider.map(({ mode }) => mode)
    })
        public modes!: string[];
    @Prop({
        default: () => EditorThemesProvider.map(({ theme }) => theme)
    })
        public themes!: string[];
    @Prop({
        default: !1
    })
        public toggleDisabled!: boolean;
    @Prop({
        default: !0
    })
        public enableThemeChange!: boolean;
    @Prop({
        default: !0
    })
        public enableModeChange!: boolean;
    // 主题
    @Prop() 
        private theme!: string;
    @Prop({
        type: Array,
        default: () => [ -1, -1 ]
    }) 
        private pageLimit!: [ number, number ];
    @Watch('theme')
        public watchThemeHandler(theme: string) {
            this.setTheme(theme)
        }
    @Watch('activePage')
        public watchActivePageHandler(page: Page) {
            const { pages, config } = this;
            const { mode, session } = page;

            pages.forEach((item) => item.active = item === page);
        
            config.mode = mode;
            config.tabSize = session.getTabSize();
            config.newLineMode = session.getNewLineMode();
            config.useWrapMode = session.getUseWrapMode();
            this.changeActiveHistory.push(page);
        }
    @Watch('themes', {
        immediate: !0,
        deep: !0
    })
        public watchThemesHandler(themes: string[]) {
            this.setSupportedThemeArray(themes);
        }
    @Watch('modes', {
        immediate: !0,
        deep: !0
    })
        public watchModesHandler(modes: string[]) {
            this.setSupportedModeArray(modes);
        }
    
    /** 基本配置 */
    public config: EditorConfiguration = {
        // 当前主题
        theme: '',
        // 当前模式
        mode: 'text',
        // 页面样式类
        styleClazz: '',
        // tab 空格数
        tabSize: 4,
        // 换行模式
        newLineMode: 'auto',
        // 自动换行
        useWrapMode: !1,
        // 受支持的配置项
        supported: {
            // 模式数组
            modes: [],
            // 主题数组
            themes: []
        }
    };

    /** 页面数组 */
    public pages: Page[] = [];

    public activePage: Page|null = null;

    public get addPageDisabled() {
        return !this.validPageLimit(1, !1)
    }
    public get closePageDisabled() {
        return !this.validPageLimit(-1, !1)
    }

    /** 变更活跃的历史记录数组 */
    private changeActiveHistory: Page[] = [];

    /** 编辑器选项 */
    private options!: Record<string, unknown>;

    /** 编辑器实例 */
    private editor!: Editor;

    /** 刷新编辑器 */
    public refreshEditor() {
        this.destroyEditor(!1);
        this.initEditor();
    }

    /** 刷新编辑器选项 */
    public refreshOptions() {
        this.initOptions();
        this.editor.setOptions({
            ... this.options
        });
    }

    /** 清空页面 */
    public destroyPages() :Page[] {
        return destroyPages(this.pages);
    }

    /** 设置页面 */
    public setPage(item: BasicPage) {
        const passive = item.passive;
        if (!passive) {
            this.validPageLimit(1);
        }

        const page = this.initPage(item);
        if (!page) {
            return page;
        }

        const index = this.pages.push(page);
        page.index = index;

        this.watchPageHandles(page)

        if (!passive && !page.active) {
            this.autoChangePageActive(1);
        }
        
        this.changePageSession(page);
        return page;
    }

    /** 关闭页面 */
    public closePage(id: unknown, passive: boolean = !0) {
        const pages = this.pages;
        const pageEntry = this.getPageEntryById(id);
        if (!pageEntry) {
            return pageEntry;
        }

        const [ index, page ] = pageEntry;
        const { isFixed, active } = page;
        const findIndex = Number(index);
        if (!passive) {
            if (isFixed || !this.validPageLimit(-1, !1)) {
                return !1;
            }
        }

        destroyPage(page);
        pages.splice(findIndex, 1);

        if (active) {
            this.cleanChangeHistoryByPage(page)
            this.autoChangePageActive(-1);
        }

        return !0;
    }

    /**  */
    public setUseWrapMode(useWrapMode: boolean) {
        const editor = this.editor;

        editor.session.setUseWrapMode(useWrapMode)
        this.config.useWrapMode = useWrapMode
    }

    /** 设置换行模式 */
    public setNewLineMode(newLineMode: string) {
        const editor = this.editor;

        editor.session.setNewLineMode(newLineMode)
        this.config.newLineMode = newLineMode
    }

    /** 设置 tab 空格数 */
    public setTabSize(tabSize: number) {
        const editor = this.editor;

        editor.session.setTabSize(tabSize)
        this.config.tabSize = tabSize
    }

    /** 设置模式 */
    public setMode(mode: string, passive: boolean = !0) {
        const { enableModeChange, activePage, config } = this;
        if (mode && activePage) {
            if (passive || enableModeChange) {
                config.mode = activePage.mode = mode;
            }
        }
    }

    /** 设置主题 */
    public setTheme(theme: string) {
        const editor = this.editor;
        const match = includeEditorThemePlugin(theme)

        if (match && editor) {
            const { cssClass, namespace } = match;

            editor.setTheme(namespace);
            this.config.styleClazz = cssClass;
            this.config.theme = theme;
        }
    }

    /** 按 页面id 更新页面冻结行 */
    public setFreezingRangesByPageId(id: unknown, freezingRanges: Range[]) {
        const page = this.getPageById(id);
        if (page) {
            const ranges = page.freezing.ranges = [];
            
            addFreezingRowsRanges(ranges, ... freezingRanges);
            page.freezing.ranges = formatFreezingRowsRanges(ranges);

            refreshFreezingRowsRanges(page);
        }
    }

    /** 按 页面id 新增页面冻结行 */
    public addFreezingRangesByPageId(id: unknown, freezingRanges: Range[]) {
        const page = this.getPageById(id);
        if (page) {
            const ranges = page.freezing.ranges;
            
            addFreezingRowsRanges(ranges, ... freezingRanges);
            page.freezing.ranges = formatFreezingRowsRanges(ranges);

            refreshFreezingRowsRanges(page);
        }
    }

    /** 按 页面id 删除页面冻结行 */
    public removeFreezingRangesByPageId(id: unknown, freezingRanges: Range[]) {
        const page = this.getPageById(id);
        if (page) {
            const ranges = page.freezing.ranges;
            
            removeFreezingRowsRanges(ranges, ... freezingRanges);
            page.freezing.ranges = formatFreezingRowsRanges(ranges);

            refreshFreezingRowsRanges(page);
        }
    }

    /** 按 页面id 删除全部页面冻结行 */
    public removeAllFreezingRangesByPageId(id: unknown) {
        const page = this.getPageById(id);
        if (page) {
            page.freezing.ranges = [];
            refreshFreezingRowsRanges(page);
        }
    }

    /** 自动变更当前页面 */
    public autoChangePageActive(direction: number) {
        const { pages, changeActiveHistory } = this;
        const length = changeActiveHistory.length;
        const maxIndex = length - 1;

        const isCurrent = direction === 0;
        const isBack = direction < 0;
        let isForward = direction > 0;
        let current!: Page;

        if (isCurrent) {
            const match = pages.find(({ active }) => active);
            if (match) {
                current = match;
            } else {
                isForward = !0;
            }
        }
        
        if (isForward) {
            current = pages[pages.length - 1];
        } else if (isBack) {
            current = changeActiveHistory[maxIndex];
            changeActiveHistory.splice(maxIndex);
        }

        if (!current) {
            return !1;
        }

        this.changePageSession(current, !1);
        return !0;
    }

    /** 变更当前页面 */
    public changePageSession(page: Page, passive: boolean = !0) {
        const { active, session } = page;
        const editor = this.editor;

        if (!passive || active) {
            return editor?.setSession(session);   
        }
    }

    /** 按 id 获取页面 */
    public getPageById(id: unknown) {
        return this.pages.find((page) => id === page.id)
    }

    /** 按 id 获取页面及索引 */
    public getPageEntryById(id: unknown) {
        return Object.entries(this.pages).find(rows => id === rows[1].id)
    }

    /** 获取页面类型序号 */
    public getPageTypeIndex(mode: string) {
        return this.pages.filter((item) => item.mode === mode).length;
    }

    private mounted() {
        this.refreshEditor();
    }

    private beforeDestroy() {
        this.destroyEditor();
    }

    private setPageModeHandler(page: Page) {
        const { mode, typeIndex } = page;
        const modeConfigurationOption = getModeConfigurationOption(mode)
        if (!modeConfigurationOption) {
            return !1;
        }

        page.modeConfigurationOption = modeConfigurationOption;
        if (this.activePage === page) {
            this.setMode(mode)
        }

        const modeNamespace = includeMode(mode);
        page.session.setMode(modeNamespace)

        initPageDefaultTitle(typeIndex, modeConfigurationOption, 'default');
        return !0;
    }

    /** 监听页面句柄函数 */
    private watchPageHandles(page: Page) {
        page.unWatchHandles.push(
            this.$watch(() => page.active, () => this.changePageSession(page)),
            this.$watch(() => page.mode, () => this.setPageModeHandler(page)),
            this.$watch(() => page.options, (options: Record<string, unknown>) => setSessionOptions(page.session, options), {
                deep: !0
            })
        );
    }

    /** 初始化页面 */
    private initPage(item: BasicPage) :Page|false|void {
        const page = this.createPage(item)
        if (page) {
            const { modeConfigurationOption, typeIndex, defaultTitle, session, options, title } = page;
            if (!defaultTitle) {
                page.defaultTitle = initPageDefaultTitle(typeIndex, modeConfigurationOption, 'default');
            }
    
            setSessionOptions(session, options);
            refreshFreezingRowsRanges(page);
            this.rewriteEditorSessionFn(page);
            this.initEditorSessionDefaultEventListener(page);

            page.title = formatPageTitle(title, page);
        }

        return page;
    }

    private initEditorSessionDefaultEventListener(page: Page) {
        const session = page.session;
        // 处理冻结行
        session.on('change', (e: any) => {
            const { action, start, end } = e;
            tryToResetFreezingMarkers(page, action, start.row, end.row);
        })
    }

    private rewriteEditorSessionFn = (page: Page) => {
        const session = page.session;
        const { insert, remove, moveText } = session;
        
        session.insert = function(position, text) {
            const { row } = position;
            const freezingRowsRanges = page.freezing.ranges;
            const rowsRange = new RangeConstructor(row, 0, row, 0)
    
            if (!findIntersectingFreezingRowsRanges(freezingRowsRanges, rowsRange)) {
                return insert.call(this, position, text);
            } else {
                throw new FreezingException('Can\'t Insert Text In Frozen Line');
            }
        }
    
        session.remove = function(range) {
            const freezingRowsRanges = page.freezing.ranges;
            const rowsRange = range.clone();

            rowsRange.start.column = rowsRange.end.column = 0;
            if (!findIntersectingFreezingRowsRanges(freezingRowsRanges, rowsRange)) {
                return remove.call(this, range);
            } else {
                session.selection.clearSelection();
                throw new FreezingException('Can\'t Remove Text In Frozen Line');
            }
        }
    
        session.moveText = function(fromRange, toPosition) {
            const { row } = toPosition;
            const freezingRowsRanges = page.freezing.ranges;
            const toRange = new RangeConstructor(row, 0, row, 0);
            const fromRowsRange = fromRange.clone();

            fromRowsRange.start.column = fromRowsRange.end.column = 0;
            if (
                !findIntersectingFreezingRowsRanges(freezingRowsRanges, toRange) &&
                !findIntersectingFreezingRowsRanges(freezingRowsRanges, fromRowsRange)
            ) {
                return moveText.call(this, fromRange, toPosition);
            }
    
            return fromRange;
        }
    }

    /** 生成页面 */
    private createPage(item: BasicPage) :Page|false|void {
        const { mode, value, id } = item;
        const modeNamespace = includeMode(mode);

        if (this.getPageById(id)) {
            return !1;
        }

        const modeConfigurationOption = getModeConfigurationOption(mode);
        if (!modeConfigurationOption) {
            return ;
        }

        const session = new EditSession(value ?? '', modeNamespace);

        const undoManager = new UndoManager;
        session.setUndoManager(undoManager);

        const typeIndex = this.getPageTypeIndex(mode);
        return {
            ... item,
            index: 0,
            session,
            typeIndex,
            undoManager,
            modeConfigurationOption,
            unWatchHandles: []
        }
    }

    /** 初始化编辑器 */
    private initEditor() {
        const editor = edit(this.getEditorElement());
        this.editor = editor;

        const theme = this.theme;
        this.setTheme(theme);

        this.refreshOptions();

        this.initEditorDefaultCommand();
        this.initEditorDefaultEventListener();
        this.initEditorEventListener();
        
        this.autoChangePageActive(0);
        
        this.$emit('ready', this);
        return editor;
    }

    // 初始化编辑器事件监听
    private initEditorEventListener() {
        const editor = this.editor;
        EditorEvents.forEach((event) => {
            editor.on(event, (... args) => {
                this.$emit(`editor-${event}`, ... args);
            })
        })
    }

    /** 初始化编辑器默认事件监听 */
    private initEditorDefaultEventListener() {
        const editor = this.editor;
        editor.on('changeSession', (e) => {
            const { session } = e
            const match = this.pages.find((item) => item.session === session);
            if (match) {
                this.activePage = match;
            }
        })
    }

    /** 初始化编辑器命令行 */
    private initEditorDefaultCommand() {
        const editor = this.editor;
        editor.commands.addCommand({
            name: 'SaveFile',
            bindKey: {win: 'Ctrl-S',  mac: 'Command-S'},
            exec: () => {
                // ... do somethings
            },
            readOnly: !0
        });
    }

    /** 初始化编辑器选项 */
    private initOptions() {
        this.options = formatAttrs(this.$attrs);
    }

    /** 按 页面 清除变更历史 */
    private cleanChangeHistoryByPage(match: Page) {
        this.changeActiveHistory = this.changeActiveHistory.flatMap(page => {
            if (page === match) {
                return [];
            }

            return [ page ];
        })
    }

    /** 销毁编辑器 */
    private destroyEditor(passive: boolean = !0) {
        const { editor, pages } = this;

        editor && destroyEditor(editor);
        passive && destroyPages(pages);
    }
    
    /** 设置编辑器可支持的语言数组 */
    private setSupportedModeArray(modes: string[]) {
        this.config.supported.modes = modes.flatMap(mode => {
            const result = [];
            const match = getModeConfigurationOption(mode)
            if (match) {
                result.push(match)
            }

            return result;
        })

        return this;
    }

    /** 验证页面数量限制 */
    private validPageLimit(inc: number, throwError: boolean = !0) :boolean {
        const { pages, pageLimit } = this;
        const length = pages.length;

        return validPageLimit(length, pageLimit, inc, throwError);
    }
    
    /** 设置编辑器可支持的主题数组 */
    private setSupportedThemeArray(themes: string[]) {
        this.config.supported.themes = themes.flatMap(theme => {
            const result = [];
            const match = getThemeConfigurationOption(theme)
            if (match) {
                result.push(match)
            }

            return result;
        })
    }

    private getEditorElement() {
        return this.$refs['editor'] as HTMLElement;
    }
}