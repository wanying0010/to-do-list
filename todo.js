function ToDo() {
    this.tasks = [];
    this.index = 0;
}

ToDo.prototype.saveTask = function (name, timeDue, description) {
    this.newTask(name, timeDue, description);
    this.saveTasksToLocalStorage();
    console.log("Item saved: " + name + " / " + moment(timeDue).format("YYYY-MM-DD HH:mm:ss"))
}

ToDo.prototype.updateTask = function (id, name, timeDue, description) {
    let task = this.getTaskById(id);
    task.name = name;
    task.timeDue = timeDue;
    task.description = description;
    this.saveTasksToLocalStorage();
    console.log("Item updated: " + name + " / " + moment(timeDue).format("YYYY-MM-DD HH:mm:ss"))
}

ToDo.prototype.newTask = function (name, timeDue, description) {
    var item = new ToDoTask(this.getNewId(), name, timeDue, description);
    this.tasks.push(item);
}

ToDo.prototype.getTaskById = function (id) {
    this.tasks.forEach(function (e) {
        if (e.id == id) {
            ret = e;
        }
    });
    return ret;
}


ToDo.prototype.getNewId = function () {
    return this.index++;
}

ToDo.prototype.saveTasksToLocalStorage = function () {
    localStorage.setItem('tasks', JSON.stringify({
        tasks: this.tasks,
        index: this.index
    }));
}

ToDo.prototype.loadTasksFromLocalStorage = function (callback) {
    let local = JSON.parse(localStorage.getItem('tasks'));
    console.log(local);
    if (local) {
        this.tasks = this.loadItemFromJSONObj(local.tasks);
        this.index = local.index;
        callback();
    }
}

ToDo.prototype.loadItemFromJSONObj = function (items) {
    var ret = [];
    items.forEach(function (e) {
        ret.push(new ToDoTask(e.id, e.name, moment(e.timeDue).toDate(), e.description, e.done));
    });
    return ret;
}

ToDo.prototype.getTodayTasks = function () {
    var ret = [];
    this.tasks.forEach(function (e) {
        if (moment(e.timeDue).format("YYYY-MM-DD")==moment().format("YYYY-MM-DD"))
            ret.push(e);
    });
    console.log(ret);
    ret = this.sort(ret);
    return ret;
}

ToDo.prototype.sort = function(todo) {
    todo = todo.sort(function(a, b) {
        if(a.done < b.done) {
            return -1;
        }
        else if(a.done > b.done) {
            return 1;
        }
        else {
            if(moment(a.timeDue).isBefore(moment(b.timeDue)))
            return -1;
        else if(moment(a.timeDue).isAfter(moment(b.timeDue)))
            return 1;
        else
            return 0;
        }
    });
            
    return todo;
}

ToDo.prototype.getTomorrowTasks = function () {
    var ret = [];
    this.tasks.forEach(function (e) {
        timeDue = moment(e.timeDue);
        if (timeDue.format("YYYY-M-D") === moment().add(1, "days").format("YYYY-M-D"))
            ret.push(e);
    });
    ret = this.sort(ret);
    return ret;
}

ToDo.prototype.getFutureTasks = function () {
    var ret = [];
    this.tasks.forEach(function (e) {
        timeDue = moment(e.timeDue);
        if (timeDue.isAfter(moment(moment().add(1, "days").format("YYYY-MM-DD"))))
            ret.push(e);
    });
    ret = this.sort(ret);
    return ret;
}

ToDo.prototype.getPastTasks = function () {
    var ret = [];
    this.tasks.forEach(function (e) {
        timeDue = moment(e.timeDue);
        if (timeDue.isBefore(moment()))
            ret.push(e);
    });
    ret = this.sort(ret);
    return ret;
}

ToDo.prototype.deleteTaskById = function(id) {
    let task = this.getTaskById(id);
    this.tasks.splice(this.tasks.indexOf(task),1);
    this.saveTasksToLocalStorage();
    console.log(this.tasks);
}

function ToDoTask(id, name, timeDue, description, done=0) {
    this.id = id;
    this.name = name;
    this.timeDue = timeDue;
    this.done = done;
    this.description = description;
}

