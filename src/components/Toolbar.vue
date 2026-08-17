<template>
  <header
    :class="[
      'header',
      { 'header--page': isPageHeader },
      { 'header--info': isInfoHeader },
      { 'header--scrolled': isScrolled },
    ]"
  >
    <div class="header__content">
      <Breadcrumb v-if="isPageHeader" class="header__breadcrumb">
        <BreadcrumbList class="header__breadcrumb-list">
          <BreadcrumbItem>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Back"
              title="Back"
              :disabled="!canGoBack"
              class="toolbar-navigation"
              @click="handleBack"
            >
              <ArrowLeft aria-hidden="true" />
            </Button>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Home"
              title="Home"
              :disabled="!canGoHome"
              class="toolbar-navigation"
              @click="handleHome"
            >
              <House aria-hidden="true" />
            </Button>
          </BreadcrumbItem>
          <BreadcrumbSeparator class="header__breadcrumb-separator">
            <Separator orientation="vertical" class="h-10 self-center" />
          </BreadcrumbSeparator>
          <BreadcrumbItem class="header__breadcrumb-page">
            <BreadcrumbPage
              class="header__title"
              :class="{ 'toolbar-title-wrapper': subtitle }"
              @click="!$slots.title && emit('titleClicked')"
            >
              <slot name="title">
                <span v-if="title || isDiscoverPage">
                  {{ title || (isDiscoverPage ? $t("discover") : "") }}
                </span>
              </slot>
              <span v-if="subtitle" class="toolbar-subtitle">{{
                subtitle
              }}</span>
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div v-else-if="icon" class="header__prepend">
        <Button
          variant="ghost"
          size="icon"
          :disabled="iconAction == null"
          class="toolbar-navigation"
          @click="iconAction?.()"
        >
          <v-icon v-if="typeof icon === 'string'" :icon="icon" size="22px" />
          <component :is="icon" v-else />
        </Button>
      </div>

      <div
        v-if="!isPageHeader"
        class="header__title"
        :class="{ 'toolbar-title-wrapper': subtitle }"
      >
        <slot name="title">
          <button v-if="title || isDiscoverPage" @click="emit('titleClicked')">
            {{ title || (isDiscoverPage ? $t("discover") : "") }}
          </button>
        </slot>
        <span v-if="subtitle" class="toolbar-subtitle">{{ subtitle }}</span>
      </div>

      <div v-if="$slots.append || menuItems?.length" class="header__append">
        <slot name="append"></slot>
        <Button
          v-for="menuItem of visibleMenuItems"
          :key="menuItem.label"
          variant="ghost"
          size="icon"
          :title="menuItemTitle(menuItem)"
          :aria-label="menuItemTitle(menuItem)"
          :disabled="menuItem.disabled == true"
          @click="(e: MouseEvent) => onMenuItemClick(e, menuItem)"
        >
          <v-badge :model-value="menuItem.active == true" color="primary" dot>
            <v-icon
              v-if="typeof menuItem.icon === 'string'"
              :icon="menuItem.icon"
              size="22px"
            />
            <component :is="menuItem.icon" v-else-if="menuItem.icon" />
          </v-badge>
        </Button>

        <div v-if="overflowItems.length" class="header__overflow">
          <v-menu
            v-model="overflowMenuOpen"
            location="bottom end"
            scrim
            :close-on-content-click="false"
          >
            <template #activator="{ props: activatorProps }">
              <Button
                variant="ghost"
                size="icon"
                aria-label="More actions"
                title="More actions"
                v-bind="activatorProps"
              >
                <v-badge :model-value="menuActive == true" color="primary" dot>
                  <MoreVertical aria-hidden="true" />
                </v-badge>
              </Button>
            </template>
            <v-list density="compact" slim tile>
              <v-list-item
                v-for="(menuItem, index) in overflowItems"
                :key="index"
                :title="menuItemTitle(menuItem)"
                :disabled="menuItem.disabled == true"
                :append-icon="
                  menuItem.subItems?.length ? 'mdi-chevron-right' : undefined
                "
                @click.prevent.stop="
                  (e: MouseEvent | KeyboardEvent) =>
                    onMenuItemClick(e, menuItem)
                "
              >
                <template v-if="menuItem.icon" #prepend>
                  <v-icon
                    v-if="typeof menuItem.icon === 'string'"
                    :icon="menuItem.icon"
                    size="22px"
                  />
                  <component :is="menuItem.icon" v-else />
                </template>
              </v-list-item>
            </v-list>
          </v-menu>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import type { ContextMenuItem } from "@/helpers/context_menu_item";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { useContentScrollState } from "@/composables/useContentScrollState";
