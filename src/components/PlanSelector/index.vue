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
          <!-- 预设计划 -->
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

          <!-- 自定义计划选项 -->
          <div class="plan-item">
            <el-radio label="custom" class="plan-radio">
              <el-card shadow="hover" class="plan-card">
                <h4>自定义计划</h4>
                <div class="plan-details">
                  <div class="detail-item">
                    <span class="label">总时长</span>
                    <el-input-number
                      v-model="customPlan.durationMin"
                      :min="1"
                      :max="60"
                      size="small"
                      controls-position="right"
                    >
                      <template #suffix>
                        <span>分钟</span>
                      </template>
                    </el-input-number>
                  </div>
                  <div class="detail-item">
                    <span class="label">夹紧</span>
                    <el-input-number
                      v-model="customPlan.squeezeTime"
                      :min="1"
                      :max="60"
                      size="small"
                      controls-position="right"
                    >
                      <template #suffix>
                        <span>秒</span>
                      </template>
                    </el-input-number>
                  </div>
                  <div class="detail-item">
                    <span class="label">放松</span>
                    <el-input-number
                      v-model="customPlan.relaxTime"
                      :min="1"
                      :max="60"
                      size="small"
                      controls-position="right"
                    >
                      <template #suffix>
                        <span>秒</span>
                      </template>
                    </el-input-number>
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
import { ref, watch } from "vue";

const store = useTrainingStore();
const selectedPlanName = ref("");

// 自定义计划数据
const customPlan = ref({
  name: "自定义",
  durationMin: 5,
  squeezeTime: 3,
  relaxTime: 3,
});

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const handleSelect = (planName: string | number | boolean | undefined) => {
  if (planName === "custom") {
    // 应用自定义计划
    const selectedPlan = {
      name: customPlan.value.name,
      duration: customPlan.value.durationMin * 60,
      squeezeTime: customPlan.value.squeezeTime,
      relaxTime: customPlan.value.relaxTime,
    };
    store.selectPlan(selectedPlan);
  } else {
    // 选择预设计划
    const selectedPlan = store.plans.find((plan) => plan.name === planName);
    if (selectedPlan) {
      store.selectPlan(selectedPlan);
    }
  }
};

// 监听自定义计划变化，自动应用
watch(
  () => [
    customPlan.value.durationMin,
    customPlan.value.squeezeTime,
    customPlan.value.relaxTime,
  ],
  () => {
    if (selectedPlanName.value === "custom") {
      handleSelect("custom");
    }
  },
  { deep: true }
);
</script>

<style scoped>
/* 保持原有样式不变 */
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
  display: none;
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

.plan-radio.is-checked .plan-card {
  border-color: var(--el-color-primary);
  background-color: var(--el-color-primary-light-9);
}

/* 自定义计划输入框调整 */
:deep(.el-input-number) {
  width: 100px;
  margin-right: 5px;
}

:deep(.el-input-number .el-input__inner) {
  text-align: center;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .plan-card {
    width: 280px;
  }

  :deep(.el-input-number) {
    width: 70px;
  }
}
</style>
