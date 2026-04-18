const exportBtn = document.getElementById("exportBtn");
const taskInput = document.getElementById("taskInput");
const dateInput = document.getElementById("dateInput");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");
const filterButtons = document.querySelectorAll(".filter-btn");
const sortButtons = document.querySelectorAll(".sort-btn");
const clearCompletedBtn = document.getElementById("clearCompletedBtn");
const totalCount = document.getElementById("totalCount");
const completedCount = document.getElementById("completedCount");
const activeCount = document.getElementById("activeCount");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

tasks = tasks.map(function (task) {
    if (typeof task === "string") {
        return {
            text: task,
            completed: false,
            dueDate: ""
        };
    }

    return {
        text: task.text || "",
        completed: task.completed || false,
        dueDate: task.dueDate || ""
    };
});

let currentFilter = "all";
let currentSort = "default";

function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(function (task) {
        return task.completed;
    }).length;
    const active = total - completed;

    totalCount.textContent = total;
    completedCount.textContent = completed;
    activeCount.textContent = active;
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

function getSortedTasks(filteredTasks) {
    const sortedTasks = [...filteredTasks];

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

function getTodayText() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return year + "-" + month + "-" + day;
}

function isOverdue(dueDate) {
    if (!dueDate) {
        return false;
    }

    return dueDate < getTodayText();
}

function renderTasks() {
    taskList.innerHTML = "";
    updateStats();

    const filteredTasks = getFilteredTasks();
    const displayTasks = getSortedTasks(filteredTasks);

    if (displayTasks.length === 0) {
        const emptyItem = document.createElement("li");
        emptyItem.textContent = "这个分类下还没有任务。";
        emptyItem.className = "empty-item";
        taskList.appendChild(emptyItem);
        return;
    }

    displayTasks.forEach(function (task) {
        const originalIndex = tasks.indexOf(task);

        const li = document.createElement("li");
        const taskContent = document.createElement("div");
        const title = document.createElement("span");
        const dateText = document.createElement("span");
        const buttonGroup = document.createElement("div");
        const completeBtn = document.createElement("button");
        const editBtn = document.createElement("button");
        const deleteBtn = document.createElement("button");

        taskContent.className = "task-content";

        title.textContent = task.text;

        if (task.completed) {
            title.classList.add("completed");
        }

        if (task.dueDate) {
            dateText.textContent = "截止日期：" + task.dueDate;
        } else {
            dateText.textContent = "截止日期：未设置";
        }

        dateText.className = "task-date";

        if (isOverdue(task.dueDate) && !task.completed) {
            dateText.classList.add("overdue");
            dateText.textContent += "（已过期）";
        }

        buttonGroup.className = "button-group";

        completeBtn.textContent = task.completed ? "取消完成" : "完成";
        completeBtn.className = "complete-btn";

        editBtn.textContent = "编辑";
        editBtn.className = "edit-btn";

        deleteBtn.textContent = "删除";
        deleteBtn.className = "delete-btn";

        completeBtn.addEventListener("click", function () {
            tasks[originalIndex].completed = !tasks[originalIndex].completed;
            saveTasks();
            renderTasks();
        });

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

            tasks[originalIndex].text = trimmedText;

            const newDate = prompt(
                "请输入新的截止日期（格式：2026-04-18，可留空）：",
                tasks[originalIndex].dueDate
            );

            if (newDate !== null) {
                tasks[originalIndex].dueDate = newDate.trim();
            }

            saveTasks();
            renderTasks();
        });

        deleteBtn.addEventListener("click", function () {
            tasks.splice(originalIndex, 1);
            saveTasks();
            renderTasks();
        });

        taskContent.appendChild(title);
        taskContent.appendChild(dateText);

        buttonGroup.appendChild(completeBtn);
        buttonGroup.appendChild(editBtn);
        buttonGroup.appendChild(deleteBtn);

        li.appendChild(taskContent);
        li.appendChild(buttonGroup);
        taskList.appendChild(li);
    });
}

function addTask() {
    const taskText = taskInput.value.trim();
    const dueDate = dateInput.value;

    if (taskText === "") {
        alert("请输入任务内容");
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
    tasks = tasks.filter(function (task) {
        return !task.completed;
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


    saveTasks();
    renderTasks();
});

updateFilterButtons();
updateSortButtons();
renderTasks();
