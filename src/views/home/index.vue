<template>
  <el-table :data="props.tableData">
    <el-table-column type="index" width="50" />
  </el-table>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    tableData: any[];
  }>(),
  {
    tableData: () => [],
  }
);
</script>
