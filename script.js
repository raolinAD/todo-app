const taskInput = document.getElementById("taskInput");
const dateInput = document.getElementById("dateInput");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");
const filterButtons = document.querySelectorAll(".filter-btn");
const sortButtons = document.querySelectorAll(".sort-btn");
const clearCompletedBtn = document.getElementById("clearCompletedBtn");
const exportBtn = document.getElementById("exportBtn");
const totalCount = document.getElementById("totalCount");
const completedCount = document.getElementById("completedCount");
const activeCount = document.getElementById("activeCount");

let tasks = normalizeTasks(JSON.parse(localStorage.getItem("tasks")) || []);
let currentFilter = "all";
let currentSort = "default";

function normalizeTasks(rawTasks) {
    return rawTasks.map(function (task) {
        if (typeof task === "string") {
            return {
                text: task,
                completed: false,
                dueDate: ""
            };
        }

        return {
            text: (task.text || "").trim(),
            completed: Boolean(task.completed),
            dueDate: task.dueDate || ""
        };
    }).filter(function (task) {
        return task.text !== "";
    });
}

function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function getTodayText() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return year + "-" + month + "-" + day;
}

function isValidDateText(text) {
    if (text === "") {
        return true;
    }

    return /^\d{4}-\d{2}-\d{2}$/.test(text);
}

function isOverdue(dueDate) {
    if (!dueDate) {
        return false;
    }

    return dueDate < getTodayText();
}

function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(function (task) {
        return task.completed;
    }).length;

    totalCount.textContent = total;
    completedCount.textContent = completed;
    activeCount.textContent = total - completed;
}

function getFilteredTasks() {
    if (currentFilter === "active") {
        return tasks.filter(function (task) {
            return !task.completed;
        });
    }

    if (currentFilter === "completed") {
        return tasks.filter(function (task) {
            return task.completed;
        });
    }

    return tasks;
}

function getSortedTasks(taskArray) {
    const sortedTasks = taskArray.slice();

    if (currentSort === "dueDate") {
        sortedTasks.sort(function (a, b) {
            if (!a.dueDate && !b.dueDate) {
                return 0;
            }

            if (!a.dueDate) {
                return 1;
            }

            if (!b.dueDate) {
                return -1;
            }

            if (a.dueDate < b.dueDate) {
                return -1;
            }

            if (a.dueDate > b.dueDate) {
                return 1;
            }

            return 0;
        });
    }

    return sortedTasks;
}

function updateFilterButtons() {
    filterButtons.forEach(function (button) {
        if (button.dataset.filter === currentFilter) {
            button.classList.add("active");
        } else {
            button.classList.remove("active");
        }
    });
}

function updateSortButtons() {
    sortButtons.forEach(function (button) {
        if (button.dataset.sort === currentSort) {
            button.classList.add("active");
        } else {
            button.classList.remove("active");
        }
    });
}

function renderEmptyState() {
    const emptyItem = document.createElement("li");
    emptyItem.className = "empty-item";
    emptyItem.innerHTML = "<strong>这里还没有符合条件的任务</strong><span>试试添加一条新任务，或者切换筛选条件。</span>";
    taskList.appendChild(emptyItem);
}

