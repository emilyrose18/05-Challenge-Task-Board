// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
const taskFormEl = $("#taskForm");

// Todo: create a function to generate a unique task id
function generateTaskId() {
  return new Date().getTime();
}

// Todo: create a function to create a task card
function createTaskCard(task) {
  // Create a <div> element for the task card, assign classes and task ID
  const taskCard = $("<div>")
    .addClass("card task-card draggable my-3") // Classes for styling and draggable functionality
    .attr("data-taskid", task.id); // Custom data attribute to store task ID
  const cardHeader = $("<div>").addClass("card-header h4").text(task.name);
  const cardBody = $("<div>").addClass("card-body");
  const cardDueDate = $("<p>").addClass("card-text").text(task.date);
  const cardDescription = $("<p>").addClass("card-descr").text(task.description);

  // Create a <button> element for the delete button, assign classes, text content, and task ID data attribute
  const cardDeleteBtn = $("<button>")
    .addClass("btn btn-danger delete") 
    .text("Delete") 
    .attr("data-taskid", task.id); 

  cardDeleteBtn.on("click", handleDeleteTask);

  // Check if task is overdue or due today and apply appropriate styling
  const now = dayjs();
  if (now.isSame(task.date, "day") && task.status !== 'done') {
    taskCard.addClass("bg-warning text-white"); // Yellow background for today's tasks
  } else if (now.isAfter(task.date) && task.status !== 'done') {
    taskCard.addClass("bg-danger text-white"); // Red background for overdue tasks
    cardDeleteBtn.addClass("border-light"); // Light border for delete button on overdue tasks
  }

  // Append due date, description, and delete button to the card body
  cardBody.append(cardDueDate, cardDescription, cardDeleteBtn);

  // Append card header and body to the task card
  taskCard.append(cardHeader, cardBody);

  return taskCard;
}

// Todo: create a function to render the task list and make cards draggable
function renderTaskList() {
  const todoList = $("#todo-cards");
  const inProgressList = $("#in-progress-cards");
  const doneList = $("#done-cards");

  todoList.empty();
  inProgressList.empty();
  doneList.empty();

  for (let task of taskList) {
    if (task.status === "todo") {
      todoList.append(createTaskCard(task));
    } else if (task.status === "in-progress") {
      inProgressList.append(createTaskCard(task));
    } else if (task.status === "done") {
      doneList.append(createTaskCard(task));
    }
  }
  $(".draggable").draggable({
    opacity: 0.7,
    zIndex: 100,
    // This function creates the clone of the card that is dragged. This is purely visual and does not affect the data.
    helper: function (e) {
      // ? Check if the target of the drag event is the card itself or a child element. If it is the card itself, clone it, otherwise find the parent card  that is draggable and clone that.
      const original = $(e.target).hasClass("ui-draggable")
        ? $(e.target)
        : $(e.target).closest(".ui-draggable");
      // ? Return the clone with the width set to the width of the original card.  
      return original.clone().css({
        width: original.outerWidth(),
      });
    },
  });
}

// Todo: create a function to handle adding a new task
function handleAddTask(event) {
  event.preventDefault();

  const newTask = {
    name: $("#taskName").val(),
    date: $("#taskduedate").val(),
    status: "todo",
    description: $("#taskDescription").val(),
    id: generateTaskId(),
  };

  taskList.push(newTask);
  localStorage.setItem("tasks", JSON.stringify(taskList));

  // Clear input fields after adding task
  $('#taskName, #taskduedate, #taskDescription').val('');

  renderTaskList();

  $('#taskModal').modal('hide');
}

// Todo: Create a function to handle deleting a task 
function handleDeleteTask(event) {
  event.preventDefault();

  const taskId = $(this).data('taskid');

  // Filter the taskList to remove the task with the matching ID
  taskList = taskList.filter(task => task.id !== taskId);

  // Update local storage with the modified task list
  localStorage.setItem("tasks", JSON.stringify(taskList));

  renderTaskList();
}

// Todo: Create a function to handle dropping a task into a new status lane 
function handleDrop(event, ui) {
  const taskId = ui.draggable.data('taskid');

  const newStatus = event.target.id.slice(0, -6);

  // Loop through the task list and update the status of the matching task
  taskList.forEach(task => {
    if (task.id === taskId) {
      task.status = newStatus;
    }
  });

  // Update local storage with the modified task list
  localStorage.setItem('tasks', JSON.stringify(taskList));

  renderTaskList();
}

// Code to be executed when the page loads 
$(document).ready(function () {
  taskFormEl.on("submit", handleAddTask);

  $("#taskduedate").datepicker();

  // Make the lanes droppable for task movement
  $('.lane').droppable({
    accept: '.draggable', // Only accept draggable elements
    drop: handleDrop,     // Call handleDrop function on drop event
  });

  renderTaskList();
});