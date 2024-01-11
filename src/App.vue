<script setup lang="ts">
import EpTable from '@/plugins/components/EpTable/index.vue';
import { tableData, headerList, operateList } from '@/plugins/EpTable/tableData';
</script>

<template>
  <EpTable :tableData="tableData" :headerList="headerList" :operateList="operateList" />
</template>

<style scoped></style>
