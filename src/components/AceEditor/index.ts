import { IEditSession, Range, UndoManager } from 'brace';
import { themeProvider } from '@/plugin/AceEditor';

export type FreezingRowsRange = [ number, number ];
export type FreezingMarkerRange = [ Range, number ];
export interface ModeConfigurationOption {
    id: string;
    suffix: string;
    mode: string;
    name: string;
    defaultTitle?: string;
};
export interface ThemeConfigurationOption {
    theme: string;
    internal: boolean;
};
export interface EditorConfiguration {
    theme: string;
    styleClazz: string;
    tabSize: number;
    newLineMode: string;
    useWrapMode: boolean;
    modeConfigurationOption: ModeConfigurationOption;
    supported: {
        modes: ModeConfigurationOption[];
        themes: ThemeConfigurationOption[];
    }
};
export interface Page extends BasicPage {
    index: number;
    typeIndex: number;
    modeConfigurationOption: ModeConfigurationOption;
    session: IEditSession;
    undoManager: UndoManager;
    unWatchHandles: (() => void)[];
};
export interface BasicPage {
    id: unknown;
    title: string;
    hoverTitle: string;
    modeId: string;
    value: string;
    active: boolean;
    isFixed: boolean;
    passive: boolean;
    defaultTitle?: string;
    toggleDisabled: boolean;
    inputTitleDisabled: boolean;
    options: Record<string, unknown>;
    freezing: {
        ranges: Range[];
        markers: FreezingMarkerRange[];
    };
};

export interface EditorMenuOption {
    name: string;
    type: unknown;
    attrs?: Record<string, unknown>;
};

export const EditorEvents = [
    'blur', 'input', 'changeSelectionStyle',
    'changeSession', 'copy', 'focus',
    'paste', 'mousemove', 'mouseup', 'mousewheel',
    'change', 'click'
];

export const SessionEvents = [
    'blur', 'input', 'changeSelectionStyle',
    'changeSession', 'copy', 'focus',
    'paste', 'mousemove', 'mouseup', 'mousewheel',
    'change', 'click'
];
export const SelectionEvents = [ 'changeSelection', 'changeCursor' ];
export const DocEvents = [ 'change' ];

export interface AceItem {
    attrs: BasicPage;
    page?: Page;
    addFreezingRanges: (freezingRanges: Range[]) => void;
    removeFreezingRanges: (freezingRanges: Range[]) => void;
    removeAllFreezingRanges: () => void;
    create: () => Page|void;
    close: (passive: boolean) => boolean|void;
    getFreezingRowsRanges: () => Range[]|void;
};

export default interface AceEditor {
    name: string;
    hoverTitle: string;
    showHeader: boolean;
    showFooter: boolean;
    showActions: boolean;
    modeIds: string[];
    themes: string[];
    toggleDisabled: boolean;
    enableThemeChange: boolean;
    enableModeChange: boolean;
    config: EditorConfiguration;
    pages: Page[];
    activePage: Page|null;
    addPageDisabled: boolean;
    closePageDisabled: boolean;
    refreshEditor: () => void;
    refreshOptions: () => void;
    destroyPages: () => Page[];
    setPage: (item: BasicPage) => Page|false|void;
    closePage: (id: unknown, passive: boolean) => boolean|void;
    setUseWrapMode: (useWrapMode: boolean) => void;
    setNewLineMode: (newLineMode: string) => void;
    setTabSize: (tabSize: number) => void;
    setMode: (modeId: string, passive: boolean) => void;
    setTheme: (theme: string) => void;
    setFreezingRangesByPageId: (id: unknown, freezingRanges: Range[]) => void;
    addFreezingRangesByPageId: (id: unknown, freezingRanges: Range[]) => void;
    removeFreezingRangesByPageId: (id: unknown, freezingRanges: Range[]) => void;
    removeAllFreezingRangesByPageId: (id: unknown) => void;
    autoChangePageActive: (direction: number) => boolean;
    changePageSession: (page: Page, passive: boolean) => void;
    getPageById: (id: unknown) => Page|void;
    getPageEntryById: (id: unknown) => [ string, Page ]|void;
    getPageTypeIndex: (modeId: string) => number;
};

