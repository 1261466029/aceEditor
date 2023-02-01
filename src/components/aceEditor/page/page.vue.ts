import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import AceEditor, { PageInterface, formatAttrs, AceEditorSelectionEvents, AceEditorSessionEvents, FreezingRowsRangeType } from '../main/main.vue';

const { acequire } = require('brace');
const Range = acequire('ace/range').Range;
const UndoManager = acequire('ace/undomanager').UndoManager;

@Component({
    name: 'AceEditorPage'
})
export default class AceEditorPage extends Vue {
    @Prop()
        private id?: unknown;
    @Prop()
        private title!: string;
    @Prop()
        private value!: string;
    @Prop()
        private mode!: string|(() => string);
    @Prop({
        default: () => []
    })
        public freezingRowsRangeArray!: FreezingRowsRangeType[];
    @Prop({
        default: !1
    })
        public inputTitleDisabled!: boolean;
    @Watch('value')
        public changeValue(value: string) {
            if (this.currentValue !== value) {
                this.page?.session.setValue(String(value));
            }
        }
    @Watch('title')
        public changeTitle(title: string) {
            const { page, editorComponent } = this;
            if (page) {
                page.title = title;
                editorComponent.initPageTitle(page);
            }

            return this;
        }
    @Watch('mode')
        public changeMode(mode: string|(() => string)) {
            const { page, editorComponent } = this;
            if (page) {
                const mode$ = editorComponent.includeEditorModePlugin(mode)
                page.session.setMode(mode$);
            }

            return this;
        }
    @Watch('inputTitleDisabled')
        public changeInputTitleDisabled(disabled: boolean) {
            if (this.page) {
                this.page.inputTitleDisabled = !!disabled;
            }
        }
    public options!: Record<string, unknown>;
    public get defaultValue() {
        return this.value ?? (this.$el as HTMLElement)?.innerText ?? '';
    }
    private editorComponent !: AceEditor;
    private page?: PageInterface;
    private freezingMarkers: [ Range, number ][] = [];
    private currentValue?: string;

    public refreshPageOptions(page: PageInterface) {
        const { session } = page;
        (session as any).setOptions(this.options);

        return this;
    }

    public unbind() {
        const { page, editorComponent } = this;
        if (editorComponent && page) {
            editorComponent.closePage(page);
        }

        return this;
    }

    public bind() {
        this.unbind();

        const { editorComponent, title, mode, defaultValue, id, freezingRowsRangeArray } = this;
        if (editorComponent) {
            console.log(defaultValue);
            const page = editorComponent.page(title, mode, defaultValue, !0, this.inputTitleDisabled, id);
            const undoManager = new UndoManager;

            page.session.setUndoManager(undoManager);

            this.refreshPageOptions(page);
            this.addPageFreezing(page, ... freezingRowsRangeArray);
            this.rewriteEditorSessionFn(page);
            this.initEditorSessionDefaultEventListener(page);
            this.initEditorSessionEventListener(page);

            this.$emit('bind', page, editorComponent);
            this.page = page

            this.refreshPageFreezing(page);
        }

        return this;
    }

    public addPageFreezing(page: PageInterface, ... freezingRowsRangeArray: FreezingRowsRangeType[]) {
        const oarr = page.freezingRowsRangeArray;
        freezingRowsRangeArray.forEach(freezingRowsRange => {
            const [ nl, nr ] = freezingRowsRange;
            const intersectingRange = this.findIntersectingPageFreezingRowRange([ -1 + nl, 1 + nr ], oarr);
            if (intersectingRange) {
                const [ ol, or ] = intersectingRange;

                const isContain = this.checkContain(intersectingRange, freezingRowsRange);

                if (!isContain) {
                    if (ol > nl) {
                        intersectingRange[0] = nl;
                    }
                    if (or < nr) {
                        intersectingRange[1] = nr;
                    }
                }
            } else {
                oarr.push(freezingRowsRange)
            }
        });

        page.freezingRowsRangeArray = this.formatFreezingRowsRangeArray(oarr);
        this.refreshPageFreezing(page);
        return this;
    }

