import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { Row, Col, Icon, Input, Dropdown, Menu, Tooltip } from 'ant-design-vue';
import * as ace from 'brace';

import { includeTheme } from '@/plugin/aceEditor/index';

require('brace/ext/language_tools');
require('brace/ext/searchbox');

Vue.use(Row);
Vue.use(Col);
Vue.use(Icon);
Vue.use(Input);
Vue.use(Dropdown);
Vue.use(Menu);
Vue.use(Tooltip);

export type FreezingRowsRangeType = [ number, number ];

export interface ModeConfigInterface {
    suffix: string;
    mode: string;
    name: string;
    defaultTitle?: string;
}

export interface ThemeConfigInterface {
    theme: string;
    internal: boolean;
}

export interface PageInterface {
    id: unknown;
    mode: string;
    title: string;
    defaultTitle: string;
    inputTitleDisabled: boolean;
    session: ace.IEditSession;
    active: boolean;
    isFixed: boolean;
    suffix: string;
    index: number;
    typeIndex: number;
    passive: boolean;
    freezingRowsRangeArray: FreezingRowsRangeType[];
}

export const AceEditorEvents = [
    'blur', 'input', 'changeSelectionStyle',
    /* 'changeSession', */'copy', 'focus',
    'paste', 'mousemove', 'mouseup', 'mousewheel',
    'change', 'click'
];
export const AceEditorSessionEvents = [ 
    'changeWrapLimit', 'changeWrapMode', 
    'changeAnnotation', 'changeBackMarker',
    'changeFrontMarker', 'changeBreakpoint',
    'changeOverwrite', 'changeTabSize',
    'changeFold', 'changeScrollLeft',
    'changeScrollTop', 'tokenizerUpdate',
    'change', 'changeMode' 
];
export const AceEditorSelectionEvents = [ 'changeSelection', 'changeCursor' ];
export const AceEditorDocEvents = [ 'change' ];
/*
export const AceEditorModes = [ 
    'abap','abc','actionscript','ada','apache_conf','applescript','asciidoc','assembly_x86','autohotkey','batchfile','bro','c9search',
    'c_cpp','cirru','clojure','cobol','coffee','coldfusion','csharp','csound_document','csound_orchestra','csound_score','css','curly',
    'd','dart','diff','django','dockerfile','dot','drools','eiffel','ejs','elixir','elm','erlang','forth','fortran','ftl','gcode','gherkin','gitignore',
    'glsl','gobstones','golang','graphqlschema','groovy','haml','handlebars','haskell','haskell_cabal','haxe','hjson','html','html_elixir','html_ruby',
    'ini','io','jack','jade','java','javascript','json','jsoniq','jsp','jssm','jsx','julia','kotlin','latex','lean','less','liquid','lisp','live_script','livescript',
    'logiql','lsl','lua','luapage','lucene','makefile','markdown','mask','matlab','mavens_mate_log','maze','mel','mips_assembler','mipsassembler',
    'mushcode','mysql','nix','nsis','objectivec','ocaml','pascal','perl','pgsql','php','pig','plain_text','powershell','praat','prolog','properties',
    'protobuf','python','r','razor','rdoc','red','rhtml','rst','ruby','rust','sass','scad','scala','scheme','scss','sh','sjs','smarty','snippets',
    'soy_template','space','sparql','sql','sqlserver','stylus','svg','swift','swig','tcl','tex','text','textile','toml','tsx','turtle','twig','typescript',
    'vala','vbscript','velocity','verilog','vhdl','wollok','xml','xquery','yaml' 
];
*/
export const AceEditorSupportedModeArray :ModeConfigInterface[] = [{
    suffix: '.c',
    mode: 'c_cpp',
    name: '.c'
}, {
    suffix: '.css',
    mode: 'css',
    name: '.css'
}, {
    suffix: '',
    mode: 'dockerfile',
    name: 'dockerfile'
}, {
    suffix: '.ejs',
    mode: 'ejs',
    name: '.ejs'
}, {
    suffix: '',
    mode: 'gitignore',
    defaultTitle: '.gitignore',
    name: '.gitignore'
}, {
    suffix: '.go',
    mode: 'golang',
    name: '.go'
}, {
    suffix: '.html',
    mode: 'html',
    name: '.html'
}, {
    suffix: '.java',
    mode: 'java',
    name: '.java'
}, {
    suffix: '.js',
    mode: 'javascript',
    name: '.js'
}, {
    suffix: '.json',
    mode: 'json',
    name: '.json'
}, {
    suffix: '.jsx',
    mode: 'jsx',
    name: '.jsx'
}, {
    suffix: '.less',
    mode: 'less',
    name: '.less'
}, {
    suffix: '.lua',
    mode: 'lua',
    name: '.lua'
}, {
    suffix: '.md',
    mode: 'markdown',
    name: '.md'
}, {
    suffix: '.sql',
    mode: 'mysql',
    name: 'mysql'
}, {
    suffix: '.sql',
    mode: 'pgsql',
    name: 'pgsql'
}, {
    suffix: '.php',
    mode: 'php',
    name: '.php'
}, {
    suffix: '.py',
    mode: 'python',
    name: '.py'
}, {
    suffix: '.rs',
    mode: 'rust',
    name: '.rs'
}, {
    suffix: '.sass',
    mode: 'sass',
    name: '.sass'
}, {
    suffix: '.scala',
    mode: 'scala',
    name: '.scala'
}, {
    suffix: '.sql',
    mode: 'sql',
    name: '.sql'
}, {
    suffix: '.sql',
    mode: 'sqlserver',
    name: 'sqlserver'
}, {
    suffix: '.swift',
    mode: 'swift',
    name: '.swift'
}, {
    suffix: '.svg',
    mode: 'svg',
    name: '.svg'
}, {
    suffix: '.txt',
    mode: 'text',
    name: '.txt'
}, {
    suffix: '.ts',
    mode: 'typescript',
    name: '.ts'
}, {
    suffix: '.tsx',
    mode: 'tsx',
    name: '.tsx'
}, {
    suffix: '.xml',
    mode: 'xml',
    name: '.xml'
}, {
    suffix: '.yaml',
    mode: 'yaml',
    name: '.yaml'
}];

