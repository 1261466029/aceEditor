<script lang="ts">
    import { Component, Prop, Inject, Vue, Watch } from 'vue-property-decorator';
    import { Range } from 'brace';

    import { createID, formatAttrs, formatFreezingRowsRanges2Ranges } from './util';
    import AceEditor, { BasicPage, Page, AceItem, FreezingRowsRange, SessionEvents } from '.';

    @Component({
        name: 'AceEditorItem'
    })
    export default class AceEditorItem extends Vue implements AceItem {
        @Inject()
            private getContext!: () => AceEditor;
        @Prop()
            private id!: unknown;
        @Prop()
            private title!: string;
        @Prop()
            private hoverTitle!: string;
        @Prop({
            default: 'text'
        })
            private mode!: string;
        @Prop()
            private value!: string;
        @Prop({
            default: !1
        })
            public active!: boolean;
        @Prop({
            default: !1
        })
            public isFixed!: boolean;
        @Prop({
            default: !1
        })
            public toggleDisabled!: boolean;
        @Prop({
            default: !1
        })
            public inputTitleDisabled!: boolean;
        @Prop({
            default: () => []
        })
            public freezingRowsRanges!: FreezingRowsRange[];
        @Prop({
            default: !0
        })
            public passive!: boolean;

        @Watch('title')
            private watchTitleHandler = this.setWatchHandler('title');

        @Watch('hoverTitle')
            private watchHoverTitleHandler = this.setWatchHandler('hoverTitle');

        @Watch('mode')
            private watchModeHandler = this.setWatchHandler('mode');

        @Watch('active')
            private watchActiveHandler = this.setWatchHandler('active');

        @Watch('isFixed')
            private watchIsFixedHandler = this.setWatchHandler('isFixed');

        @Watch('toggleDisabled')
            private watchToggleDisabledHandler = this.setWatchHandler('toggleDisabled');

        @Watch('inputTitleDisabled')
            private watchInputTitleDisabledHandler = this.setWatchHandler('inputTitleDisabled');

        @Watch('options')
            private watchOptionsdHandler = this.setWatchHandler('options');

        @Watch('freezingRowsRanges', {
            deep: !0
        })
            private watchFreezingRowsRangesHandler(freezingRowsRanges: FreezingRowsRange[]) {
                const id = this.page?.id;
                const ranges = freezingRowsRanges ?? [];
                const freezingRanges = formatFreezingRowsRanges2Ranges(ranges);

                this.getContext().setFreezingRangesByPageId(id, freezingRanges);
            }
        
        public get attrs() : BasicPage {
            const {
                id, title, mode, value, active, options, isFixed,
                toggleDisabled, inputTitleDisabled, hoverTitle,
                freezingRowsRanges
            } = this;

            return {
                title, mode, value, active, isFixed, options,
                toggleDisabled, inputTitleDisabled,
                hoverTitle,
                freezing: {
                    ranges: formatFreezingRowsRanges2Ranges(freezingRowsRanges),
                    markers: []
                },
                id: id ?? createID(),
                passive: this.passive
            }
        }

        public page?: Page;

        private options!: Record<string, unknown>;

        private unWatchHandles: (() => void)[] = [];

        public addFreezingRanges(freezingRanges: Range[]) {
            const id = this.page?.id;
            return this.getContext().addFreezingRangesByPageId(id, this.formatEditFreezingRowsRanges(freezingRanges));
        }

        public removeFreezingRanges(freezingRanges: Range[]) {
            const id = this.page?.id;
            return this.getContext().removeFreezingRangesByPageId(id, this.formatEditFreezingRowsRanges(freezingRanges));
        }

        public removeAllFreezingRanges() {
            const id = this.page?.id;
            return this.getContext().removeAllFreezingRangesByPageId(id);
        }

        public create() {
            const page = this.getContext().setPage(this.attrs) || void 0;
            this.page = page as Page|undefined;

            this.initWatchPagePropertiesHandler();
            this.initEditorSessionEventListener();

            this.$emit('ready', this);
            return page;
        }

        public close(passive: boolean = !0) {
            const id = this.page?.id;
            return this.getContext().closePage(id, passive);
        }

        public getFreezingRowsRanges() {
            return this.page?.freezing.ranges
        }

        private refreshOptions() {
            this.options = formatAttrs(this.$attrs);
        }

        private cleanWatchHandles() {
            this.unWatchHandles.forEach(e => e());
            this.unWatchHandles = [];   
        }

        private initWatchPagePropertiesHandler() {
            const page = this.page;

            this.cleanWatchHandles();
            if (page) {
                this.unWatchHandles.push(
                    this.$watch(
                        () => page.title,
                        (title: string) => this.$emit('change-title', title),
                        {
                            immediate: !0
                        }
                    ),
                    this.$watch(
                        () => page.active,
                        (active: boolean) => this.$emit('change-active', active),
                        {
                            immediate: !0
                        }
                    )
                );
            }
        }

        private initEditorSessionEventListener() {
            const page = this.page;
            const session = page?.session;
            if (session) {
                SessionEvents.forEach((event) => {
                    session.on(event, (... args) => {
                        this.$emit(`session-${event}`, page, ... args);
                    })
                })
                SessionEvents.forEach((event) => {
                    session.selection.on(event, (... args: unknown[]) => {
                        this.$emit(`selection-${event}`, page, ... args);
                    })
                })
            }
        }

        private setWatchHandler(key: keyof BasicPage) {
            return function (this: AceEditorItem, value: never) {
                if (this.page) {
                    this.page[key] = value;
                }
            }
        }

        private formatEditFreezingRowsRanges(freezingRowsRanges: Range[]) :Range[] {
            return (freezingRowsRanges || []).map(e => {
                const e$ = e.clone();

                e$.start.column = 1;
                e$.end.column = 0;
                return e$;
            })
        }
        
        private beforeMount() {
            this.refreshOptions();
            this.create();
        }

        private beforeDestroy() {
            this.cleanWatchHandles();
            this.close();
        }

        private render() {
            return '';
        }
    }
</script>