    public removePageFreezing(page: PageInterface, ... freezingRowsRangeArray: FreezingRowsRangeType[]) {
        const oarr = page.freezingRowsRangeArray;
        freezingRowsRangeArray.forEach(freezingRowsRange => {
            const intersectingRanges = this.filterIntersectingPageFreezingRowRanges(freezingRowsRange, oarr);
            if (intersectingRanges) {
                intersectingRanges.forEach((intersectingRange) => {
                    let [ ol, or ] = intersectingRange;
                    const [ nl, nr ] = freezingRowsRange;
                    
                    const isContain = this.checkContain(intersectingRange, freezingRowsRange);
                    const isContained = this.checkContained(intersectingRange, freezingRowsRange);

                    let isRm = isContain || isContained;
                    if (!isRm) {
                        if (or >= nl && or <= nr) {
                            or = nl - 1;
                        }
                        if (ol <= nr && ol >= nl) {
                            ol = nr + 1;
                        }

                        if (or < ol) {
                            isRm = !0;
                        } else {
                            intersectingRange[0] = ol;
                            intersectingRange[1] = or;
                        }
                    }
                    console.log(intersectingRange)

                    if (isRm) {
                        const findIndex = oarr.findIndex((e) => e === intersectingRange)
                        if (findIndex !== -1) {
                            oarr.splice(findIndex, 1);
                            isContain && oarr.push([ ol, nl ], [ nr, or ]);
                        }
                    }
                })
            }
        });

        page.freezingRowsRangeArray = this.formatFreezingRowsRangeArray(oarr);
        this.refreshPageFreezing(page);
        return this;
    }

    private beforeMount() {
        this.initOptions();
    }

    private mounted() {
        console.log(this);
        this.$nextTick(() => {
            this.initEditorComponent();
            this.bind();
        })
    }

    private beforeDestroy() {
        this.unbind();
    }

    private checkContain([ ol, or ]: FreezingRowsRangeType, [ nl, nr ]: FreezingRowsRangeType) :boolean {
        return ol <= nl && or >= nr;
    }

    private checkContained([ ol, or ]: FreezingRowsRangeType, [ nl, nr ]: FreezingRowsRangeType) :boolean {
        return ol > nl && or < nr;
    }

    private checkIntersect([ ol, or ]: FreezingRowsRangeType, [ nl, nr ]: FreezingRowsRangeType) :boolean {
        return !( nr < ol || nl > or );
    }

    private findIntersectingPageFreezingRowRange(freezingRowsRange: FreezingRowsRangeType, freezingRowsRangeArray: FreezingRowsRangeType[]) {
        return freezingRowsRangeArray.find((_freezingRowsRange) =>
            this.checkIntersect(_freezingRowsRange, freezingRowsRange)
        );
    }

    private filterIntersectingPageFreezingRowRanges(freezingRowsRange: FreezingRowsRangeType, freezingRowsRangeArray: FreezingRowsRangeType[]) {
        return freezingRowsRangeArray.filter((_freezingRowsRange) =>
            this.checkIntersect(_freezingRowsRange, freezingRowsRange)
        );
    }

    private clearPageFreezingMarkers() {
        const { page, freezingMarkers } = this;
        if (page) {
            freezingMarkers.forEach(([ _, markerID ]) => {
                page.session.removeMarker(markerID)
            })
        }

        this.freezingMarkers = [];
        return this;
    }

    private refreshPageFreezing(page: PageInterface) {
        this.clearPageFreezingMarkers();

        const freezingMarkers = this.freezingMarkers;
        if (page) {
            const freezingRowsRangeArray = page.freezingRowsRangeArray;

            freezingRowsRangeArray.forEach((freezingRowsRange) => {
                const range = new Range(freezingRowsRange[0], 0, freezingRowsRange[1], 1);
                const markerID = page.session.addMarker(range, 'ace_active-line ace_readonly-line', 'fullLine', !1);

                freezingMarkers.push([ range, markerID ]);
            });
        }        
        return this
    }
    private rewriteEditorSessionFn(page: PageInterface) {
        const session = page.session;
        const { insert, remove, moveText } = session;
        const { moveCursorTo } = session.selection;
        const $this = this;
        
        session.insert = function(position, text) {
            const row = position.row;
            const freezingRowsRangeArray = page.freezingRowsRangeArray;
            const rowsRange: FreezingRowsRangeType = [ row, row ];

            if (!$this.findIntersectingPageFreezingRowRange(rowsRange, freezingRowsRangeArray)) {
                insert.call(this, position, text);
            }
        }

        session.remove = function(range) {
            const { start, end } = range;
            const freezingRowsRangeArray = page.freezingRowsRangeArray;
            const rowsRange: FreezingRowsRangeType = [ start.row, end.row ];

            if (!$this.findIntersectingPageFreezingRowRange(rowsRange, freezingRowsRangeArray)) {
                remove.call(this, range);
            }
        }

        session.moveText = function(fromRange, toPosition) {
            const { start, end } = fromRange;
            const row = toPosition.row;
            const freezingRowsRangeArray = page.freezingRowsRangeArray;
            
            if (
                !$this.findIntersectingPageFreezingRowRange([ row, row ], freezingRowsRangeArray) &&
                !$this.findIntersectingPageFreezingRowRange([ start.row, end.row ], freezingRowsRangeArray)
            ) {
                return moveText.call(this, fromRange, toPosition);
            }

            return fromRange;
        }

        session.selection.moveCursorTo = function(row, column, keepDesiredColumn) {
            const fold = session.getFoldAt(row, column);
            if (fold) {
                row = fold.start.row;
            }

            const freezingRowsRangeArray = page.freezingRowsRangeArray;
            const rowsRange: FreezingRowsRangeType = [ row, row ];
            if (!$this.findIntersectingPageFreezingRowRange(rowsRange, freezingRowsRangeArray)) {
                moveCursorTo.call(this, row, column, keepDesiredColumn);
            }
        }
    }

