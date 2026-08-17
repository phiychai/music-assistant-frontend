import {
  inject,
  onBeforeUnmount,
  provide,
  readonly,
  type InjectionKey,
  type Ref,
  ref,
  watch,
} from "vue";

export interface ContentScrollState {
  isScrolled: Readonly<Ref<boolean>>;
}

const contentScrollStateKey: InjectionKey<ContentScrollState> = Symbol(
  "content-scroll-state",
);

export function provideContentScrollState(
  scrollContainer: Ref<HTMLElement | null>,
): ContentScrollState {
  const isScrolled = ref(false);
  let detach: (() => void) | undefined;

  const attach = (element: HTMLElement | null) => {
    detach?.();
    detach = undefined;
    isScrolled.value = element ? element.scrollTop > 0 : false;
    if (!element) return;

    const update = () => {
      isScrolled.value = element.scrollTop > 0;
    };
    element.addEventListener("scroll", update, { passive: true });
    detach = () => element.removeEventListener("scroll", update);
  };

  watch(scrollContainer, attach, { immediate: true });
  onBeforeUnmount(() => detach?.());

  const state = { isScrolled: readonly(isScrolled) };
  provide(contentScrollStateKey, state);
  return state;
}

export function useContentScrollState(): ContentScrollState | undefined {
  return inject(contentScrollStateKey, undefined);
}
