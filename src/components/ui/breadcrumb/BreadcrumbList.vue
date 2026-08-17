<script lang="ts" setup>
import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "vue";

const props = defineProps<{ class?: HTMLAttributes["class"] }>();
</script>

<template>
  <ol
    data-slot="breadcrumb-list"
    :class="
      cn(
        'text-muted-foreground m-0 flex list-none flex-wrap items-center gap-1.5 p-0 text-sm break-words',
        props.class,
      )
    "
  >
    <slot></slot>
  </ol>
</template>
