<template>
    <a-select v-model="myValue" :mode="selectMode"  v-bind="$attrs">
        <a-select-option :value="item.value" v-for="(item, i) in modeSelection" :key="i">
            {{ item.name }}
        </a-select-option>
    </a-select>
</template>

<script lang="ts">
    import { Component, Prop, Inject, Vue, Watch } from 'vue-property-decorator';
    import { Select } from 'ant-design-vue';

    import { EditorModesProvider } from '..';
    import { isNull } from '../util';

    Vue.use(Select);

    @Component({
        name: 'AceEditorModeSelect'
    })
    export default class AceEditorModeSelect extends Vue {
        @Prop({
            default: null
        })
            public value!: unknown;
        @Prop()
            public onlyModeIds!: string[];
        @Prop({
            default: 'multiple'
        })
            public selectMode!: string;

        public myValue: unknown = null
        @Watch('value', {
            deep: !0,
            immediate: !0
        })
            private watchValueHandler(value: unknown) {
                if (value !== '' && !isNull(value)) {
                    if (this.isEqual(value)) {
                        this.myValue = value;
                    }
                } else {
                    this.myValue = null;
                }
            }
        @Watch('myValue', {
            deep: !0
        })
            private watchMyValueHandler(value: unknown) {
                this.$emit('input', value);
                this.$emit('change', value);
            }

        public get modeSelection() {
            return EditorModesProvider.filter(({ id }) =>
                !this.onlyModeIds || this.onlyModeIds.indexOf(id) !== -1
            ).map(({ name, id }) => ({
                name,
                value: id
            }))
        }

        private isEqual(nv: unknown) {
            const ov = this.myValue;

            if (typeof nv === 'string') {
                return nv === ov;
            }

            return String(nv) === String(ov);
        }
    }
</script>