import { eventbus } from "@/plugins/eventbus";
import { getBreakpointValue } from "@/plugins/breakpoint";
import { ArrowLeft, House, MoreVertical } from "@lucide/vue";
import { computed, onBeforeUnmount, ref, type Component } from "vue";
import { useRouter } from "vue-router";

interface Props {
  variant?: "section" | "page" | "info";
  navigation?: "home" | "back";
  color?: string;
  icon?: string | Component;
  title?: string;
  subtitle?: string;
  menuItems?: ToolBarMenuItem[];
  enforceOverflowMenu?: boolean;
  menuActive?: boolean;
  isDiscoverPage?: boolean;
  iconAction?: () => void;
}

const props = withDefaults(defineProps<Props>(), {
  variant: "section",
  navigation: undefined,
  color: "transparent",
  icon: undefined,
  title: undefined,
  subtitle: undefined,
  menuItems: undefined,
  enforceOverflowMenu: false,
  menuActive: false,
  isDiscoverPage: false,
  iconAction: undefined,
});

const emit = defineEmits<{
  (e: "iconClicked"): void;
  (e: "titleClicked"): void;
}>();

const router = useRouter();
const scrollState = useContentScrollState();
const overflowMenuOpen = ref(false);
const navigationHistory = ref({ canGoBack: false });
const isPageHeader = computed(() => props.variant !== "section");
const isInfoHeader = computed(() => props.variant === "info");
const isScrolled = computed(() => scrollState?.isScrolled.value ?? false);
const canGoBack = computed(
  () => props.iconAction != null || navigationHistory.value.canGoBack,
);
const canGoHome = computed(
  () => router.currentRoute.value?.name?.toString() !== "discover",
);
const visibleMenuItems = computed(() =>
  (props.menuItems ?? []).filter(
    (item) =>
      !item.hide &&
      (item.overflowAllowed === false ||
        (!props.enforceOverflowMenu && getBreakpointValue("bp8"))),
  ),
);
const overflowItems = computed(() =>
  (props.menuItems ?? []).filter(
    (item) => !item.hide && item.overflowAllowed !== false,
  ),
);

const menuItemTitle = (item: ToolBarMenuItem) => item.label;

const onMenuItemClick = (
  event: MouseEvent | KeyboardEvent,
  menuItem: ToolBarMenuItem,
) => {
  event.preventDefault();
  if (menuItem.subItems?.length) {
    eventbus.emit("contextmenu", {
      items: menuItem.subItems,
      posX: "clientX" in event ? event.clientX : 0,
      posY: "clientY" in event ? event.clientY : 0,
    });
  } else if (menuItem.action) {
    overflowMenuOpen.value = false;
    menuItem.action();
  }
};

const updateNavigationHistory = () => {
  navigationHistory.value = {
    canGoBack: router.options.history.state.back != null,
  };
};

updateNavigationHistory();
const removeAfterEach = router.afterEach(updateNavigationHistory);

onBeforeUnmount(() => removeAfterEach());

const handleBack = () => {
  if (props.iconAction) props.iconAction();
  else router.back();
};

const handleHome = () => {
  if (canGoHome.value) router.push({ name: "discover" });
};
</script>

<script lang="ts">
export interface ToolBarMenuItem extends ContextMenuItem {
  active?: boolean;
  subItems?: ContextMenuItem[];
  overflowAllowed?: boolean;
  closeOnContentClick?: boolean;
}
</script>

<style scoped>
.header {
  position: relative;
  z-index: 1;
  display: block;
  width: 100%;
  min-height: 55px;
  color: var(--foreground);
  background: var(--background);
}

.header__content {
  display: flex;
  width: 100%;
  min-height: 60px;
  align-items: center;
  gap: 8px;
  padding-inline: 12px;
}

.header__breadcrumb,
.header__title {
  min-width: 0;
  flex: 1;
  overflow: hidden;
}

.header__breadcrumb-list {
  flex-wrap: nowrap;
  min-width: 0;
  margin: 0;
  list-style: none;
  padding: 0;
}

.header__breadcrumb-page {
  min-width: 0;
  flex: 1;
  overflow: hidden;
}

.header__breadcrumb-page :deep([data-slot="breadcrumb-page"]) {
  display: flex;
  min-height: 40px;
  min-width: 0;
  align-items: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.header__prepend,
.header__append,
.header__overflow {
  display: flex;
  align-items: center;
  gap: 4px;
}

.header__append {
  flex-shrink: 0;
}

.header--page {
  position: sticky;
  top: 0;
  z-index: 30;
  height: 64px;
  background: var(--background) !important;
}

.header--page .header__content {
  min-height: 64px;
}

.header--info {
  background: transparent !important;
}

.header--scrolled {
  background: color-mix(in srgb, var(--sidebar) 92%, transparent) !important;
  backdrop-filter: blur(24px);
}

.toolbar-subtitle {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
