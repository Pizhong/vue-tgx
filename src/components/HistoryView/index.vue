<template>
  <el-table :data="store.records" stripe>
    <el-table-column prop="date" label="日期" width="180">
      <template #default="{ row }">
        {{ new Date(row.date).toLocaleString() }}
      </template>
    </el-table-column>
    <el-table-column prop="planName" label="计划" width="120" />
    <el-table-column prop="duration" label="时长(秒)" />
  </el-table>
</template>

<script setup lang="ts">
import { useTrainingStore } from "@/store";
import { onMounted } from "vue";

const store = useTrainingStore();
onMounted(() => store.loadRecords());
</script>
