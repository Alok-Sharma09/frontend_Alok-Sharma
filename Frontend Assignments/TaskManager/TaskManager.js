// ----- State + Local Storage helpers -----

const STORAGE_KEY = "task_manager_tasks";

let tasks = [];
let currentFilter = "all"; // all | active | completed

function loadTasks() {
  const saved = localStorage.getItem(STORAGE_KEY);
  tasks = saved ? JSON.parse(saved) : [];
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// ----- DOM references -----

const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const taskList = document.getElementById("task-list");
const filterButtons = document.querySelectorAll(".filter-btn");
const clearCompletedBtn = document.getElementById("clear-completed");

// ----- Rendering -----

function createTaskItem(task) {
  const li = document.createElement("li");
  li.className = "task-item";
  if (task.completed) li.classList.add("completed");
  li.dataset.id = task.id;

  li.innerHTML = `
    <div class="task-left">
      <input type="checkbox" class="task-checkbox" ${task.completed ? "checked" : ""}>
      <input type="text" class="task-title" value="${task.title}" readonly />
    </div>
    <div class="task-actions">
      <button class="icon-btn edit" title="Edit">&#9998;</button>
      <button class="icon-btn delete" title="Delete">&#10005;</button>
    </div>
  `;

  return li;
}

function applyFilter(task) {
  if (currentFilter === "active") return !task.completed;
  if (currentFilter === "completed") return task.completed;
  return true; // all
}

function renderTasks() {
  taskList.innerHTML = "";
  tasks.filter(applyFilter).forEach((task) => {
    const li = createTaskItem(task);
    taskList.appendChild(li);
  });
}

// ----- CRUD operations -----

function addTask(title) {
  const trimmed = title.trim();
  if (!trimmed) return;

  const newTask = {
    id: Date.now().toString(),
    title: trimmed,
    completed: false,
  };

  tasks.push(newTask);
  saveTasks();
  renderTasks();
}

function toggleTaskCompletion(id) {
  tasks = tasks.map((task) =>
    task.id === id ? { ...task, completed: !task.completed } : task
  );
  saveTasks();
  renderTasks();
}

function updateTaskTitle(id, newTitle) {
  const trimmed = newTitle.trim();
  tasks = tasks.map((task) =>
    task.id === id ? { ...task, title: trimmed || task.title } : task
  );
  saveTasks();
  renderTasks();
}

function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);
  saveTasks();
  renderTasks();
}

function clearCompletedTasks() {
  tasks = tasks.filter((task) => !task.completed);
  saveTasks();
  renderTasks();
}

// ----- Event listeners -----

// Create (Add) task
taskForm.addEventListener("submit", (e) => {
  e.preventDefault();
  addTask(taskInput.value);
  taskInput.value = "";
});

// Event delegation for task actions
taskList.addEventListener("click", (e) => {
  const li = e.target.closest(".task-item");
  if (!li) return;
  const id = li.dataset.id;

  // Toggle completion (checkbox)
  if (e.target.classList.contains("task-checkbox")) {
    toggleTaskCompletion(id);
    return;
  }

  // Delete
  if (e.target.classList.contains("delete")) {
    deleteTask(id);
    return;
  }

  // Edit (toggle between edit/save)
  if (e.target.classList.contains("edit")) {
    const titleInput = li.querySelector(".task-title");
    const isReadonly = titleInput.hasAttribute("readonly");

    if (isReadonly) {
      titleInput.removeAttribute("readonly");
      titleInput.focus();
      titleInput.selectionStart = titleInput.value.length;
      e.target.innerHTML = "&#10003;"; // check icon
    } else {
      titleInput.setAttribute("readonly", true);
      updateTaskTitle(id, titleInput.value);
      e.target.innerHTML = "&#9998;"; // pencil icon
    }
  }
});

// Save on Enter when editing (event delegation using keydown)
taskList.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && e.target.classList.contains("task-title")) {
    e.preventDefault();
    const li = e.target.closest(".task-item");
    if (!li) return;
    const id = li.dataset.id;
    e.target.setAttribute("readonly", true);
    updateTaskTitle(id, e.target.value);
    const editBtn = li.querySelector(".edit");
    if (editBtn) editBtn.innerHTML = "&#9998;";
  }
});

// Filter buttons
filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.dataset.filter;
    renderTasks();
  });
});

// Clear completed
clearCompletedBtn.addEventListener("click", () => {
  clearCompletedTasks();
});

// ----- Initialize -----

loadTasks();
renderTasks();
