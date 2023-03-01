<template>
  <div id="app">
    <!--
    <ace-editor 
      class="max editor"
      theme="behave"
      :print-margin="!1"
      :enable-basic-autocompletion="!0" 
      :enable-live-autocompletion="!0"
      :enable-snippets="!0">
    </ace-editor>
  -->
    <ace-editor 
      class="max"
      theme="behave"
      :print-margin="!1"
      :enable-auto-indent="!0"
      :enable-basic-autocompletion="!0" 
      :enable-live-autocompletion="!0"
      :enable-snippets="!0"
      :page-limit="[ 1, 10 ]"
      :modes="[ 'css', 'javascript', 'text' ]"
      :enable-theme-change="!1"
      :enable-mode-change="!1"
      :enable-tab-menu="!1" >
      <ace-editor-item mode="javascript" title="测试只读" v-model="readonly" :freezing-rows-ranges="[ [ 0, 6 ], [ 10, 10 ] ]" />
      <ace-editor-item mode="text" />
    </ace-editor>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component({
  components: {
    'ace-editor': () => 
      import('@/components/AceEditor/index/index.vue'),
    'ace-editor-item': () => 
      import('@/components/AceEditor/item.vue')
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
}
</script>

<style lang="less">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.header {
  flex-shrink: 0;
}

.content {
  display: flex;
  height: 100%;
  padding: 4px;
  .editor {
    &:not(:last-child) {
      margin-right: 4px;
    }
  }
}

.action-item {
  cursor: pointer;
  &:not(.active) {
    opacity: .5;
  }

  &:not(:last-child) {
    margin-right: 1em;
  } 
}
</style>