function createTaskItem(task, originalIndex) {
    const li = document.createElement("li");
    const taskMain = document.createElement("div");
    const taskTopline = document.createElement("div");
    const title = document.createElement("p");
    const badge = document.createElement("span");
    const dateText = document.createElement("span");
    const buttonGroup = document.createElement("div");
    const completeBtn = document.createElement("button");
    const editBtn = document.createElement("button");
    const deleteBtn = document.createElement("button");

    li.className = "task-item";
    taskMain.className = "task-main";
    taskTopline.className = "task-topline";
    buttonGroup.className = "button-group";
    title.className = "task-title";

    if (task.completed) {
        li.classList.add("task-item-completed");
        title.classList.add("completed");
    }

    title.textContent = task.text;

    badge.className = "task-badge " + (task.completed ? "badge-done" : "badge-open");
    badge.textContent = task.completed ? "已完成" : "进行中";

    dateText.className = "task-date";
    dateText.textContent = task.dueDate ? "截止日期 " + task.dueDate : "未设置截止日期";

    if (isOverdue(task.dueDate) && !task.completed) {
        dateText.classList.add("overdue");
        dateText.textContent += " · 已过期";
    }

    completeBtn.className = "complete-btn";
    completeBtn.textContent = task.completed ? "取消完成" : "完成";
    completeBtn.addEventListener("click", function () {
        tasks[originalIndex].completed = !tasks[originalIndex].completed;
        saveTasks();
        renderTasks();
    });

    editBtn.className = "edit-btn";
    editBtn.textContent = "编辑";
    editBtn.addEventListener("click", function () {
        const newText = prompt("请输入新的任务内容：", tasks[originalIndex].text);

        if (newText === null) {
            return;
        }

        const trimmedText = newText.trim();

        if (trimmedText === "") {
            alert("任务内容不能为空。");
            return;
        }

        const newDate = prompt(
            "请输入新的截止日期（格式：2026-04-19，可留空）：",
            tasks[originalIndex].dueDate
        );

        if (newDate === null) {
            tasks[originalIndex].text = trimmedText;
            saveTasks();
            renderTasks();
            return;
        }

        const trimmedDate = newDate.trim();

        if (!isValidDateText(trimmedDate)) {
            alert("日期格式不正确，请使用类似 2026-04-19 的格式。");
            return;
        }

        tasks[originalIndex].text = trimmedText;
        tasks[originalIndex].dueDate = trimmedDate;
        saveTasks();
        renderTasks();
    });

    deleteBtn.className = "delete-btn";
    deleteBtn.textContent = "删除";
    deleteBtn.addEventListener("click", function () {
        tasks.splice(originalIndex, 1);
        saveTasks();
        renderTasks();
    });

    taskTopline.appendChild(title);
    taskTopline.appendChild(badge);

    taskMain.appendChild(taskTopline);
    taskMain.appendChild(dateText);

    buttonGroup.appendChild(completeBtn);
    buttonGroup.appendChild(editBtn);
    buttonGroup.appendChild(deleteBtn);

    li.appendChild(taskMain);
    li.appendChild(buttonGroup);

    return li;
}

function renderTasks() {
    taskList.innerHTML = "";
    updateStats();

    const displayTasks = getSortedTasks(getFilteredTasks());

    if (displayTasks.length === 0) {
        renderEmptyState();
        return;
    }

    displayTasks.forEach(function (task) {
        const originalIndex = tasks.indexOf(task);
        const taskItem = createTaskItem(task, originalIndex);
        taskList.appendChild(taskItem);
    });
}

function addTask() {
    const taskText = taskInput.value.trim();
    const dueDate = dateInput.value;

    if (taskText === "") {
        alert("请输入任务内容。");
        return;
    }

    tasks.push({
        text: taskText,
        completed: false,
        dueDate: dueDate
    });

    saveTasks();
    renderTasks();

    taskInput.value = "";
    dateInput.value = "";
    taskInput.focus();
}

addBtn.addEventListener("click", addTask);

taskInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        addTask();
    }
});

filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
        currentFilter = button.dataset.filter;
        updateFilterButtons();
        renderTasks();
    });
});

sortButtons.forEach(function (button) {
    button.addEventListener("click", function () {
        currentSort = button.dataset.sort;
        updateSortButtons();
        renderTasks();
    });
});

clearCompletedBtn.addEventListener("click", function () {
    const completedTasks = tasks.filter(function (task) {
        return task.completed;
    });

    if (completedTasks.length === 0) {
        alert("当前没有已完成任务可以清空。");
        return;
    }

    const confirmed = confirm("确定要清空所有已完成任务吗？");

    if (!confirmed) {
        return;
    }

    tasks = tasks.filter(function (task) {
        return !task.completed;
    });

    saveTasks();
    renderTasks();
});

exportBtn.addEventListener("click", function () {
    if (tasks.length === 0) {
        alert("当前没有任务可以导出。");
        return;
    }

    const lines = tasks.map(function (task, index) {
        const status = task.completed ? "已完成" : "未完成";
        const dueDate = task.dueDate ? task.dueDate : "未设置";
        return (index + 1) + ". [" + status + "] " + task.text + " | 截止日期：" + dueDate;
    });

    const content = "我的待办清单\n\n" + lines.join("\n");
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "tasks.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
});

updateFilterButtons();
updateSortButtons();
renderTasks();
