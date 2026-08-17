import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, ref } from "vue";
import AppSidebar from "@/components/navigation/AppSidebar.vue";

const router = {
  back: vi.fn(),
  forward: vi.fn(),
  go: vi.fn(),
  push: vi.fn(),
};

const authState = vi.hoisted(() => ({
  isAdmin: false,
  logout: vi.fn(),
}));

const storeState = vi.hoisted(() => ({
  isIngressSession: false,
}));

const themeState = vi.hoisted(() => ({
  isDarkTheme: { value: false },
  setThemePreference: vi.fn(),
}));

vi.mock("@/composables/useThemePreference", () => ({
  useThemePreference: () => themeState,
}));

vi.mock("vue-router", () => ({
  useRoute: () => ({ fullPath: "/" }),
  useRouter: () => router,
}));

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

vi.mock("@/plugins/eventbus", () => ({
  eventbus: {
    on: vi.fn(),
    off: vi.fn(),
  },
}));

vi.mock("@/plugins/homeassistant", () => ({
  haState: { kioskModeEnabled: false },
}));

vi.mock("@/components/navigation/NavMain.vue", () => ({
  default: defineComponent({
    name: "CommandCenterContent",
    props: {
      items: {
        type: Array,
        default: () => [],
      },
      label: String,
      actions: Array,
      showActionButton: Boolean,
    },
    render() {
      const items = this.items as Array<{
        title: string;
        url: string;
      }>;
      return h("nav", {
        "data-label": this.label,
        "data-items": items
          .map((item) => `${item.title}:${item.url}`)
          .join("|"),
        "data-show-action-button": this.showActionButton ? "true" : "false",
      });
    },
  }),
}));

vi.mock("@/components/navigation/NavShortcuts.vue", () => ({
  default: defineComponent({ template: "<nav />" }),
}));

vi.mock("@/components/navigation/NavHeaderMenu.vue", () => ({
  default: defineComponent({ template: "<button />" }),
}));

vi.mock("@/components/navigation/NavHomeAssistant.vue", () => ({
  default: defineComponent({ template: "<button />" }),
}));

vi.mock("@/components/navigation/NavMobile.vue", () => ({
  default: defineComponent({ template: "<button />" }),
}));

vi.mock("@/components/command-center/CommandCenterContent.vue", () => ({
  default: defineComponent({
    props: {
      inputId: String,
    },
    emits: ["select"],
    template:
      "<button data-testid='command-center-content' @click='$emit(\"select\")' />",
  }),
}));

vi.mock("@/components/AddGenreDialog.vue", () => ({
  default: defineComponent({ template: "<div />" }),
}));

vi.mock("@/plugins/api", () => ({
  default: {
    providers: {},
  },
}));

vi.mock("@/plugins/auth", () => ({
  authManager: {
    isAdmin: () => authState.isAdmin,
    logout: authState.logout,
  },
}));

vi.mock("@/plugins/store", () => ({
  store: {
    globalSearchTerm: "",
    globalSearchType: undefined,
    get isIngressSession() {
      return storeState.isIngressSession;
    },
  },
}));

vi.mock("@/components/navigation/utils/getMenuItems", () => ({
  resolveMenuConfig: () => ({ sections: {} }),
  getMenuItems: () => [
    {
      label: "search",
      path: "/search",
      icon: defineComponent({ template: "<svg />" }),
      group: "explore",
    },
    {
      label: "artists",
      path: "/artists",
      icon: defineComponent({ template: "<svg />" }),
      group: "library",
    },
    {
      label: "settings.settings",
      path: "/settings",
      icon: defineComponent({ template: "<svg />" }),
      group: "system",
    },
    {
      label: "settings.server_logging",
      path: "/settings/serverlogs",
      icon: defineComponent({ template: "<svg />" }),
      group: "system",
    },
    {
      label: "background_tasks.title",
      path: "/settings/tasks",
      icon: defineComponent({ template: "<svg />" }),
      group: "system",
    },
    {
      label: "settings.genre_management",
      path: "/settings/genremanagement",
      icon: defineComponent({ template: "<svg />" }),
      group: "system",
    },
    {
      label: "settings.audio_analysis",
      path: "/settings/audio-analysis",
      icon: defineComponent({ template: "<svg />" }),
      group: "system",
    },
    {
      label: "settings.about",
      path: "/settings/about",
      icon: defineComponent({ template: "<svg />" }),
      group: "system",
    },
  ],
}));

vi.mock("@/components/ui/dialog", () => ({
  Dialog: defineComponent({
    props: {
      open: Boolean,
    },
    template:
      "<div v-if='open' data-testid='search-command-dialog'><slot /></div>",
  }),
  DialogContent: defineComponent({
    template: "<div data-testid='search-command-dialog-content'><slot /></div>",
  }),
  DialogHeader: defineComponent({ template: "<div><slot /></div>" }),
  DialogDescription: defineComponent({ template: "<p><slot /></p>" }),
  DialogTitle: defineComponent({ template: "<div><slot /></div>" }),
}));

