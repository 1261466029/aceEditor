import { IEditSession, Range, UndoManager } from 'brace';
import { themeProvider } from '@/plugin/AceEditor';

export type FreezingRowsRange = [ number, number ];
export type FreezingMarkerRange = [ Range, number ];
export interface ModeConfigurationOption {
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
    mode: string;
    styleClazz: string;
    tabSize: number;
    newLineMode: string;
    useWrapMode: boolean;
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
    mode: string;
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
    modes: string[];
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
    setMode: (mode: string, passive: boolean) => void;
    setTheme: (theme: string) => void;
    setFreezingRangesByPageId: (id: unknown, freezingRanges: Range[]) => void;
    addFreezingRangesByPageId: (id: unknown, freezingRanges: Range[]) => void;
    removeFreezingRangesByPageId: (id: unknown, freezingRanges: Range[]) => void;
    removeAllFreezingRangesByPageId: (id: unknown) => void;
    autoChangePageActive: (direction: number) => boolean;
    changePageSession: (page: Page, passive: boolean) => void;
    getPageById: (id: unknown) => Page|void;
    getPageEntryById: (id: unknown) => [ string, Page ]|void;
    getPageTypeIndex: (mode: string) => number;
};

export const EditorModesProvider :ModeConfigurationOption[] = [{"suffix":".c","mode":"c_cpp","name":".c"},{"suffix":".css","mode":"css","name":".css"},{"suffix":"","mode":"dockerfile","name":"dockerfile"},{"suffix":".ejs","mode":"ejs","name":".ejs"},{"suffix":"","mode":"gitignore","defaultTitle":".gitignore","name":".gitignore"},{"suffix":".go","mode":"golang","name":".go"},{"suffix":".html","mode":"html","name":".html"},{"suffix":".java","mode":"java","name":".java"},{"suffix":".js","mode":"javascript","name":".js"},{"suffix":".json","mode":"json","name":".json"},{"suffix":".jsx","mode":"jsx","name":".jsx"},{"suffix":".less","mode":"less","name":".less"},{"suffix":".lua","mode":"lua","name":".lua"},{"suffix":".md","mode":"markdown","name":".md"},{"suffix":".sql","mode":"mysql","name":"mysql"},{"suffix":".sql","mode":"pgsql","name":"pgsql"},{"suffix":".php","mode":"php","name":".php"},{"suffix":".py","mode":"python","name":".py"},{"suffix":".rs","mode":"rust","name":".rs"},{"suffix":".sass","mode":"sass","name":".sass"},{"suffix":".scala","mode":"scala","name":".scala"},{"suffix":".sql","mode":"sql","name":".sql"},{"suffix":".sql","mode":"sqlserver","name":"sqlserver"},{"suffix":".swift","mode":"swift","name":".swift"},{"suffix":".svg","mode":"svg","name":".svg"},{"suffix":".txt","mode":"text","name":".txt"},{"suffix":".ts","mode":"typescript","name":".ts"},{"suffix":".tsx","mode":"tsx","name":".tsx"},{"suffix":".xml","mode":"xml","name":".xml"},{"suffix":".yaml","mode":"yaml","name":".yaml"}];

const EditorThemesProviderInternally: string[] = [ 'ambiance', 'chaos', 'chrome', 'clouds', 'clouds_midnight', 'cobalt', 'crimson_editor', 'dawn', 'dracula', 'dreamweaver', 'eclipse', 'github', 'gob', 'gruvbox', 'idle_fingers', 'iplastic', 'katzenmilch', 'kr_theme', 'kuroir', 'merbivore', 'merbivore_soft', 'mono_industrial', 'monokai', 'pastel_on_dark', 'solarized_dark', 'solarized_light', 'sqlserver', 'terminal', 'textmate', 'tomorrow', 'tomorrow_night', 'tomorrow_night_blue', 'tomorrow_night_bright', 'tomorrow_night_eighties', 'twilight', 'vibrant_ink', 'xcode' ]

export const EditorThemesProvider: ThemeConfigurationOption[] = [
    ... EditorThemesProviderInternally.map(theme => ({
        theme, internal: !0
    })),
    ... themeProvider.map(theme => ({
        theme, internal: !1
    }))
];
