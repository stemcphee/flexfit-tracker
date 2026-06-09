export type WorkoutType =
  | "Push"
  | "Pull"
  | "Legs"
  | "Upper"
  | "Lower"
  | "Football"
  | "Active Recovery";

export type MuscleGroup =
  | "Chest"
  | "Back"
  | "Shoulders"
  | "Triceps"
  | "Biceps"
  | "Quads"
  | "Hamstrings"
  | "Glutes"
  | "Calves"
  | "Core";

export type Rpe = "Easy" | "Moderate" | "Hard" | "Max effort";
export type FootballIntensity = "Light" | "Moderate" | "Intense";

export type ExerciseLog = {
  id: string;
  exerciseName: string;
  muscleGroup: MuscleGroup[];
  equipment: string[];
  sets: number;
  targetReps: number;
  actualReps: number[];
  weight: number | null;
  rpe: Rpe;
  completed: boolean;
  notes: string;
};

export type WorkoutSession = {
  id: string;
  date: string;
  workoutType: WorkoutType;
  durationMinutes: number;
  notes: string;
  exercises: ExerciseLog[];
};

export type DailyActivity = {
  id: string;
  date: string;
  steps: number;
  stepGoalMet: boolean;
  notes: string;
};

export type FootballSession = {
  id: string;
  date: string;
  durationMinutes: number;
  intensity: FootballIntensity;
  notes: string;
};

export type EquipmentItem = {
  id: string;
  name: string;
  category: string;
  available: boolean;
};

export type ExerciseHistoryEntry = {
  id: string;
  date: string;
  workoutSessionId: string;
  workoutType: WorkoutType;
  exerciseName: string;
  muscleGroup: MuscleGroup[];
  equipment: string[];
  sets: number;
  targetReps: number;
  actualReps: number[];
  weight: number | null;
  rpe: Rpe;
  completed: boolean;
  notes: string;
};

export type LocalData = {
  workoutSessions: WorkoutSession[];
  dailyActivity: DailyActivity[];
  footballSessions: FootballSession[];
  equipment: EquipmentItem[];
  exerciseHistory: ExerciseHistoryEntry[];
};

export type WorkoutTemplateExercise = {
  id: string;
  exerciseName: string;
  muscleGroup: MuscleGroup[];
  equipment: string[];
  sets: number;
  targetReps: number;
  startingWeight: number | null;
  notes: string;
};

export type WorkoutTemplate = {
  workoutType: Exclude<WorkoutType, "Football" | "Active Recovery">;
  durationMinutes: number;
  notes: string;
  exercises: WorkoutTemplateExercise[];
};
