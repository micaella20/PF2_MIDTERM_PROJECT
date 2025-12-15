const inputBox = document.getElementById("input-box"); 
const listContainer = document.getElementById("list-container");
const totalCount = document.getElementById("totalCount"); 
const completedCount = document.getElementById("completedCount"); 
const toggle = document.getElementById("toggle"); 

let tasks = []; 
let originalTasksOrder = [];

// --- Utility Functions ---

function updateDOM() {
  listContainer.innerHTML = ""; 
  tasks.forEach((task, index) => { 
    const li = document.createElement("li"); 
    const checkbox = document.createElement("input");
    const taskTextWrapper = document.createElement("span"); 
    const span = document.createElement("span"); 

    // 3. Select/Deselect Tasks
    checkbox.type = "checkbox";
    checkbox.classList.add("delete-checkbox"); 
    li.appendChild(checkbox);

    taskTextWrapper.classList.add("task-text"); 
    taskTextWrapper.innerHTML = task.text; 
    li.appendChild(taskTextWrapper); 

    // 5. Mark as Complete
    if (task.checked) {
      li.classList.add("checked"); 
      checkbox.checked = true; 
    }

    li.setAttribute("draggable", true); 
    li.dataset.index = index; 

    span.innerHTML = "\u00d7";
    li.appendChild(span); 

    li.addEventListener("dragstart", dragStart); 
    li.addEventListener("dragover", dragOver);
    li.addEventListener("drop", drop); 

    // 6. Edit a Task
    taskTextWrapper.addEventListener("keydown", (event) => {
      if (event.key === "Enter") { 
        taskTextWrapper.contentEditable = false;
        saveData(); 
      }
    });

    li.ondblclick = () => { 
      taskTextWrapper.contentEditable = true; 
      taskTextWrapper.focus();
      const range = document.createRange(); 
      range.selectNodeContents(taskTextWrapper); 
      range.collapse(false); 
      const selection = window.getSelection(); 
      selection.removeAllRanges();
      selection.addRange(range);
    };

    taskTextWrapper.addEventListener("blur", () => { 
      const index = parseInt(li.dataset.index); 
      taskTextWrapper.contentEditable = false;
      const editedText = taskTextWrapper.textContent.trim(); 
      if (editedText === "") { 
        alert("Task cannot be empty."); 
        taskTextWrapper.textContent = tasks[index].text;
        return;
      }

      const lowerEditedText = editedText.toLowerCase(); 
      for (let i = 0; i < tasks.length; i++) { 
        if (i !== index && tasks[i].text.toLowerCase() === lowerEditedText) { 
          alert("Task already exists!");
          taskTextWrapper.textContent = tasks[index].text; 
          return;
        }
      }

      tasks[index].text = editedText; 
      saveData();
    });

    // 13. Highlight Selected Items
    checkbox.addEventListener("change", () => { 
      li.classList.toggle("selected-task", checkbox.checked); 
    });

    listContainer.appendChild(li); 
  });
  updateCounters(); 
}

function updateCounters() {
  totalCount.textContent = tasks.length; // 7. Total Task Counter
  completedCount.textContent = tasks.filter((task) => task.checked).length; // 8. Completed Task Counter
}

// 9. Local Storage
function saveData() {
  localStorage.setItem("data", JSON.stringify(tasks)); 
}

function showTask() {
  const storedTasks = localStorage.getItem("data"); 
  if (storedTasks) {
    tasks = JSON.parse(storedTasks); 
    originalTasksOrder = [...tasks]; 
    updateDOM(); 
  }
}

// --- Task Management ---

// 1. Add a Task
function addTask() {
  const taskText = inputBox.value.trim().toLowerCase(); 
  if (taskText === "") { 
    alert("You must write something"); 
    return;
  }

  const tasksElements = document.querySelectorAll("#list-container li");
  for (const task of tasksElements) { 
    const existingTaskText = task.querySelector(".task-text").textContent.trim().toLowerCase(); 
    if (existingTaskText === taskText) { 
      alert("Task already exists!");
      inputBox.value = ""; 
      return;
    }
  }

  tasks.push({ text: inputBox.value, checked: false, isEditing: false }); 
  originalTasksOrder = [...tasks]; 
  inputBox.value = ""; 
  updateDOM(); 
  saveData();
}