export const AceEditorSupportedThemeArray: ThemeConfigInterface[] = [{
    "theme": "ambiance",
    "internal": !0
}, {
    "theme": "chaos",
    "internal": !0
}, {
    "theme": "chrome",
    "internal": !0
}, {
    "theme": "clouds",
    "internal": !0
}, {
    "theme": "clouds_midnight",
    "internal": !0
}, {
    "theme": "cobalt",
    "internal": !0
}, {
    "theme": "crimson_editor",
    "internal": !0
}, {
    "theme": "dawn",
    "internal": !0
}, {
    "theme": "dracula",
    "internal": !0
}, {
    "theme": "dreamweaver",
    "internal": !0
}, {
    "theme": "eclipse",
    "internal": !0
}, {
    "theme": "github",
    "internal": !0
}, {
    "theme": "gob",
    "internal": !0
}, {
    "theme": "gruvbox",
    "internal": !0
}, {
    "theme": "idle_fingers",
    "internal": !0
}, {
    "theme": "iplastic",
    "internal": !0
}, {
    "theme": "katzenmilch",
    "internal": !0
}, {
    "theme": "kr_theme",
    "internal": !0
}, {
    "theme": "kuroir",
    "internal": !0
}, {
    "theme": "merbivore",
    "internal": !0
}, {
    "theme": "merbivore_soft",
    "internal": !0
}, {
    "theme": "mono_industrial",
    "internal": !0
}, {
    "theme": "monokai",
    "internal": !0
}, {
    "theme": "pastel_on_dark",
    "internal": !0
}, {
    "theme": "solarized_dark",
    "internal": !0
}, {
    "theme": "solarized_light",
    "internal": !0
}, {
    "theme": "sqlserver",
    "internal": !0
}, {
    "theme": "terminal",
    "internal": !0
}, {
    "theme": "textmate",
    "internal": !0
}, {
    "theme": "tomorrow",
    "internal": !0
}, {
    "theme": "tomorrow_night",
    "internal": !0
}, {
    "theme": "tomorrow_night_blue",
    "internal": !0
}, {
    "theme": "tomorrow_night_bright",
    "internal": !0
}, {
    "theme": "tomorrow_night_eighties",
    "internal": !0
}, {
    "theme": "twilight",
    "internal": !0
}, {
    "theme": "vibrant_ink",
    "internal": !0
}, {
    "theme": "xcode",
    "internal": !0
}, {
    "theme": "behave",
    "internal": !1
}];

