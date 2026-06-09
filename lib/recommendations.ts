import { MUSCLE_GROUPS, STEP_GOAL } from "@/lib/constants";
import { LocalData, MuscleGroup, WorkoutSession, WorkoutType } from "@/lib/types";
import { compareDescByDate, isWithinDays, startOfWeek } from "@/lib/utils";

type RecommendationResult = {
  workout: WorkoutType;
  reason: string;
  walkReminder: string | null;
};

const LOWER_TYPES: WorkoutType[] = ["Legs", "Lower", "Football"];
const UPPER_TYPES: WorkoutType[] = ["Push", "Pull", "Upper"];

function getWeekSessions(sessions: WorkoutSession[]) {
  const weekStart = startOfWeek(new Date());
  return sessions.filter((session) => new Date(session.date) >= weekStart);
}

function countWeeklyMuscleHits(data: LocalData) {
  const weekStart = startOfWeek(new Date());
  const counts = Object.fromEntries(MUSCLE_GROUPS.map((group) => [group, 0])) as Record<MuscleGroup, number>;

  data.workoutSessions.forEach((session) => {
    if (new Date(session.date) < weekStart) return;
    session.exercises.forEach((exercise) => {
      exercise.muscleGroup.forEach((group) => {
        counts[group] += 1;
      });
    });
  });

  return counts;
}

export function getMuscleBalance(data: LocalData) {
  const counts = countWeeklyMuscleHits(data);
  return MUSCLE_GROUPS.map((group) => {
    const hits = counts[group];
    const status = hits <= 2 ? "Undertrained" : hits <= 5 ? "Balanced" : "High volume";
    return { group, hits, status };
  });
}

export function getSuggestedWorkout(data: LocalData): RecommendationResult {
  const sortedWorkouts = compareDescByDate(data.workoutSessions);
  const lastWorkout = sortedWorkouts[0];
  const lastFootball = compareDescByDate(data.footballSessions)[0];
  const weeklyBalance = getMuscleBalance(data);
  const todayActivity = data.dailyActivity.find((entry) => entry.date === new Date().toISOString().slice(0, 10));
  const walkReminder = todayActivity && todayActivity.steps >= STEP_GOAL ? null : "Walk to 10,000 steps today.";

  if (
    lastFootball &&
    lastFootball.intensity === "Intense" &&
    new Date().getTime() - new Date(lastFootball.date).getTime() < 36 * 60 * 60 * 1000
  ) {
    return {
      workout: "Pull",
      reason: "Intense football was logged recently, so a heavy lower session is deprioritised.",
      walkReminder,
    };
  }

  const undertrained = weeklyBalance.filter((item) => item.status === "Undertrained").map((item) => item.group);
  const upperNeglected = undertrained.some((group) => ["Chest", "Back", "Shoulders", "Biceps", "Triceps"].includes(group));
  const lowerNeglected = undertrained.some((group) => ["Quads", "Hamstrings", "Glutes", "Calves"].includes(group));

  if (lastWorkout?.workoutType === "Push") {
    return {
      workout: "Pull",
      reason: "Push was trained most recently and pulling volume is the cleanest complement.",
      walkReminder,
    };
  }

  if (lastWorkout?.workoutType === "Pull" && lowerNeglected) {
    return {
      workout: "Legs",
      reason: "Lower body is due and hasn’t been covered enough this week.",
      walkReminder,
    };
  }

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const legsRecent = sortedWorkouts.some(
    (session) =>
      ["Legs", "Lower"].includes(session.workoutType) && new Date(session.date) >= sevenDaysAgo,
  );

  if (!legsRecent && !lastFootball) {
    return {
      workout: "Legs",
      reason: "Leg training has been missed for at least a week.",
      walkReminder,
    };
  }

  if (upperNeglected) {
    return {
      workout: "Upper",
      reason: "Upper-body muscle groups are underrepresented this week.",
      walkReminder,
    };
  }

  const weeklySessions = getWeekSessions(data.workoutSessions);
  const lowerCount = weeklySessions.filter((session) => LOWER_TYPES.includes(session.workoutType)).length;
  const upperCount = weeklySessions.filter((session) => UPPER_TYPES.includes(session.workoutType)).length;

  if (lowerCount < upperCount) {
    return {
      workout: "Lower",
      reason: "Lower-body work is trailing upper-body work this week.",
      walkReminder,
    };
  }

  return {
    workout: "Push",
    reason: "Consistency is the priority, and push work fits your recent pattern well.",
    walkReminder,
  };
}

export function getWeeklySummary(data: LocalData) {
  return {
    workouts: data.workoutSessions.filter((session) => isWithinDays(session.date, 7)).length,
    football: data.footballSessions.filter((session) => isWithinDays(session.date, 7)).length,
    stepsHit: data.dailyActivity.filter((entry) => isWithinDays(entry.date, 7) && entry.stepGoalMet).length,
  };
}