listContainer.addEventListener("click", (e) => {
  if (e.target.tagName === "LI") { 
    const index = Array.from(listContainer.children).indexOf(e.target); 
    if (index === -1) return; 
    tasks[index].checked = !tasks[index].checked; 
    e.target.classList.toggle("checked"); 
    updateCounters();
    saveData(); 
  }
 
  // 2. Remove a Task
  if (e.target.tagName === "SPAN" && e.target.innerHTML === "\u00d7") { 
    const li = e.target.closest("li"); 
    if (!li) {
       return; 
    }

    const taskTextWrapper = li.querySelector(".task-text");

    if (taskTextWrapper.contentEditable === "true") { 
      alert("Cannot delete while editing a task. Finish editing first.");
      return;
    }

    const index = parseInt(li.dataset.index);
    const taskName = tasks[index]?.text; 
    const result = confirm(`Do you want to remove a task "${taskName}"?`); 
    if (result) { 
      tasks.splice(index, 1); 
      originalTasksOrder = [...tasks]; 
      li.remove(); 
      updateCounters(); 
      saveData(); 
    } else { 
      alert("Removing Cancelled.");
    }
  }
});

    // --- Drag and Drop ---
    // 10. Drag and Drop
    function dragStart(event) {
      event.dataTransfer.setData("text/plain", event.target.innerHTML); 
      event.target.classList.add("dragging"); 
    }
    
    function dragOver(event) {
      event.preventDefault(); 
    }
    
    function drop(event) {
      event.preventDefault();
      const draggedElement = document.querySelector(".dragging"); 
      const dropTarget = event.target.closest("li"); 
    
      if (draggedElement && dropTarget && draggedElement !== dropTarget) { 
        const draggedIndex = Array.from(listContainer.children).indexOf(draggedElement);
        const dropIndex = Array.from(listContainer.children).indexOf(dropTarget); 
    
        if (draggedIndex < dropIndex) { 
          listContainer.insertBefore(draggedElement, dropTarget.nextSibling); 
        } else { 
          listContainer.insertBefore(draggedElement, dropTarget);
        }
    
        const temp = tasks[draggedIndex]; 
        tasks.splice(draggedIndex, 1); 
        tasks.splice(dropIndex, 0, temp);
        saveData(); 
      }
      if (draggedElement) { 
        draggedElement.classList.remove("dragging");
      }
    }
    
    // --- Event Listeners ---
    
    // 12. Theme Switching
    toggle.addEventListener("click", () => {
      document.body.classList.toggle("dark-theme"); 
    });
    
    inputBox.addEventListener("keydown", (e) => { 
      if (e.key === "Enter") { 
        addTask();
      }
    });
    
    
    // 4. Remove Multiple Task
    document.addEventListener("keydown", (e) => { 
      if (e.key === "Delete") { 
        const isEditing = Array.from(document.querySelectorAll(".task-text")).some(
          (taskText) => taskText.contentEditable === "true"
        ); 
    
        if (isEditing){ 
          alert("Cannot delete while editing a task."); 
          return;
        }
    
        const selectedItems = document.querySelectorAll("li input[type='checkbox']:checked");
        if (selectedItems.length > 0) {
          const taskNames = Array.from(selectedItems).map(item => item.parentElement.querySelector('.task-text').textContent).join(', ');
          const result = confirm(`Do you want to remove the selected tasks: "${taskNames}"?`); 
          if (result) { 
            selectedItems.forEach((item) => { 
              const li = item.parentElement; 
              const index = Array.from(listContainer.children).indexOf(li);
              tasks.splice(index, 1); 
              li.remove();
              saveData(); 
            });
            originalTasksOrder = [...tasks]; 
            updateDOM();
          } else { 
            alert("Deletion cancelled."); 
          }
        } else {
          alert("No tasks selected for deletion.");
        }
      }
    });

    // --- Sorting Functions ---

    function sortAscending() {
        tasks.sort((a, b) => a.text.localeCompare(b.text));
        updateDOM();
    }

    function sortDescending(){
        tasks.sort((a, b) => b.text.localeCompare(a.text));
        updateDOM();
    }

    function resetOrder() {
        tasks = [...originalTasksOrder];
        updateDOM();
    }

    
    // --- Initialization ---
    
    showTask(); 