export const formatAttrs = (attrs: Record<string, unknown>) :Record<string, unknown> =>
    Object.entries(attrs).reduce((t, [ k, v ]) => {
        const name = k.replace(/\-([a-z])/g, (_: string, key: string) => key.toLocaleUpperCase()).replace(/^[A-Z]/, (f) => f.toLocaleLowerCase());

        t[name] = v;
        return t
    }, {} as Record<string, unknown>);

export const downloadFile = (filename: string, content: string) => {
    const blob = new Blob([ content ], { type: 'plain/text' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;

    document.documentElement.appendChild(a);
    a.click();
    document.documentElement.removeChild(a);
}

@Component({
    name: 'AceEditorMain',
    inheritAttrs: !1
})
export default class AceEditor extends Vue {
    // 主题
    @Prop() 
        private theme!: string;
    @Prop({
        default: 'text'
    })
        private mode!: string|(() => string);
    @Prop({
        type: Array,
        default: () => [ 1, -1 ]
    }) private pageLimit!: [ number, number ];
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
        default: () => AceEditorSupportedModeArray.map(({ mode }) => mode)
    })
        public modes!: string[];
    @Prop({
        default: () => AceEditorSupportedThemeArray.map(({ theme }) => theme)
    })
        public themes!: string[];
    @Watch('theme')
        public changeTheme(theme: string) {
            const editor = this.editor
            theme = this.includeEditorThemePlugin(theme);
            if (editor && theme) {
                editor.setTheme(theme)
            }
        }
    @Watch('themes', {
        immediate: !0,
        deep: !0
    }) public changeThemes(themes: string[]) {
        const themes$ = themes ?? AceEditorSupportedThemeArray.map(({ theme }) => theme);
        const themeConfArr: ThemeConfigInterface[] = [];

        themes$.forEach((theme) => {
            const themeConf = this.getThemeConf(theme)
            if (themeConf) {
                themeConfArr.push(themeConf);
            }
        });

        this.supportedThemeArray = themeConfArr;
    }
    @Watch('modes', {
        immediate: !0,
        deep: !0
    }) public changeModes(modes: string[]) {
        const modes$ = modes ?? AceEditorSupportedModeArray.map(({ mode }) => mode);
        const modeConfArr: ModeConfigInterface[] = [];

        modes$.forEach((mode) => {
            const modeConf = this.getModeConf(mode)
            if (modeConf) {
                modeConfArr.push(modeConf);
            }
        });

        this.supportedModeArray = modeConfArr;
    }

    public get addPageIconDisabled() {
        return !this.validPageLimit(1, !1)
    }
    public get closePageIconDisabled() {
        return !this.validPageLimit(-1, !1)
    }
    public get hasTabsSlot() {
        return !!this.$scopedSlots?.tabs;
    }
    public get hasActionsSlot() {
        return !!this.$scopedSlots?.actions;
    }
    public currentTheme: string = '';
    public activePage: PageInterface|null = null;
    public supportedModeArray!: ModeConfigInterface[];
    public supportedThemeArray!: ThemeConfigInterface[];
    public themeCssClass: string = '';
    public tabSize: number = 0;
    public newLineMode: string = '';
    private options!: Record<string, unknown>;
    private editor!: ace.Editor;
    private pages: PageInterface[] = [];

    public refreshEditor() {
        this.destroyEditor();
        this.initOptions();
        this.initEditor();

        return this
    }

    public page(title: string, mode?: string|(() => string), value: string = '', passive: boolean = !0, inputTitleDisabled: boolean = !1, id?: unknown) :PageInterface {
        !passive && this.validPageLimit(1);

        mode = mode ?? this.mode;
        const mode$ = this.includeEditorModePlugin(mode);
        const session = new ace.EditSession(value, mode$);
        const mode$$ = this.getModeNameFromNamespace(mode$);
        const page = this.createPage(title, mode$$, session, passive, inputTitleDisabled, id);
        const currentPageID = page.id

        if (currentPageID && this.getPageById(currentPageID)) {
            (session as any).destroy();
            throw new Error('Duplicate Page ID');
        }

        const typeIndex = this.pages.filter((page$) => page$.mode === page.mode).length;
        page.typeIndex = typeIndex;

        const index = this.pages.push(page);
        page.index = index;

        this.initPageTitle(page);

        const editor = this.editor;
        if (editor) {
            editor.setSession(session);
        }
        
        return page
    }

    public changePage(page: PageInterface) {
        const editor = this.editor;
        if (editor && page) {
            editor.setSession(page.session)
            return !0;
        }

        return !1;
    }

    public changeNewLineMode(newLineMode: string) {
        const editor = this.editor;
        if (editor) {
            this.newLineMode = newLineMode
            editor.session.setNewLineMode(newLineMode);
        }

        return this;
    }

    public changeTabSize(tabSize: number) {
        const editor = this.editor;
        if (editor) {
            this.tabSize = tabSize
            editor.session.setTabSize(tabSize);
        }

        return this;
    }

    public changePageMode(mode: string) {
        const { activePage } = this;
        if (mode && activePage) {
            const mode$ = this.includeEditorModePlugin(mode);
            
            activePage.mode = mode;
            activePage.session.setMode(mode$);

            this.initPageDefaultTitle(activePage)
        }
    }

    public closePage(page: PageInterface, passive: boolean = !0) {
        const { editor, pages } = this;
        if (editor && !page.isFixed) {
            const pageIndex = this.getPageIndex(page);
            if (pageIndex !== -1) {
                const { session } = page
                !passive && this.validPageLimit(-1);

                (session as any).destroy();
                pages.splice(pageIndex, 1);

                this.autoChangePage();
                return !0;
            }
        }

        return !1;
    }

    public destroyEditor() {
        if (this.editor) {
            this.editor.destroy();
            this.editor.container.remove();
        }

        if (this.pages) {
            this.pages.forEach(({ session }) => ( session as any ).destroy())
            this.pages = [];
        }

        return this;
    }

    public includeEditorModePlugin(name: string|(() => string)) :string {
        if (name) {
            if (typeof name === 'string') {
                require(`brace/mode/${name}`)
                name = this.createBraceUseNamespace('mode', name)
            }
            if (typeof name === 'function') {
                name = name();
            }
        }

        return name;
    }

    public includeEditorThemePlugin(theme: string) :string {
        if (theme) {
            const { theme: theme$, internal } = this.getThemeConf(theme) as ThemeConfigInterface;
            if (internal) {
                require(`brace/theme/${theme$}`)
            } else {
                includeTheme(theme$)
            }

            theme = this.createBraceUseNamespace('theme', theme$)

            const { cssClass } = ace.acequire(theme)
            this.themeCssClass = cssClass;
            this.currentTheme = theme$;
        }

        return theme;
    }

    public initPageTitle(page: PageInterface) {
        this.initPageDefaultTitle(page);

        const { defaultTitle, suffix } = page;

        if (!page.title) {
            page.title = defaultTitle;
        } else {
            page.title += suffix;
        }

        return this
    }

    public initPageDefaultTitle(page: PageInterface) {
        const modeConf = this.getModeConf(page.mode);

        let suffix = '';
        let defaultTitle = '';

        const middlename = page.typeIndex !== 0 ? ` ${page.typeIndex}` : ''

        if (modeConf) {
            const { suffix, mode, defaultTitle: defaultTitle$ } = modeConf;

            if (defaultTitle$) {
                defaultTitle = `${defaultTitle$}${middlename}`;
            } else {
                defaultTitle = `${mode}${middlename}${suffix}`
            }
        } else {
            defaultTitle = `page${middlename}`;
        }

        page.defaultTitle = defaultTitle
        page.suffix = suffix
        return this
    }

    public initEditor() :ace.Editor {
        const theme$ = this.includeEditorThemePlugin(this.theme);
        const editor = ace.edit(this.getEditorElement());

        theme$ && editor.setTheme(theme$)

        editor.setOptions({
            ... this.options,
        })

        this.initEditorDefaultCommand(editor);
        this.initEditorDefaultEventListener(editor);
        this.initEditorEventListener(editor);
        
        this.editor = editor

        this.autoChangePage();
        this.$emit('ready', editor);

        return editor;
    }

    public onPageTitleBlur(page: PageInterface) {
        page.title = page.title.trim();

        if (page.title === '') {
            page.title = page.defaultTitle;
        } else {
            const titleArr = page.title.split('.')
            const length = titleArr.length

            if (titleArr.length === 1) {
                page.title += page.suffix;
            }
            if (!titleArr[length - 1]) {
                page.title = titleArr.slice(0, length - 1).join('.') + page.suffix;
            }
        }
    }

    private mounted() {
        this.refreshEditor();
    }

    private validPageLimit(inc: number, throwError: boolean = !0) :boolean {
        const pageLength = this.pages.length + inc;
        const pageLimit = this.pageLimit;

        if (pageLimit[0] >= 0 && pageLength < pageLimit[0]) {
            if (throwError) {
                throw new Error('The number of pages is less than the page-limit');
            }
            return !1;
        }
        if (pageLimit[1] >= 0 && pageLength > pageLimit[1]) {
            if (throwError) {
                throw new Error('The number of pages is greater than the page-limit');
            }
            return !1;
        }

        return !0;
    }

    private initOptions() {
        this.options = formatAttrs(this.$attrs);
        return this;
    }

    private initEditorDefaultCommand(editor: ace.Editor) {
        editor.commands.addCommand({
            name: 'SaveFile',
            bindKey: {win: 'Ctrl-S',  mac: 'Command-S'},
            exec: () => {
                const page = this.activePage;
                if (page) {
                    const content = editor.session.doc.getValue();
                    const filename = page.title;
    
                    downloadFile(filename, content);   
                }             
            },
            readOnly: !0
        });
    }

    private initEditorEventListener(editor: ace.Editor) {
        if (editor) {
            AceEditorEvents.forEach((event) => {
                editor.on(event, (... args) => {
                    this.$emit(`editor-${event}`, ... args);
                })
            })
        }

        return this;
    }

    private initEditorDefaultEventListener(editor: ace.Editor) {
        editor.on('changeSession', (e, ... args) => {
            const { session } = e
            const match = this.pages.find((item) => item.session === session);
            if (match) {
                this.pages.forEach((item) => item.active = match === item)
    
                this.activePage = match;
                this.tabSize = match.session.getTabSize();
                this.newLineMode = match.session.getNewLineMode();
                this.$emit(`editor-changeSession`, match, e, ... args);
            }
        })
    }

    private autoChangePage() {
        const { pages, editor } = this;
        const latestPage = pages[pages.length - 1];

        if (latestPage && editor) {
            editor.setSession(latestPage.session);
        }

        return this;
    }

    private getModeConf(mode: string) {
        return AceEditorSupportedModeArray.find(({ mode: mode$ }) => mode$ === mode);
    }

    private getThemeConf(theme: string) {
        return AceEditorSupportedThemeArray.find(({ theme: theme$ }) => theme$ === theme);
    }

    private getPageById(id: unknown) :PageInterface|void {
        return this.pages.find(({ id: id$ }) => id === id$)
    }

    private getPageIndex(page: PageInterface) :number {
        return this.pages.findIndex((match) => page === match)
    }

    private createPage(title: string, mode: string, session: ace.IEditSession, passive: boolean = !0, inputTitleDisabled: boolean = !1, id: unknown) :PageInterface {
        return {
            title,
            session,
            passive,
            id,
            mode,
            defaultTitle: '',
            inputTitleDisabled,
            active: !1,
            isFixed: !1,
            suffix: '',
            index: 0,
            typeIndex: 0,
            freezingRowsRangeArray: []
        }
    }

    private getModeNameFromNamespace(namespace: string) :string {
        const namespaces = namespace.split('\/');
        return namespaces[namespaces.length - 1];
    }

    private createBraceUseNamespace(prev: string, value: string) :string {
        return  `ace/${prev}/${value}`;
    }

    private getEditorElement() {
        return this.$refs['editor'] as HTMLElement;
    }
}