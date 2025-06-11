<template>
  <div v-if="store.currentPlan" class="trainer-container">
    <!-- 训练计划信息 -->
    <el-card class="plan-info">
      <div class="plan-header">
        <h2>{{ store.currentPlan.name }}计划</h2>
        <el-tag :type="statusTagType">{{ statusText }}</el-tag>
      </div>
      <div class="plan-stats">
        <div class="stat-item">
          <span>总时长</span>
          <strong>{{ formatTime(store.currentPlan.duration) }}</strong>
        </div>
        <div class="stat-item">
          <span>夹紧</span>
          <strong>{{ store.currentPlan.squeezeTime }}s</strong>
        </div>
        <div class="stat-item">
          <span>放松</span>
          <strong>{{ store.currentPlan.relaxTime }}s</strong>
        </div>
      </div>
    </el-card>

    <!-- 训练主界面 -->
    <div class="training-main" :class="phaseClass">
      <div class="progress-container">
        <el-progress
          :percentage="progressPercentage"
          :status="progressStatus"
          :stroke-width="16"
        />
        <div class="time-display">
          <span class="elapsed">{{ formatTime(elapsedTime) }}</span>
          <span class="separator">/</span>
          <span class="total">
            {{ formatTime(store.currentPlan.duration) }}
          </span>
        </div>
      </div>

      <div class="phase-display">
        <transition name="el-fade-in" mode="out-in">
          <div :key="currentPhase" class="phase-content">
            <h1>{{ phaseDisplayText }}</h1>
            <p class="phase-timer">{{ currentPhaseTime }}s</p>
          </div>
        </transition>
      </div>

      <div class="controls">
        <el-button
          type="primary"
          size="large"
          @click="toggleTraining"
          :disabled="isCompleted"
          round
        >
          <el-icon :size="20"><component :is="actionIcon" /></el-icon>
          {{ actionText }}
        </el-button>
        <el-button
          size="large"
          @click="resetTraining"
          :disabled="elapsedTime === 0"
          round
        >
          <el-icon :size="20"><Refresh /></el-icon>
          重置
        </el-button>
      </div>
    </div>

    <!-- 完成提示（使用teleport避免布局挤压） -->
    <teleport to="body">
      <el-dialog
        v-model="showCompletion"
        title="训练完成"
        width="90%"
        :show-close="false"
        :close-on-click-modal="false"
        custom-class="completion-dialog"
      >
        <p>恭喜完成 {{ store.currentPlan.name }} 训练！</p>
        <template #footer>
          <el-button type="primary" @click="showCompletion = false">
            确定
          </el-button>
        </template>
      </el-dialog>
    </teleport>
  </div>
</template>

<script lang="ts" setup>
import { useTrainingStore } from "@/store";
import { VideoPlay, VideoPause, Refresh } from "@element-plus/icons-vue";
import { ref, computed, onMounted, onUnmounted, watch } from "vue";

// 语音系统
const voiceFiles = {
  start: () => import("@/assets/audio/start.mp3"),
  pause: () => import("@/assets/audio/pause.mp3"),
  complete: () => import("@/assets/audio/complete.mp3"),
  squeeze: () => import("@/assets/audio/squeeze.mp3"),
  relax: () => import("@/assets/audio/relax.mp3"),
};

const audioElements = new Map<string, HTMLAudioElement>();

const loadVoices = async () => {
  for (const [type, loader] of Object.entries(voiceFiles)) {
    try {
      const audio = new Audio((await loader()).default);
      audio.preload = "auto";
      audioElements.set(type, audio);
    } catch (error) {
      console.error(`加载语音${type}失败:`, error);
    }
  }
};

const playVoice = (type: string) => {
  const audio = audioElements.get(type);
  if (audio) {
    audio.currentTime = 0;
    audio.play().catch((e) => console.warn(`播放${type}语音失败:`, e));
  }
};

// 训练逻辑
const store = useTrainingStore();
onMounted(() => {
  console.log(store.currentPlan);
});
const isTraining = ref(false);
const elapsedTime = ref(0);
const currentPhase = ref<"prepare" | "squeeze" | "relax">("prepare");
const currentPhaseTime = ref(0);
const showCompletion = ref(false);
let timer: number | null = null;

// 计算属性
const isCompleted = computed(
  () => elapsedTime.value >= store.currentPlan!.duration
);
const progressPercentage = computed(() =>
  Math.min(100, (elapsedTime.value / store.currentPlan!.duration) * 100)
);
const progressStatus = computed(() =>
  isCompleted.value
    ? "success"
    : currentPhase.value === "squeeze"
      ? "exception"
      : "success"
);
const phaseDisplayText = computed(() => {
  switch (currentPhase.value) {
    case "prepare":
      return "准备开始";
    case "squeeze":
      return "💪 夹紧";
    case "relax":
      return "🔄 放松";
    default:
      return "";
  }
});
const phaseClass = computed(() => {
  switch (currentPhase.value) {
    case "prepare":
      return "";
    case "squeeze":
      return "squeezing";
    case "relax":
      return "relaxing";
    default:
      return "";
  }
});
const statusText = computed(() => {
  if (isCompleted.value) return "已完成";
  return isTraining.value
    ? "训练中"
    : elapsedTime.value > 0
      ? "已暂停"
      : "准备开始";
});
const statusTagType = computed(() => {
  if (isCompleted.value) return "success";
  return isTraining.value ? "warning" : "info";
});
const actionText = computed(() => {
  if (isCompleted.value) return "已完成";
  return isTraining.value ? "暂停" : elapsedTime.value > 0 ? "继续" : "开始";
});
const actionIcon = computed(() => (isTraining.value ? VideoPause : VideoPlay));

