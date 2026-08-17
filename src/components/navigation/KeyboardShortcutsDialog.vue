<script setup lang="ts">
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { eventbus } from "@/plugins/eventbus";
import { computed, onMounted, onUnmounted, ref } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const open = ref(false);

const shortcuts = computed(() => [
  { label: t("shortcut_play_pause"), keys: ["Space", "K"] },
  { label: t("shortcut_seek_back"), keys: ["←"] },
  { label: t("shortcut_seek_forward"), keys: ["→"] },
  { label: t("shortcut_volume_up"), keys: ["↑"] },
  { label: t("shortcut_volume_down"), keys: ["↓"] },
  { label: t("shortcut_mute"), keys: ["M"] },
  { label: t("shortcut_toggle_queue"), keys: ["Q"] },
  { label: t("command_center_title"), keys: ["Ctrl/Cmd", "K"] },
  { label: t("sidebar"), keys: ["Ctrl/Cmd", "B"] },
  { label: t("right_sidebar"), keys: ["Ctrl/Cmd", "Shift", "B"] },
  { label: t("open_fullscreen_player"), keys: ["Ctrl/Cmd", "Shift", "F"] },
  { label: t("players"), keys: ["Ctrl/Cmd", "P"] },
  { label: t("keyboard_shortcuts"), keys: ["Ctrl/Cmd", "Shift", "P"] },
  { label: t("search"), keys: ["Ctrl/Cmd", "L"] },
  { label: t("queue"), keys: ["Ctrl/Cmd", "Q"] },
  { label: t("lyrics_show"), keys: ["Ctrl/Cmd", "Shift", "L"] },
]);

const openDialog = () => {
  open.value = true;
};

onMounted(() => eventbus.on("keyboardShortcutsDialog", openDialog));
onUnmounted(() => eventbus.off("keyboardShortcutsDialog", openDialog));
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="max-w-md">
      <DialogHeader>
        <DialogTitle>{{ t("keyboard_shortcuts") }}</DialogTitle>
        <DialogDescription>
          {{ t("keyboard_shortcuts_description") }}
        </DialogDescription>
      </DialogHeader>
      <div class="space-y-2">
        <div
          v-for="shortcut in shortcuts"
          :key="shortcut.label"
          class="flex items-center justify-between gap-4 rounded-md border px-3 py-2"
        >
          <span class="text-sm">{{ shortcut.label }}</span>
          <span class="flex shrink-0 items-center gap-1">
            <kbd
              v-for="key in shortcut.keys"
              :key="key"
              class="bg-muted text-muted-foreground rounded border px-1.5 py-0.5 font-mono text-xs"
            >
              {{ key }}
            </kbd>
          </span>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
