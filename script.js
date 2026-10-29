
const STORAGE_KEY = "skillsprint-dashboard-tasks";
const WEEKLY_GOAL_KEY = "skillsprint-weekly-goal";

// Load existing tasks and weekly goal.
let tasks = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
let weeklyGoal = Number(localStorage.getItem(WEEKLY_GOAL_KEY)) || 5;

const form = document.getElementById("taskForm");
const nameInput = document.getElementById("taskName");
const deadlineInput = document.getElementById("taskDeadline");
const taskList = document.getElementById("taskList");
const weeklyGoalForm = document.getElementById("weeklyGoalForm");
const weeklyGoalInput = document.getElementById("weeklyGoalInput");

weeklyGoalInput.value = weeklyGoal;

// Show today's date.
document.getElementById("today").textContent =
  new Date().toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric"
  });

// Save tasks without changing the existing storage key.
function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// Calculate progress for the current Monday-to-Sunday week.
function updateWeeklyProgress() {
  const now = new Date();
  const weekStart = new Date(now);
  const day = weekStart.getDay();

  weekStart.setDate(
    weekStart.getDate() - (day === 0 ? 6 : day - 1)
  );
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const completedThisWeek = tasks.filter(task => {
    if (!task.completed || !task.completedAt) {
      return false;
    }

    const completedDate = new Date(task.completedAt);

    return (
      !Number.isNaN(completedDate.getTime()) &&
      completedDate >= weekStart &&
      completedDate < weekEnd
    );
  }).length;

  const percent = Math.min(
    100,
    Math.round((completedThisWeek / weeklyGoal) * 100)
  );

  document.getElementById("weeklyPercent").textContent =
    percent + "%";

  document.getElementById("weeklyProgressFill").style.width =
    percent + "%";

  document.getElementById("weeklyProgressText").textContent =
    `${completedThisWeek} of ${weeklyGoal} tasks completed this week.`;

  let message;

  if (completedThisWeek >= weeklyGoal) {
    message = "🎉 Weekly goal achieved! Great work!";
  } else if (completedThisWeek === 0) {
    message = "Complete your first task to start your weekly progress!";
  } else {
    message =
      `${weeklyGoal - completedThisWeek} more task(s) to reach your goal.`;
  }

  document.getElementById("weeklyProgressNote").textContent = message;
}

// Update dashboard cards and render the task list.
function renderTasks() {
  const total = tasks.length;
  const completed = tasks.filter(task => task.completed).length;
  const pending = total - completed;
  const percent = total === 0
    ? 0
    : Math.round((completed / total) * 100);

  document.getElementById("totalTasks").textContent = total;
  document.getElementById("completedTasks").textContent = completed;
  document.getElementById("pendingTasks").textContent = pending;
  document.getElementById("progressPercent").textContent = percent + "%";
  document.getElementById("progressFill").style.width = percent + "%";

  let message;

  if (total === 0) {
    message = "Let's complete your first task!";
  } else if (percent === 100) {
    message = "Amazing! You've completed all your tasks.";
  } else {
    message = `${completed} of ${total} tasks completed. Keep going!`;
  }

  document.getElementById("progressNote").textContent = message;

  updateWeeklyProgress();
  taskList.replaceChildren();

  if (total === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent =
      "No tasks yet. Add your first learning goal above!";
    taskList.appendChild(empty);
    return;
  }

  tasks.forEach(task => {
    const item = document.createElement("div");
    item.className = "task-item" + (task.completed ? " completed" : "");

    const info = document.createElement("div");
    info.className = "task-info";

    const title = document.createElement("strong");
    title.textContent = task.name;

    const deadline = document.createElement("small");
    deadline.textContent = task.deadline
      ? "Deadline: " + task.deadline
      : "No deadline set";

    info.append(title, deadline);

    const actions = document.createElement("div");
    actions.className = "task-actions";

    const toggle = document.createElement("button");
    toggle.className = "done-btn";
    toggle.textContent = task.completed ? "Undo" : "Done";

    toggle.addEventListener("click", () => {
      if (task.completed) {
        task.completed = false;
        delete task.completedAt;
      } else {
        task.completed = true;
        task.completedAt = new Date().toISOString();
      }

      saveTasks();
      renderTasks();
    });

    const remove = document.createElement("button");
    remove.className = "delete-btn";
    remove.textContent = "Delete";

    remove.addEventListener("click", () => {
      tasks = tasks.filter(existingTask => existingTask.id !== task.id);
      saveTasks();
      renderTasks();
    });

    actions.append(toggle, remove);
    item.append(info, actions);
    taskList.appendChild(item);
  });
}

// Add a new learning task.
form.addEventListener("submit", event => {
  event.preventDefault();

  const name = nameInput.value.trim();

  if (!name) return;

  tasks.unshift({
    id: Date.now().toString() + Math.random().toString(16).slice(2),
    name,
    deadline: deadlineInput.value,
    completed: false
  });

  saveTasks();
  renderTasks();
  form.reset();
  nameInput.focus();
});

// Save a new weekly target.
weeklyGoalForm.addEventListener("submit", event => {
  event.preventDefault();

  const newGoal = Number(weeklyGoalInput.value);

  if (!Number.isInteger(newGoal) || newGoal < 1 || newGoal > 100) {
    alert("Enter a weekly goal between 1 and 100.");
    return;
  }

  weeklyGoal = newGoal;

  localStorage.setItem(WEEKLY_GOAL_KEY, String(weeklyGoal));
  updateWeeklyProgress();
});

// Initialize the dashboard.
renderTasks();
