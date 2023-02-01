<template>
    <div id="app">
      <ace-editor 
        class="max"
        theme="behave"
        :print-margin="!1"
        :enable-auto-indent="!0"
        :enable-basic-autocompletion="!0" 
        :enable-live-autocompletion="!0"
        :enable-snippets="!0"
        :page-limit="[ 1, 10 ]"
        @ready="onReady"
        @editor-change="onChange"
        @editor-changeSession="onChangeSession">
        <ace-editor-page mode="javascript" title="测试只读" v-model="readonly" :freezing-rows-range-array="[ [ 0, 6 ], [ 10, 10 ] ]" @selection-changeSelection="onChangeSelection" />
        <ace-editor-page mode="text" @selection-changeSelection="onChangeSelection" />
      </ace-editor>
    </div>
  </template>
  
  <script lang="ts">
  import { Component, Vue } from 'vue-property-decorator';
  
  @Component({
    components: {
      'ace-editor': () => 
        import('@/components/aceEditor/main/main.vue'),
      'ace-editor-page': () => 
        import('@/components/aceEditor/page/page.vue')
    },
  })
  export default class App extends Vue {
    public readonly = `  const name = 'Junde';
  const detail = 'Lilalala';

  console.log(name, detail);

  const title = \`\$\{name\} - \$\{detail\}\`;
  alert(title);

  // todo: Your code

  console.log(answer);`

    public onReady(editor: any) {
      console.log(editor)
    }

    public onChange(... args: any) {
      console.log('chnge', args);
    }

    public onChangeSelection(... args: any) {
      console.log('chnge selection', args);
    }

    public onChangeSession(... args: any) {
      console.log('chnge session', args);
    }

    public bindPage(page: any) {
      (this.$refs.aceEditorPage as any).removePageFreezing(page, [ 6, 10 ])
    }
  }
  </script>
  
  <style lang="less">
  #app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    height: 100%;
  }
  </style>
  