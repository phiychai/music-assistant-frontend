import { mount } from "@vue/test-utils";
import { defineComponent, nextTick, ref } from "vue";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Toolbar from "@/components/Toolbar.vue";
import { provideContentScrollState } from "@/composables/useContentScrollState";

const { mockBack, mockPush, routerState } = vi.hoisted(() => ({
  mockBack: vi.fn(),
  mockPush: vi.fn(),
  routerState: {
    currentRoute: { value: { name: "albums" } },
    options: {
      history: {
        state: { back: null as string | null },
      },
    },
    afterEach: vi.fn(() => vi.fn()),
  },
}));

vi.mock("@/plugins/store", () => ({
  store: { mobileLayout: false },
}));

vi.mock("@/plugins/api", () => ({ api: {} }));

vi.mock("vue-router", () => ({
  useRouter: () => ({
    ...routerState,
    back: mockBack,
    push: mockPush,
  }),
}));

vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: (key: string) => ({ back: "Back", discover: "Discover" })[key] ?? key,
  }),
}));

describe("Toolbar page variant", () => {
  beforeEach(() => {
    mockBack.mockReset();
    mockPush.mockReset();
    routerState.currentRoute.value.name = "albums";
    routerState.options.history.state = { back: "/" };
  });

  it("renders the title and ghost back/home controls", () => {
    const wrapper = mount(Toolbar, {
      props: { variant: "page", title: "Albums" },
    });

    expect(wrapper.find(".header--page").exists()).toBe(true);
    expect(wrapper.text()).toContain("Albums");
    expect(
      wrapper
        .findAll("button[aria-label]")
        .map((button) => button.attributes("aria-label")),
    ).toEqual(["Back", "Home"]);
  });

  it("uses back navigation for info headers", async () => {
    const wrapper = mount(Toolbar, {
      props: { variant: "info", title: "Album" },
    });

    const button = wrapper.get("button[aria-label=Back]");
    expect(button.attributes("aria-label")).toBe("Back");
    expect(button.find("svg").exists()).toBe(true);

    await button.trigger("click");
    expect(mockBack).toHaveBeenCalledOnce();
  });

  it("adds the scrolled state from the content scroll container", async () => {
    const Host = defineComponent({
      components: { Toolbar },
      setup() {
        const container = ref<HTMLElement | null>(null);
        provideContentScrollState(container);
        return { container };
      },
      template:
        '<div ref="container"><Toolbar variant="page" title="Albums" /></div>',
    });

    const wrapper = mount(Host, {});
    const container = wrapper.get("div").element as HTMLElement & {
      scrollTop: number;
    };

    expect(wrapper.find(".header--scrolled").exists()).toBe(false);
    container.scrollTop = 1;
    container.dispatchEvent(new Event("scroll"));
    await nextTick();

    expect(wrapper.find(".header--scrolled").exists()).toBe(true);
    wrapper.unmount();
  });

  it("disables unavailable back and home navigation on Discover", () => {
    routerState.currentRoute.value.name = "discover";
    routerState.options.history.state = { back: null };

    const wrapper = mount(Toolbar, {
      props: { variant: "page", title: "Discover" },
    });

    for (const label of ["Back", "Home"]) {
      expect(
        wrapper.get(`button[aria-label=${label}]`).attributes("disabled"),
      ).toBeDefined();
    }
  });
});
