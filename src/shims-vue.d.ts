declare module '*.vue' {
  import Vue from 'vue';
  export default Vue;
}

interface ZhCN {
  [key: string]: any;
}

declare module 'ant-design-vue/lib/locale-provider/zh_CN' {
  import zh from 'ant-design-vue/lib/locale-provider/zh_CN';

  const zhcn = ZhCN;

  export default zhcn;
}

declare module 'vue-virtual-scroll-list';

declare module 'vue-infinite-scroll';

declare module 'vue-ellipsis-text';

declare module 'vue-pdf';

declare module '*.svg';

declare module '*.less';

interface Window extends Window {
  MathJax: {
    typeset: (t?: HTMLElement[]) => void;
  };
  wx: any;
  ADMIN_URL?: string;
  API_URL?: string;
}
