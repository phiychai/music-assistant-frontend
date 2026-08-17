<script setup lang="ts">
import NavMain from "@/components/navigation/NavMain.vue";
import NavShortcuts from "@/components/navigation/NavShortcuts.vue";
import AppLogo from "@/components/AppLogo.vue";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useThemePreference } from "@/composables/useThemePreference";
import { authManager } from "@/plugins/auth";
import { eventbus } from "@/plugins/eventbus";
import { haState } from "@/plugins/homeassistant";
import { store } from "@/plugins/store";
import { Check, LogOut, Moon, PanelLeft, Search, Sun } from "@lucide/vue";
import { computed, onMounted, onUnmounted, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import NavHomeAssistant from "./NavHomeAssistant.vue";
import NavMobile from "./NavMobile.vue";
import NavHeaderMenu from "./NavHeaderMenu.vue";
import {
  getMenuItems,
  resolveMenuConfig,
  type MenuGroup,
} from "./utils/getMenuItems";

const router = useRouter();
const { t } = useI18n();

const editMode = computed(() => store.navMenuEditMode);

const navItems = computed(() =>
  getMenuItems()
    // Edit mode lists every (available) item so hidden ones can be re-enabled.
    .filter((item) => editMode.value || !item.hidden)
    .map((item) => ({
      id: item.id,
      title: t(item.label),
      url: item.path,
      icon: item.icon,
      disabled: editMode.value ? undefined : item.disabled,
      hidden: item.hidden,
      group: item.group,
    })),
);

const searchItem = computed(() =>
  navItems.value.find((item) => item.url === "/search"),
);
const discoverItems = computed(() =>
  navItems.value.filter(
    (item) =>
      item.group === "explore" &&
      (editMode.value || item.url !== searchItem.value?.url),
  ),
);
const libraryItems = computed(() =>
  navItems.value.filter((item) => item.group === "library"),
);
const pluginItems = computed(() =>
  navItems.value.filter((item) => item.group === "plugins"),
);
const systemItems = computed(() =>
  navItems.value.filter((item) => item.group === "system"),
);

const DEFAULT_SECTION_LABELS: Record<MenuGroup, string> = {
  explore: "explore",
  library: "library",
  plugins: "plugins",
  system: "system",
};

const sections = computed(() => {
  const sectionConfigs = resolveMenuConfig().sections;
  const resolved = {} as Record<
    MenuGroup,
    { label: string; defaultLabel: string; labelHidden: boolean }
  >;
  for (const [group, labelKey] of Object.entries(DEFAULT_SECTION_LABELS)) {
    const cfg = sectionConfigs[group as MenuGroup] ?? {};
    const defaultLabel = t(labelKey);
    resolved[group as MenuGroup] = {
      label: cfg.label || defaultLabel,
      defaultLabel,
      labelHidden: !!cfg.hide_label,
    };
  }
  return resolved;
});

const { toggleSidebar, setOpen, state, isMobile, setOpenMobile } = useSidebar();
const { isDarkTheme, setThemePreference } = useThemePreference();
const collapsed = computed(() => state.value === "collapsed");
const themeToggleLabel = computed(() =>
  t(`settings.theme.options.${isDarkTheme.value ? "light" : "dark"}`),
);

// Editing needs the full (labeled) menu, so pop the sidebar open when edit
// mode is entered from anywhere (profile menu, settings page shortcut), and
// treat collapsing to icon mode as leaving edit mode.
watch(editMode, (editing) => {
  if (editing && !isMobile.value) setOpen(true);
});
watch(collapsed, (isCollapsed) => {
  if (isCollapsed && store.navMenuEditMode) store.navMenuEditMode = false;
});

const handleOpenSidebar = () => {
  if (isMobile.value) {
    toggleSidebar();
  }
};

const openSearchPage = () => {
  if (searchItem.value?.disabled) return;
  if (isMobile.value) {
    setOpenMobile(false);
  }
  router.push(searchItem.value?.url ?? "/search");
};

const toggleTheme = () =>
  setThemePreference(isDarkTheme.value ? "light" : "dark");

const handleFooterLogout = () => {
  if (isMobile.value) {
    setOpenMobile(false);
  }
  authManager.logout();
};

onMounted(() => {
  eventbus.on("mobile-sidebar-open", handleOpenSidebar);
});

onUnmounted(() => {
  eventbus.off("mobile-sidebar-open", handleOpenSidebar);
  store.navMenuEditMode = false;
});
</script>

<template>
  <Sidebar collapsible="icon">
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem :class="{ 'mb-3': !collapsed }">
          <div class="flex w-full items-center justify-between gap-2">
            <div
              class="relative flex min-w-0 cursor-pointer items-center gap-1.5 transition-opacity duration-300 ease-[ease]"
              @click="router.push('/')"
            >
              <AppLogo />
              <div
                v-if="!collapsed"
                class="mt-[3px] ml-2.5 overflow-hidden text-[1.2rem] font-bold whitespace-nowrap transition-opacity duration-200 ease-[ease]"
              >
                Music Assistant
              </div>
            </div>
            <NavHeaderMenu v-if="!collapsed" />
          </div>
        </SidebarMenuItem>
        <SidebarMenuItem v-if="collapsed" class="mb-3 flex w-full items-center">
          <NavHeaderMenu />
        </SidebarMenuItem>
        <SidebarMenuItem v-if="searchItem && !editMode">
          <div v-if="!collapsed" class="flex items-center gap-3">
            <div class="relative min-w-0 flex-auto">
              <SidebarInput
                readonly
                :placeholder="`${t('search')}...`"
                :aria-label="searchItem.title"
                class="sidebar-search-input text-muted-foreground cursor-pointer pr-[4.75rem]! h-10"
                @click="openSearchPage"
                @keydown.enter.prevent="openSearchPage"
                @keydown.space.prevent="openSearchPage"
              />
              <Button
                variant="ghost"
                size="icon-sm"
                :title="t('command_center.open_full_search')"
                :aria-label="t('command_center.open_full_search')"
                data-testid="sidebar-search-open"
                class="hover:text-foreground absolute top-1/2 right-1.5 -translate-y-1/2"
                @click.stop="openSearchPage"
              >
                <Search />
              </Button>
            </div>
          </div>
          <template v-else>
            <SidebarMenuButton
              as="button"
              type="button"
              :tooltip="searchItem.title"
              :disabled="searchItem.disabled"
              :aria-label="searchItem.title"
              class="mx-0!"
              @click="openSearchPage"
            >
              <component :is="searchItem.icon" class="mr-1" />
            </SidebarMenuButton>
          </template>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
    <SidebarContent class="scroll-fade">
      <NavMain
        :items="discoverItems"
        :label="sections.explore.label"
        :default-label="sections.explore.defaultLabel"
        section-id="explore"
        :edit-mode="editMode"
        class="mt-1"
      />
      <NavMain
        :items="libraryItems"
        :label="sections.library.label"
        :default-label="sections.library.defaultLabel"
        :label-hidden="sections.library.labelHidden"
        section-id="library"
        :edit-mode="editMode"
      />
      <NavMain
        :items="pluginItems"
        :label="sections.plugins.label"
        :default-label="sections.plugins.defaultLabel"
        :label-hidden="sections.plugins.labelHidden"
        section-id="plugins"
        :edit-mode="editMode"
      />
      <NavMain
        :items="systemItems"
        :label="sections.system.label"
        :default-label="sections.system.defaultLabel"
        :label-hidden="sections.system.labelHidden"
        section-id="system"
        :edit-mode="editMode"
      />
      <NavShortcuts :edit-mode="editMode" />
    </SidebarContent>
    <SidebarFooter class="pb-3">
      <Button
        v-if="editMode"
        class="w-full rounded-full"
        @click="store.navMenuEditMode = false"
      >
        <Check class="size-4" />
        {{ t("menu_edit_disable") }}
      </Button>
      <!-- Kiosk mode leaves no Home Assistant chrome on screen, so this is the
           only way back to it. -->
      <NavHomeAssistant v-if="haState.kioskModeEnabled" />
      <NavMobile v-else-if="isMobile" />
      <ButtonGroup
        v-else
        :orientation="collapsed ? 'vertical' : 'horizontal'"
        class="w-full items-center justify-center gap-4 px-2 pt-1 [&>button]:rounded-md"
      >
        <Button
          variant="ghost"
          size="icon"
          title="Toggle sidebar"
          aria-label="Toggle sidebar"
          data-testid="sidebar-footer-collapse"
          class="basis-auto shrink-0 grow-0"
          @click="toggleSidebar"
        >
          <PanelLeft />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          :title="themeToggleLabel"
          :aria-label="themeToggleLabel"
          data-testid="sidebar-footer-theme"
          class="basis-auto shrink-0 grow-0"
          @click="toggleTheme"
        >
          <Sun v-if="isDarkTheme" />
          <Moon v-else />
        </Button>
        <Button
          v-if="!store.isIngressSession"
          variant="ghost"
          size="icon"
          title="Sign out"
          aria-label="Sign out"
          data-testid="sidebar-footer-logout"
          class="basis-auto shrink-0 grow-0"
          @click="handleFooterLogout"
        >
          <LogOut />
        </Button>
      </ButtonGroup>
    </SidebarFooter>
  </Sidebar>
</template>

<style scoped>
.sidebar-header-title {
  font-size: 1.2rem;
  font-weight: bold;
  margin: 3px 0 0 10px;
  white-space: nowrap;
  overflow: hidden;
  transition: opacity 0.2s ease;
}

.sidebar-header {
  display: flex;
  align-items: center;
  margin: 2px 15px 8px 0;
  gap: 6px;
  transition: opacity 0.3s ease;
  position: relative;
  cursor: pointer;
}

.menu-edit-done {
  width: 100%;
  border-radius: 999px;
}

:deep([data-sidebar="group"]) {
  padding-left: 0 !important;
  padding-right: 0.5rem !important;
  padding-top: 0.125rem !important;
  padding-bottom: 0.125rem !important;
}

:deep([data-sidebar="group-label"]) {
  height: 1.75rem !important;
  padding-left: 1rem !important;
  font-size: 0.875rem !important;
  font-weight: 500 !important;
  letter-spacing: 0.01em !important;
  color: hsl(var(--sidebar-foreground)) !important;
  opacity: 0.55;
}

:deep([data-sidebar="menu-button"]) {
  margin-left: 0.5rem !important;
  margin-right: 0.5rem !important;
  min-height: 1.75rem !important;
  padding-top: 0.125rem !important;
  padding-bottom: 0.125rem !important;
}

:deep([data-sidebar="menu-button"] > svg) {
  width: 1.6rem !important;
  height: 1.6rem !important;
  margin-right: 0.5rem !important;
}

:deep([data-sidebar="menu-button"] > svg.artist-icon) {
  width: 1.2rem !important;
  height: 1.2rem !important;
  margin-right: 0.3rem !important;
}

:deep([data-sidebar="menu-button"] > svg.genre-icon) {
  width: auto !important;
  height: auto !important;
  margin-right: 0.3rem !important;
}

@media (min-height: 700px) {
  :deep([data-sidebar="menu-button"]) {
    min-height: 2.25rem !important;
    padding-top: 0.375rem !important;
    padding-bottom: 0.375rem !important;
  }

  :deep([data-sidebar="menu-button"] > svg) {
    width: 2rem !important;
    height: 2rem !important;
  }

  :deep([data-sidebar="menu-button"] > svg.artist-icon) {
    width: 1.4rem !important;
    height: 1.4rem !important;
  }
}

.sidebar-search-input[data-sidebar="input"] {
  background-color: transparent !important;
}

[data-mobile="true"] [data-sidebar="footer"] [data-sidebar="menu-button"] {
  margin-left: 0 !important;
}
[data-mobile="true"]
  [data-sidebar="footer"]
  [data-sidebar="menu-button"]
  > svg {
  width: 1rem !important;
  height: 1rem !important;
}
</style>
