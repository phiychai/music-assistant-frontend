import { mount } from "@vue/test-utils";
import { defineComponent, nextTick, ref } from "vue";
import { describe, expect, it } from "vitest";
import {
  provideContentScrollState,
  type ContentScrollState,
} from "@/composables/useContentScrollState";

describe("useContentScrollState", () => {
  it("tracks the scroll position of the provided container", async () => {
    let state: ContentScrollState | undefined;
    const Host = defineComponent({
      setup() {
        const container = ref<HTMLElement | null>(null);
        state = provideContentScrollState(container);
        return { container };
      },
      template: '<div ref="container" />',
    });

    const wrapper = mount(Host);
    await nextTick();
    const element = wrapper.get("div").element as HTMLElement & {
      scrollTop: number;
    };

    expect(state?.isScrolled.value).toBe(false);

    element.scrollTop = 12;
    element.dispatchEvent(new Event("scroll"));

    expect(state?.isScrolled.value).toBe(true);
    wrapper.unmount();
  });
});