// 格式化时间 (MM:SS)
const formatTime = (seconds: number) => {
  if (isNaN(seconds)) return "00:00";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

// 获取当前阶段时长
const getCurrentPhaseDuration = () => {
  switch (currentPhase.value) {
    case "prepare":
      return 1; // 准备阶段1秒
    case "squeeze":
      return store.currentPlan!.squeezeTime;
    case "relax":
      return store.currentPlan!.relaxTime;
    default:
      return 0;
  }
};

// 训练控制方法
const startTraining = () => {
  if (isCompleted.value) return;

  isTraining.value = true;

  // 首次开始时播放提示音
  if (elapsedTime.value === 0) {
    playVoice("start");
    currentPhase.value = "prepare"; // 设置为准备阶段
    currentPhaseTime.value = 0;
  }

  // 清除已有计时器
  if (timer) clearInterval(timer);

  timer = setInterval(() => {
    elapsedTime.value += 1;
    currentPhaseTime.value += 1;

    const phaseDuration = getCurrentPhaseDuration();

    // 阶段切换
    if (currentPhaseTime.value >= phaseDuration) {
      switch (currentPhase.value) {
        case "prepare":
          currentPhase.value = "squeeze";
          playVoice("squeeze");
          break;
        case "squeeze":
          currentPhase.value = "relax";
          playVoice("relax");
          break;
        case "relax":
          currentPhase.value = "squeeze";
          playVoice("squeeze");
          break;
      }
      currentPhaseTime.value = 0;
    }

    // 完成检测
    if (isCompleted.value) {
      completeTraining();
    }
  }, 1000) as unknown as number;
};

const pauseTraining = () => {
  isTraining.value = false;
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
  playVoice("pause");
};

const resetTraining = () => {
  pauseTraining();
  elapsedTime.value = 0;
  currentPhaseTime.value = 0;
  currentPhase.value = "prepare";
  showCompletion.value = false;
};

const completeTraining = () => {
  pauseTraining();
  showCompletion.value = true;
  playVoice("complete");
  store.saveRecord({
    duration: elapsedTime.value,
    planName: store.currentPlan!.name,
  });
};

const toggleTraining = () => {
  if (isTraining.value) pauseTraining();
  else startTraining();
};

// 初始化
onMounted(() => {
  resetTraining();
  loadVoices();
});

// 清理
onUnmounted(() => {
  pauseTraining();
  audioElements.forEach((audio) => {
    audio.pause();
    audio.remove();
  });
});

// 计划变更时重置
watch(() => store.currentPlan, resetTraining);
</script>

<style scoped>
.trainer-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  box-sizing: border-box;
}

.plan-info {
  background-color: var(--el-color-primary-light-9);
  border: none;
  margin-bottom: 20px;
}

.plan-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.plan-header h2 {
  margin: 0;
  font-size: 1.5rem;
}

.plan-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px;
  background-color: white;
  border-radius: 8px;
}

.stat-item span {
  font-size: 0.9rem;
  color: var(--el-text-color-secondary);
}

.stat-item strong {
  font-size: 1.1rem;
  color: var(--el-color-primary);
}

.training-main {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 24px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  margin-bottom: 20px;
}

.training-main.squeezing {
  border-left: 6px solid var(--el-color-danger);
}

.training-main.relaxing {
  border-left: 6px solid var(--el-color-success);
}

.progress-container {
  position: relative;
}

.time-display {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: baseline;
  font-family: monospace;
}

.elapsed {
  font-size: 1.2rem;
  color: var(--el-text-color-primary);
}

.separator {
  margin: 0 4px;
  color: var(--el-text-color-secondary);
}

.total {
  font-size: 0.9rem;
  color: var(--el-text-color-placeholder);
}

.phase-display {
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.phase-content {
  text-align: center;
}

.phase-content h1 {
  font-size: 2.5rem;
  margin: 0 0 8px;
  transition: all 0.3s;
}

.squeezing .phase-content h1 {
  color: var(--el-color-danger);
}

.relaxing .phase-content h1 {
  color: var(--el-color-success);
}

.phase-timer {
  font-size: 1.8rem;
  font-weight: bold;
  margin: 0;
  font-family: monospace;
}

.controls {
  display: flex;
  justify-content: center;
  gap: 16px;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .trainer-container {
    padding: 12px;
    min-height: calc(100vh - 60px); /* 为底部导航留空间 */
  }

  .plan-header h2 {
    font-size: 1.3rem;
  }

  .plan-stats {
    grid-template-columns: 1fr;
  }

  .training-main {
    padding: 16px;
  }

  .phase-content h1 {
    font-size: 2rem;
  }

  .phase-timer {
    font-size: 1.5rem;
  }

  .controls {
    flex-direction: column;
    align-items: center;
  }

  .controls .el-button {
    width: 100%;
    margin-bottom: 10px;
  }
}

/* 超小屏幕适配 */
@media (max-width: 480px) {
  .phase-content h1 {
    font-size: 1.8rem;
  }

  .phase-timer {
    font-size: 1.3rem;
  }
}
</style>

<style>
/* 全局对话框样式调整 */
.completion-dialog {
  max-width: 95%;
  margin-top: 5vh !important;
}
</style>
