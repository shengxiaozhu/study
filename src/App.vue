<script setup lang="ts">
import EpTable from '@/plugins/EpTable/components/index.vue';
import { tableData, headerList, operateList } from '@/plugins/EpTable/components/tableData';
</script>

<template>
  <EpTable :tableData="tableData" :headerList="headerList" :operateList="operateList" />
</template>

<style scoped></style>
