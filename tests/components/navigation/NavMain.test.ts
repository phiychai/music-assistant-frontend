import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h } from "vue";
import NavMain from "@/components/navigation/NavMain.vue";

const routeState = vi.hoisted(() => ({
  path: "/artists",
  fullPath: "/artists",
}));

vi.mock("vue-router", () => ({
  RouterLink: defineComponent({
    props: ["to"],
    template: "<a><slot /></a>",
  }),
  useRoute: () => routeState,
  useRouter: () => ({
    resolve: (url: string) => ({ href: url }),
  }),
}));

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

vi.mock("@/components/ui/separator", () => ({
  Separator: defineComponent({ template: "<hr />" }),
}));

vi.mock("@/components/navigation/NavSectionHeader.vue", () => ({
  default: defineComponent({ template: "<div />" }),
}));

vi.mock("@/components/navigation/utils/getMenuItems", () => ({
  setMenuItemHidden: vi.fn(),
  setMenuItemsOrder: vi.fn(),
}));

vi.mock("@/composables/useListDragReorder", () => ({
  useListDragReorder: () => ({
    startItemDrag: vi.fn(),
    draggingIndex: { value: null },
    isDragging: { value: false },
    ghostY: { value: 0 },
    dragRowHeight: { value: 0 },
    rowOffset: () => 0,
  }),
}));

vi.mock("@/components/ui/sidebar", () => ({
  SidebarGroup: defineComponent({ template: "<section><slot /></section>" }),
  SidebarGroupAction: defineComponent({
    render() {
      return h("button", this.$attrs, this.$slots.default?.());
    },
  }),
  SidebarGroupContent: defineComponent({
    template: "<div data-testid='group-content' v-bind='$attrs'><slot /></div>",
  }),
  SidebarGroupLabel: defineComponent({
    render() {
      return h("span", this.$attrs, this.$slots.default?.());
    },
  }),
  SidebarMenu: defineComponent({ template: "<ul><slot /></ul>" }),
  SidebarMenuButton: defineComponent({
    props: ["isActive", "tooltip", "disabled"],
    template: "<button><slot /></button>",
  }),
  SidebarMenuItem: defineComponent({ template: "<li><slot /></li>" }),
  useSidebar: () => ({
    isMobile: { value: false },
    setOpenMobile: vi.fn(),
    state: { value: "expanded" },
  }),
}));

vi.mock("@/components/ui/collapsible", () => ({
  Collapsible: defineComponent({
    props: ["open"],
    emits: ["update:open"],
    template: "<div><slot /></div>",
  }),
  CollapsibleContent: defineComponent({
    template:
      "<div v-if='$parent?.$props.open' data-testid='collapsible-content'><slot /></div>",
  }),
  CollapsibleTrigger: defineComponent({
    props: ["ariaLabel"],
    emits: ["click"],
    template:
      "<button :aria-expanded='$parent?.$props.open' :aria-label='ariaLabel' @click='$parent?.$emit(\"update:open\", !$parent?.$props.open)'><slot /></button>",
  }),
}));

vi.mock("@lucide/vue", () => ({
  ChevronRight: defineComponent({ template: "<svg />" }),
  Eye: defineComponent({ template: "<svg />" }),
  EyeOff: defineComponent({ template: "<svg />" }),
  GripVertical: defineComponent({ template: "<svg />" }),
}));

describe("NavMain", () => {
  beforeEach(() => {
    routeState.path = "/artists";
    routeState.fullPath = "/artists";
  });

  it("collapses and expands a labelled group", async () => {
    const wrapper = mount(NavMain, {
      props: {
        label: "Library",
        items: [
          {
            title: "Artists",
            url: "/artists",
          },
        ],
      },
    });

    expect(wrapper.find("button[aria-expanded='true']").exists()).toBe(true);
    expect(wrapper.find("[data-testid='group-content']").exists()).toBe(true);

    await wrapper.get("button[aria-expanded='true']").trigger("click");

    expect(wrapper.find("button[aria-expanded='false']").exists()).toBe(true);
    expect(wrapper.find("[data-testid='group-content']").exists()).toBe(false);

    await wrapper.get("button[aria-expanded='false']").trigger("click");

    expect(wrapper.find("button[aria-expanded='true']").exists()).toBe(true);
    expect(wrapper.find("[data-testid='group-content']").exists()).toBe(true);
  });

  it("renders the collapse chevron beside the group label", () => {
    const wrapper = mount(NavMain, {
      props: {
        label: "System",
        items: [
          {
            title: "Settings",
            url: "/settings",
          },
        ],
      },
    });

    const heading = wrapper.get("button[aria-label='System collapse toggle']");
    expect(heading.find("svg").exists()).toBe(true);
    expect(wrapper.find("[aria-label='System actions']").exists()).toBe(false);
    expect(heading.attributes("aria-expanded")).toBe("true");
  });
});