function ToDoHtml(todo) {
    this.todo = todo;
    var parent = this;
    $("#showaddpagebtn").bind("click", function () {
        parent.showAddTaskPage();
    })

    $("#addTaskBtn").bind("click", function () {
        let name = $("#taskName").val();
        let timeDue = $("#timedue").datetimepicker("date").toDate();
        let description = $("#description").val();
        parent.todo.saveTask(name, timeDue, description);
        parent.refresh();
        parent.showTaskListPage();
    })

    $("#cancelAddTaskBtn").bind("click", function () {
        console.log("Showing task list page");
        parent.showTaskListPage();
        parent.clearFields();
    })

    $("#edit-task-btn").bind("click", function () {
        let id = $("#edit-task-id-input").val();
        let name = $("#edit-task-name-input").val();
        let timeDue = $("#timedue-edit-task").datetimepicker("date").toDate();
        let description = $("#edit-task-desc-input").val();
        parent.todo.updateTask(id, name, timeDue, description);
        parent.refresh();
        parent.showTaskListPage();
    })

    $("#cancel-edit-task-btn").bind("click", function () {
        console.log("Showing task list page");
        parent.showTaskListPage();
        parent.clearFields();
    })

    $("#delete-task-btn").bind("click", function () {
        let id = $("#edit-task-id-input").val();
        parent.todo.deleteTaskById(id);
        parent.clearFields();
        parent.refresh();
        parent.showTaskListPage();
    })
}

ToDoHtml.prototype.refresh = function () {
    var parent = this;
    $("#today > div").first().html(this.displayTask(this.todo.getTodayTasks()).join(""));
    $("#tomorrow > div").first().html(this.displayTask(this.todo.getTomorrowTasks()).join(""));
    $("#future > div").first().html(this.displayTask(this.todo.getFutureTasks()).join(""));
    $("#past > div").first().html(this.displayTask(this.todo.getPastTasks()).join(""));

    $(".edit-task").bind("click", function () {
        id = $(this).data("id");
        parent.showEditTaskPage(id);
    })

    $(".task-status").change(function() {
        id = $(this).data("id");
        let task = parent.todo.getTaskById(id);
        if($(this).is(':checked')) {
            task.done = 1;
            $(this).parent().addClass("done");
        }
        else {
            task.done = 0;
            $(this).parent().removeClass("done");
        }

        parent.todo.saveTasksToLocalStorage();
        parent.refresh();
    })
}

ToDoHtml.prototype.showTaskListPage = function () {
    $("#tasklistpage").show();
    $("#addpage").hide();
    $("#edittaskpage").hide();
}

ToDoHtml.prototype.showAddTaskPage = function () {
    $("#tasklistpage").hide();
    $("#edittaskpage").hide();
    $("#addpage").show();
}

ToDoHtml.prototype.showEditTaskPage = function (id) {
    $("#tasklistpage").hide();
    $("#edittaskpage").show();
    $("#addpage").hide();
    let task = this.todo.getTaskById(id);
    console.log(task);
    $("#edit-task-id-input").val(task.id);
    $("#edit-task-name-input").val(task.name);
    $("#edit-task-desc-input").val(task.description);
    $("#timedue-edit-task").datetimepicker('date', task.timeDue);
}

ToDoHtml.prototype.clearFields = function () {
    $("#taskName").val("");
    $('#timedue').datetimepicker('date', new Date());
}

ToDoHtml.prototype.displayTask = function (todayTasks) {
    let html = [];
    todayTasks.forEach(function (e) {
        let checked = e.done=="1" ? "checked=checked" : "";
        let taskClass = e.done=="1" ? "done" : "";
        html.push('<div class="form-check task-div '+taskClass+'">\
        <input class="task-status" type="checkbox" value="1" '+checked+' data-id="' + e.id + '">\
        <label class="form-check-label" for="defaultCheck1">\
            <a href="#edit-' + e.id + '" class="edit-task" data-id="' + e.id + '" title="'+e.description+'">\
                ' + moment(e.timeDue).format("MM/DD HH:mm")+ ' ' + e.name + '\
            </a>\
        </label>\
    </div>');
    });
    return html;
}

var html = new ToDoHtml(new ToDo());

$(document).ready(function () {
    html.showTaskListPage();
    html.todo.loadTasksFromLocalStorage(function () {
        html.refresh();
    });

});