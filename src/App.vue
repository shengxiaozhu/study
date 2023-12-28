<script setup lang="ts">
import EpTable from '@/components/EpTable/index.vue';
import { tableData, headerList, operateList } from '@/components/EpTable/tableData';
</script>

<template>
  <EpTable :tableData="tableData" :headerList="headerList" :operateList="operateList" />
</template>

<style scoped></style>
