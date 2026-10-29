
const form = document.querySelector("#task-form");
const nameInput = document.querySelector("#task-name");
const dateInput = document.querySelector("#task-date");
const taskList = document.querySelector("#task-list");
const taskCount = document.querySelector("#task-count");
const emptyMessage = document.querySelector("#empty-message");

let tasks = [];

try {
  const saved = JSON.parse(
    localStorage.getItem("skillsprint-tasks") || "[]"
  );

  if (Array.isArray(saved)) {
    tasks = saved.filter(
      task =>
        task &&
        typeof task.id === "string" &&
        typeof task.name === "string" &&
        typeof task.date === "string" &&
        typeof task.done === "boolean"
    );
  }
} catch {
  tasks = [];
}

function saveTasks() {
  try {
    localStorage.setItem(
      "skillsprint-tasks",
      JSON.stringify(tasks)
    );
  } catch {
    alert("Could not save tasks in this browser.");
  }
}

function renderTasks() {
  taskList.replaceChildren();

  const completed = tasks.filter(task => task.done).length;
  taskCount.textContent =
    `${completed}/${tasks.length} completed`;

  emptyMessage.hidden = tasks.length > 0;

  for (const task of tasks) {
    const item = document.createElement("li");
    item.className = "task" + (task.done ? " done" : "");

    const info = document.createElement("div");
    info.className = "task-info";

    const title = document.createElement("span");
    title.className = "task-title";
    title.textContent = task.name;

    const deadline = document.createElement("small");
    deadline.textContent = "Deadline: " + task.date;

    info.append(title, deadline);

    const actions = document.createElement("div");
    actions.className = "task-actions";

    const toggle = document.createElement("button");
    toggle.textContent = task.done ? "Undo" : "Done";
    toggle.setAttribute(
      "aria-label",
      (task.done ? "Undo " : "Complete ") + task.name
    );

    toggle.addEventListener("click", () => {
      task.done = !task.done;
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
    taskList.append(item);
  }
}

form.addEventListener("submit", event => {
  event.preventDefault();

  const name = nameInput.value.trim();
  const date = dateInput.value;

  if (!name || !date) {
    alert("Please enter a task and deadline.");
    return;
  }

  tasks.push({
    id: crypto.randomUUID(),
    name,
    date,
    done: false
  });

  saveTasks();
  renderTasks();

  form.reset();
  nameInput.focus();
});

renderTasks();