vi.mock("@/components/ui/command", () => ({
  Command: defineComponent({
    template: "<div data-testid='search-command-palette'><slot /></div>",
  }),
  CommandGroup: defineComponent({
    props: {
      heading: String,
    },
    template: "<div><slot /></div>",
  }),
  CommandInput: defineComponent({
    props: {
      id: String,
      modelValue: String,
      placeholder: String,
      ariaLabel: String,
    },
    emits: ["update:modelValue"],
    template: "<input :id='id' :value='modelValue' />",
  }),
  CommandItem: defineComponent({
    props: {
      value: String,
    },
    emits: ["select"],
    template: "<button @click='$emit(\"select\")'><slot /></button>",
  }),
  CommandList: defineComponent({ template: "<div><slot /></div>" }),
}));

vi.mock("@/components/ui/sidebar", () => ({
  Sidebar: defineComponent({ template: "<aside><slot /></aside>" }),
  SidebarContent: defineComponent({ template: "<div><slot /></div>" }),
  SidebarFooter: defineComponent({ template: "<footer><slot /></footer>" }),
  SidebarHeader: defineComponent({ template: "<header><slot /></header>" }),
  SidebarInput: defineComponent({
    template: "<input v-bind='$attrs' />",
  }),
  SidebarMenu: defineComponent({ template: "<div><slot /></div>" }),
  SidebarMenuButton: defineComponent({
    props: ["tooltip", "disabled"],
    render() {
      return h(
        "button",
        {
          disabled: this.disabled,
          title: this.tooltip,
          ...this.$attrs,
        },
        this.$slots.default?.(),
      );
    },
  }),
  SidebarMenuItem: defineComponent({ template: "<div><slot /></div>" }),
  SidebarTrigger: defineComponent({ template: "<button />" }),
  useSidebar: () => ({
    toggleSidebar: vi.fn(),
    setOpen: vi.fn(),
    state: { value: "expanded" },
    isMobile: ref(false),
    setOpenMobile: vi.fn(),
  }),
}));

vi.mock("@lucide/vue", () => ({
  ArrowLeftIcon: defineComponent({ template: "<span>&lt;</span>" }),
  ArrowRightIcon: defineComponent({ template: "<span>&gt;</span>" }),
  ChevronLeft: defineComponent({ template: "<span>&lt;</span>" }),
  ChevronRight: defineComponent({ template: "<span>&gt;</span>" }),
  Home: defineComponent({ template: "<span>home</span>" }),
  RefreshCw: defineComponent({ template: "<span>refresh</span>" }),
  RotateCwIcon: defineComponent({ template: "<span>refresh</span>" }),
  LogOut: defineComponent({ template: "<span>logout</span>" }),
  Moon: defineComponent({ template: "<span>moon</span>" }),
  PanelLeft: defineComponent({ template: "<span>toggle</span>" }),
  Palette: defineComponent({ template: "<span>edit</span>" }),
  Search: defineComponent({ template: "<svg />" }),
  Sun: defineComponent({ template: "<span>sun</span>" }),
}));

describe("AppSidebar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authState.isAdmin = false;
    storeState.isIngressSession = false;
    themeState.isDarkTheme.value = false;
    themeState.setThemePreference.mockReset();
  });

  it("renders settings tools as system items without a group add button", () => {
    const wrapper = mount(AppSidebar);
    const systemNav = wrapper.get("nav[data-label=system]");

    expect(systemNav.attributes("data-items")).toBe(
      "settings.settings:/settings|settings.server_logging:/settings/serverlogs|background_tasks.title:/settings/tasks|settings.genre_management:/settings/genremanagement|settings.audio_analysis:/settings/audio-analysis|settings.about:/settings/about",
    );
    expect(systemNav.attributes("data-show-action-button")).toBe("false");
  });

  it("navigates to the full search page", async () => {
    const wrapper = mount(AppSidebar);

    await wrapper.get("input[readonly]").trigger("click");

    expect(router.push).toHaveBeenCalledWith("/search");
  });

  it("renders footer quick actions for sidebar, theme, and sign out", async () => {
    const wrapper = mount(AppSidebar);

    expect(wrapper.find(".scroll-fade").exists()).toBe(true);
    expect(wrapper.find("[data-testid=sidebar-footer-collapse]").exists()).toBe(
      true,
    );
    expect(wrapper.find("[data-testid=sidebar-footer-theme]").exists()).toBe(
      true,
    );
    expect(wrapper.find("[data-testid=sidebar-footer-logout]").exists()).toBe(
      true,
    );

    await wrapper.get("[data-testid=sidebar-footer-theme]").trigger("click");
    await wrapper.get("[data-testid=sidebar-footer-logout]").trigger("click");

    expect(themeState.setThemePreference).toHaveBeenCalledWith("dark");
    expect(authState.logout).toHaveBeenCalledOnce();
  });

  it("hides the footer sign out action for ingress sessions", () => {
    storeState.isIngressSession = true;

    const wrapper = mount(AppSidebar);

    expect(wrapper.find("[data-testid=sidebar-footer-logout]").exists()).toBe(
      false,
    );
  });
});
