<template>
  <el-container>
    <el-main>
      <el-tabs type="border-card">
        <el-tab-pane label="训练">
          <PlanSelector />
          <KegelTrainer v-if="$trainingStore.currentPlan" />
        </el-tab-pane>
        <el-tab-pane label="历史记录">
          <HistoryView />
        </el-tab-pane>
      </el-tabs>
    </el-main>
  </el-container>
</template>

<script setup lang="ts">
import PlanSelector from "@/components/PlanSelector/index.vue";
import KegelTrainer from "@/components/KegelTrainer/index.vue";
import HistoryView from "@/components/HistoryView/index.vue";
import { useTrainingStore } from "@/store";

const $trainingStore = useTrainingStore();
</script>
