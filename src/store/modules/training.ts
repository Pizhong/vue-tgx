interface TrainingRecord {
  date: string;
  duration: number; // 秒
  planName: string;
}

interface TrainingPlan {
  name: string;
  duration: number;
  squeezeTime: number; // 夹紧时长(秒)
  relaxTime: number; // 放松时长(秒)
}

export const useTrainingStore = defineStore("training", () => {
  const records = ref<TrainingRecord[]>([]);
  const plans = ref<TrainingPlan[]>([
    { name: "初级", duration: 300, squeezeTime: 3, relaxTime: 3 },
    { name: "中级", duration: 600, squeezeTime: 5, relaxTime: 3 },
    { name: "高级", duration: 900, squeezeTime: 7, relaxTime: 2 },
  ]);

  const currentPlan = ref<TrainingPlan | null>(null);
  const isTraining = ref(false);

  const saveRecord = (record: Omit<TrainingRecord, "date">) => {
    const newRecord = { ...record, date: new Date().toISOString() };
    records.value.unshift(newRecord);
    localStorage.setItem("kegel-records", JSON.stringify(records.value));
  };

  const loadRecords = () => {
    const savedRecords = localStorage.getItem("kegel-records");
    if (savedRecords) {
      records.value = JSON.parse(savedRecords);
    }
  };

  const selectPlan = (plan: TrainingPlan) => {
    currentPlan.value = plan;
  };

  return {
    records,
    plans,
    currentPlan,
    isTraining,
    saveRecord,
    loadRecords,
    selectPlan,
  };
});
