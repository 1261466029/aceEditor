import Vue from 'vue';
import { ApiAuthEnum } from '@/types/api';
import { UserAgentEnum, FromEnum } from '@/types/default';

declare module 'vue/types/vue' {
  interface Vue {
    $eventBus: Vue;
    $fromIndex: FromEnum;
    $authIndex: ApiAuthEnum;
    $userAgent: UserAgentEnum;
    cache: Record<string, Vue>;
    keys: string[];
    _isMounted: boolean;
    _isDestroyed: boolean;
    _isBeingDestroyed: boolean;
  }
}