export const EditorModesProvider :ModeConfigurationOption[] = [{'id':'c','mode':'c_cpp','name':'c','suffix':'.c'},{'id':'cpp','mode':'c_cpp','name':'cpp','suffix':'.cpp'},{'id':'css','mode':'css','name':'css','suffix':'.css'},{'id':'dockerfile','mode':'dockerfile','name':'dockerfile','suffix':''},{'id':'ejs','mode':'ejs','name':'ejs','suffix':'.ejs'},{'id':'gitignore','mode':'gitignore','name':'gitignore','suffix':''},{'id':'golang','mode':'golang','name':'golang','suffix':'.go'},{'id':'html','mode':'html','name':'html','suffix':'.html'},{'id':'java','mode':'java','name':'java','suffix':'.java'},{'id':'javascript','mode':'javascript','name':'javascript','suffix':'.js'},{'id':'json','mode':'json','name':'json','suffix':'.json'},{'id':'jsx','mode':'jsx','name':'jsx','suffix':'.jsx'},{'id':'less','mode':'less','name':'less','suffix':'.less'},{'id':'lua','mode':'lua','name':'lua','suffix':'.lua'},{'id':'markdown','mode':'markdown','name':'markdown','suffix':'.md'},{'id':'mysql','mode':'mysql','name':'mysql','suffix':'.sql'},{'id':'pgsql','mode':'pgsql','name':'pgsql','suffix':'.sql'},{'id':'php','mode':'php','name':'php','suffix':'.php'},{'id':'python','mode':'python','name':'python','suffix':'.py'},{'id':'rust','mode':'rust','name':'rust','suffix':'.rs'},{'id':'sass','mode':'sass','name':'sass','suffix':'.sass'},{'id':'scala','mode':'scala','name':'scala','suffix':'.scala'},{'id':'sql','mode':'sql','name':'sql','suffix':'.sql'},{'id':'sqlserver','mode':'sqlserver','name':'sqlserver','suffix':'.sql'},{'id':'swift','mode':'swift','name':'swift','suffix':'.swift'},{'id':'svg','mode':'svg','name':'svg','suffix':'.svg'},{'id':'text','mode':'text','name':'text','suffix':'.txt'},{'id':'typescript','mode':'typescript','name':'typescript','suffix':'.ts'},{'id':'tsx','mode':'tsx','name':'tsx','suffix':'.tsx'},{'id':'xml','mode':'xml','name':'xml','suffix':'.xml'},{'id':'yaml','mode':'yaml','name':'yaml','suffix':'.yaml'}];

const EditorThemesProviderInternally: string[] = [ 'ambiance', 'chaos', 'chrome', 'clouds', 'clouds_midnight', 'cobalt', 'crimson_editor', 'dawn', 'dracula', 'dreamweaver', 'eclipse', 'github', 'gob', 'gruvbox', 'idle_fingers', 'iplastic', 'katzenmilch', 'kr_theme', 'kuroir', 'merbivore', 'merbivore_soft', 'mono_industrial', 'monokai', 'pastel_on_dark', 'solarized_dark', 'solarized_light', 'sqlserver', 'terminal', 'textmate', 'tomorrow', 'tomorrow_night', 'tomorrow_night_blue', 'tomorrow_night_bright', 'tomorrow_night_eighties', 'twilight', 'vibrant_ink', 'xcode' ]

export const EditorThemesProvider: ThemeConfigurationOption[] = [
    ... EditorThemesProviderInternally.map(theme => ({
        theme, internal: !0
    })),
    ... themeProvider.map(theme => ({
        theme, internal: !1
    }))
];
