const STORAGE_KEY = "skillsprint-dashboard-tasks";

const form = document.getElementById("taskForm");
const nameInput = document.getElementById("taskName");
const deadlineInput = document.getElementById("taskDeadline");
const taskList = document.getElementById("taskList");

let tasks = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

document.getElementById("today").textContent =
  new Date().toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric"
  });

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function renderTasks() {
  const total = tasks.length;
  const completed = tasks.filter(task => task.completed).length;
  const pending = total - completed;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  document.getElementById("totalTasks").textContent = total;
  document.getElementById("completedTasks").textContent = completed;
  document.getElementById("pendingTasks").textContent = pending;
  document.getElementById("progressPercent").textContent = percent + "%";
  document.getElementById("progressFill").style.width = percent + "%";

  const note = total === 0
    ? "Let's complete your first task!"
    : percent === 100
      ? "Amazing! You've completed all your tasks."
      : `${completed} of ${total} tasks completed. Keep going!`;

  document.getElementById("progressNote").textContent = note;

  taskList.replaceChildren();

  if (total === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "No tasks yet. Add your first learning goal above!";
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
    toggle.setAttribute(
      "aria-label",
      (task.completed ? "Mark incomplete: " : "Complete: ") + task.name
    );

    toggle.addEventListener("click", () => {
      task.completed = !task.completed;
      saveTasks();
      renderTasks();
    });

    const remove = document.createElement("button");
    remove.className = "delete-btn";
    remove.textContent = "Delete";
    remove.setAttribute("aria-label", "Delete " + task.name);

    remove.addEventListener("click", () => {
      tasks = tasks.filter(item => item.id !== task.id);
      saveTasks();
      renderTasks();
    });

    actions.append(toggle, remove);
    item.append(info, actions);
    taskList.appendChild(item);
  });
}

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

renderTasks();