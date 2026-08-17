<script setup lang="ts">
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { openLinkInNewTab } from "@/helpers/utils";
import { useSidebar } from "@/components/ui/sidebar";
import { authManager } from "@/plugins/auth";
import { store } from "@/plugins/store";
import { Info, LifeBuoy, LogOut, Menu, Settings, UserRound } from "@lucide/vue";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import NavLanguageMenu from "./NavLanguageMenu.vue";
import NavSidebarMenu from "./NavSidebarMenu.vue";
import NavThemeMenu from "./NavThemeMenu.vue";

const { t } = useI18n();
const isEditMode = computed(() => store.navMenuEditMode);
const displayName = computed(
  () => store.currentUser?.display_name || store.currentUser?.username || "",
);
const username = computed(() => store.currentUser?.username || "");
const roleLabel = computed(() => {
  switch (store.currentUser?.role) {
    case "admin":
      return t("auth.admin_role");
    case "guest":
      return t("auth.guest_role");
    case "user":
      return t("auth.user_role");
    default:
      return "";
  }
});
const initial = computed(() =>
  displayName.value ? displayName.value[0].toUpperCase() : "U",
);

const router = useRouter();
const { isMobile, setOpenMobile } = useSidebar();

const handleProfile = () => {
  setOpenMobile(false);
  router.push({ name: "profile" });
};

const handleSettings = () => {
  setOpenMobile(false);
  router.push({ name: "settings" });
};

const handleHelp = () => {
  setOpenMobile(false);
  openLinkInNewTab("https://music-assistant.io/help/");
};

const handleAbout = () => {
  setOpenMobile(false);
  router.push({ name: "aboutsettings" });
};

const handleLogout = () => {
  setOpenMobile(false);
  authManager.logout();
};
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button
        variant="ghost"
        size="icon-lg"
        class="sidebar-header-menu data-[state=open]:bg-sidebar-active data-[state=open]:text-sidebar-accent-foreground mr-0 mt-0 mb-0"
        aria-label="Open profile menu"
        @click.stop
      >
        <Menu />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent
      :class="[
        'z-[100001] min-w-56 rounded-lg',
        isEditMode ? 'min-w-64' : 'min-w-56',
      ]"
      :side="isMobile ? 'bottom' : 'bottom'"
      :side-offset="isMobile ? 4 : 15"
      align="center"
    >
      <DropdownMenuLabel class="p-0 font-normal">
        <div class="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
          <Avatar class="mr-1 h-10 w-10 rounded-full">
            <AvatarImage
              v-if="store.currentUser?.avatar_url"
              :src="store.currentUser.avatar_url"
              :alt="displayName"
            />
            <AvatarFallback
              class="rounded-full bg-primary text-primary-foreground"
            >
              {{ initial }}
            </AvatarFallback>
          </Avatar>
          <div class="grid flex-1 text-left text-sm leading-tight">
            <span class="truncate font-medium">{{ displayName }}</span>
            <span class="text-muted-foreground truncate text-xs">
              <span v-if="username">@{{ username }}</span>
            </span>
            <span
              v-if="roleLabel"
              class="text-muted-foreground/80 truncate text-[0.65rem]"
            >
              {{ roleLabel }}
            </span>
          </div>
        </div>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem @click="handleProfile">
        <UserRound class="size-4" />
        {{ $t("auth.profile") }}
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem @click="handleSettings">
        <Settings class="size-4" />
        {{ $t("settings.settings") }}
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <NavSidebarMenu />
      <DropdownMenuSeparator />
      <NavThemeMenu />
      <NavLanguageMenu />
      <DropdownMenuSeparator />
      <DropdownMenuItem v-if="!store.isIngressSession" @click="handleLogout">
        <LogOut class="size-4" />
        {{ $t("auth.logout") }}
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem @click="handleHelp">
        <LifeBuoy class="size-4" />
        {{ $t("tooltip.help") }}
      </DropdownMenuItem>
      <DropdownMenuItem @click="handleAbout">
        <Info class="size-4" />
        {{ $t("settings.about") }}
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>

<style scoped>
.sidebar-header-menu {
  color: hsl(var(--sidebar-foreground));
  margin: 0 4px 8px 0;
}
</style>
