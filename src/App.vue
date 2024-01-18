<script setup lang="ts">
import EpTable from '@/plugins/EpTable/components/index.vue';
import { tableData, headerList, operateList } from '@/plugins/EpTable/components/tableData';
</script>

<template>
  <EpTable page="aaaa" :tableData="tableData" :headerList="headerList" :operateList="operateList" env="development" />
</template>

<style scoped></style>