    private formatFreezingRowsRangeArray(freezingRowsRangeArray: (FreezingRowsRangeType|null)[]) :FreezingRowsRangeType[] {
        freezingRowsRangeArray.forEach((freezingRowsRange) => {
            if (freezingRowsRange) {
                let [ nl, nr ] = freezingRowsRange;
                freezingRowsRangeArray.forEach((_freezingRowsRange, i) => {
                    if (_freezingRowsRange && _freezingRowsRange !== freezingRowsRange) {
                        const [ ol, or ] = _freezingRowsRange;
        
                        if (this.checkIntersect(_freezingRowsRange, [ -1 + nl, 1 + nr ])) {
                            if (nl > ol) {
                                freezingRowsRange[0] = nl = ol;
                            }
                            if (nr < or) {
                                freezingRowsRange[1] = nr = or;
                            }
    
                            freezingRowsRangeArray[i] = null;
                        }
                    }
                })
            }
        });

        return freezingRowsRangeArray.filter(e => !!e) as FreezingRowsRangeType[];
    }

    private initEditorComponent() {
        const editorComponent = this.$parent as AceEditor;
        if (editorComponent && editorComponent instanceof AceEditor) {
            this.editorComponent = editorComponent;
        }
        console.log(editorComponent, editorComponent instanceof AceEditor)

        return this;
    }

    private initOptions() {
        this.options = formatAttrs(this.$attrs);
        return this;
    }

    private tryToResetFreezingMarkers(page: PageInterface, action: string, nl: number, nr: number) :boolean {
        const freezingRowsRangeArray = page.freezingRowsRangeArray;
        const rows = Math.abs(nr - nl);
        if (rows === 0) {
            return !1;
        }

        if (action === 'remove') {
            this.setFreezingRowsRangeInc(freezingRowsRangeArray, nr, -rows);
        } else if (action === 'insert') {
            this.setFreezingRowsRangeInc(freezingRowsRangeArray, nl, rows);
        }

        this.refreshPageFreezing(page);
        return !0;
    }

    private setFreezingRowsRangeInc(freezingRowsRangeArray: FreezingRowsRangeType[], row: number, inc: number) {
        freezingRowsRangeArray.forEach((freezingRowsRange) => {
            if (freezingRowsRange[0] > row) {
                freezingRowsRange[0] += inc;
                freezingRowsRange[1] += inc;
            }
        });

        return this;
    }

    private initEditorSessionDefaultEventListener(page: PageInterface) {
        const { session } = page;

        session.on('change', (e) => {
            const value = this.page?.session.getValue();
            const { action, start, end } = e;

            this.currentValue = value;
            this.tryToResetFreezingMarkers(page, action, start.row, end.row);
            this.$emit('input', value, e)
        })

        session.selection.on('changeCursor', (e: any) => {
            const freezingRowsRangeArray = page.freezingRowsRangeArray;
            const anchor = session.selection.getSelectionAnchor();
            const rowsRange: FreezingRowsRangeType = [ anchor.row, anchor.row ];

            if (this.findIntersectingPageFreezingRowRange(rowsRange, freezingRowsRangeArray)) {
                e.preventDefault();
                e.stopPropagation();

                return !1;
            }
        })

        return this
    }

    private initEditorSessionEventListener(page: PageInterface) {
        const session = page.session
        AceEditorSessionEvents.forEach((event) => {
            session.on(event, (... args) => {
                this.$emit(`session-${event}`, page, ... args);
            })
        })
        AceEditorSelectionEvents.forEach((event) => {
            session.selection.on(event, (... args: unknown[]) => {
                this.$emit(`selection-${event}`, page, ... args);
            })
        })

        return this;
    }
}