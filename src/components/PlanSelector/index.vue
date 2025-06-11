<template>
  <el-card class="plan-container" body-style="padding: 0;">
    <h3 style="padding: 16px 16px 0">选择训练计划</h3>
    <el-scrollbar>
      <div class="plan-list">
        <el-radio-group
          v-model="selectedPlanName"
          @change="handleSelect"
          class="radio-group"
        >
          <div v-for="plan in store.plans" :key="plan.name" class="plan-item">
            <el-radio :label="plan.name" class="plan-radio">
              <el-card shadow="hover" class="plan-card">
                <h4>{{ plan.name }}计划</h4>
                <div class="plan-details">
                  <div class="detail-item">
                    <span class="label">总时长</span>
                    <span class="value">{{ formatTime(plan.duration) }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">夹紧</span>
                    <span class="value">{{ plan.squeezeTime }}秒</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">放松</span>
                    <span class="value">{{ plan.relaxTime }}秒</span>
                  </div>
                </div>
              </el-card>
            </el-radio>
          </div>
        </el-radio-group>
      </div>
    </el-scrollbar>
  </el-card>
</template>

<script setup lang="ts">
import { useTrainingStore } from "@/store";
import { ref } from "vue";

const store = useTrainingStore();
const selectedPlanName = ref("");

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const handleSelect = () => {
  const selectedPlan = store.plans.find(
    (plan) => plan.name === selectedPlanName.value
  );
  if (selectedPlan) {
    store.selectPlan(selectedPlan);
  }
};
</script>

<style scoped>
.plan-container {
  width: 100%;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.plan-list {
  display: flex;
  padding: 12px;
  gap: 12px;
  overflow-x: auto;
}

.radio-group {
  display: flex;
  gap: 12px;
}

.plan-item {
  flex: 0 0 auto;
}

.plan-radio {
  height: 100%;
}

.plan-radio :deep(.el-radio__input) {
  display: none; /* 隐藏默认单选按钮 */
}

.plan-radio :deep(.el-radio__label) {
  padding: 0;
}

.plan-card {
  width: 240px;
  height: 100%;
  cursor: pointer;
  transition: all 0.3s;
}

.plan-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.plan-details {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  margin-top: 12px;
}

.detail-item {
  display: flex;
  flex-direction: column;
}

.label {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.value {
  font-size: 16px;
  font-weight: 500;
}

/* 选中状态样式 */
.plan-radio.is-checked .plan-card {
  border-color: var(--el-color-primary);
  background-color: var(--el-color-primary-light-9);
}

/* 滚动条隐藏（保留功能） */
:deep(.el-scrollbar__bar) {
  opacity: 0.3;
}
</style>
