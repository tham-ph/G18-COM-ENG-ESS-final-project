// Import the functions you need from the SDKs you need
import {initializeApp} from "https://www.gstatic.com/firebasejs/9.6.11/firebase-app.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDMAxyWCxAI-XfH_KbrOoLv5P_mvFimQSg",
  authDomain: "g18-essen-final.firebaseapp.com",
  projectId: "g18-essen-final",
  storageBucket: "g18-essen-final.appspot.com",
  messagingSenderId: "798773782854",
  appId: "1:798773782854:web:23ca69b16910048fa9dd47"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  updateDoc,
  serverTimestamp,
  query,
  orderBy,
  where,
} from 'https://www.gstatic.com/firebasejs/9.6.11/firebase-firestore.js';

const db = getFirestore();
const usersRef = collection(db, "users");
const projectsRef = collection(db, 'projects');
const tasksRef = collection(db, "tasks");

const content_wrapper = document.getElementById('content-wrapper');
const second_wrapper = document.getElementById('second-wrapper');

const addUserPopup = document.querySelector(".add-user.popup");

const addProjectPopup = document.querySelector(".add-project.popup");
const editProjectPopup = document.querySelector(".edit-project.popup");

const addUserButton = addUserPopup.querySelector(".success-button");

const addTaskPopup = document.querySelector(".add-task.popup");
const editTaskPopup = document.querySelector(".edit-task.popup");

let projectId = null;
let userId = "";

async function showProjectGrid() {
  document.querySelectorAll('.containner')[0].style.display = '';
  if (content_wrapper.classList.contains('grid-task')) {
    content_wrapper.className = 'grid-main';
    clearTaskItem();
    document.querySelectorAll('.proj-status')[0].style.display = "none";
    document.querySelectorAll('.add-button')[0].style.display = "none";
    document.querySelectorAll('#add-project-wrapper')[0].style.display = "initial";
    
    second_wrapper.style.display = "grid";
    toggleProjectLabel(true);
  } else {
    clearProjectItem();
  }

  const collection = await getDocs(query(projectsRef, orderBy("createdTime")));
  const projects = collection.docs.map(proj => {
    return {...proj.data(), id: proj.id}
  })

  projects.map((proj) => {
    addProjectToHTML(proj.name, proj.description, proj.taskList, proj.owner, proj.id);
  })

  // countTotal();
}

async function showTaskGrid() {
  if (content_wrapper.classList.contains('grid-main')) {
    content_wrapper.className = 'grid-task';
    clearProjectItem()
    document.querySelectorAll('.proj-status')[0].style.display = "initial";
    document.querySelectorAll('.add-button')[0].style.display = "initial";
    document.querySelectorAll('#add-project-wrapper')[0].style.display = "none";
    document.querySelectorAll('#second-wrapper')[0].style.display = "none";
    toggleProjectLabel(false);
  } else {
    clearTaskItem()
  }

  const projRef = doc(db, `projects/${projectId}`);
  const proj = await getDoc(projRef);
  const tasks = proj.data().taskList;

  tasks.map(async (task) => {
    const taskRef = doc(db, `tasks/${task}`);
    const taskDoc = await getDoc(taskRef);
    if (taskDoc.exists()) {
      const t = taskDoc.data();
      addTaskToHTML(t.name, t.description, t.status, taskDoc.id);
    }
  });
  document.getElementById("proj-name-task").innerText = proj.data().name;
  document.getElementById("proj-desc-task").innerText = "Description : " + proj.data().description;
  const proj_task_status_txt = document.getElementsByClassName("proj-task-status-txt")[0];
  const proj_task_status_bar = document.getElementsByClassName("proj-task-status-bar")[0];
  proj_task_status_txt.id = projectId + "-t-status-text";
  proj_task_status_bar.id = projectId + "-t-progress";
  proj_task_status_txt.innerText = "Status : 0%"
  proj_task_status_bar.style.width = "0px";

  // console.log("taskgirdshow" + projectId);
}

async function updateProjectPercent(projectId) {
  const project = await getDoc(doc(db, "projects", projectId));
  const taskList = project.data().taskList;
  const all_task = taskList.length;
  if (all_task == 0) {
    return 0
  }
  var done_task = 0;
  const promises = await taskList.map(async (task) => {
    const taskRef = doc(db, `tasks/${task}`);
    const taskDoc = await getDoc(taskRef);
    if (taskDoc.exists() && taskDoc.data().status == "done") {
      done_task += 1;
    }
  })
  await Promise.all(promises);
  const bar1 = document.getElementById(projectId+"-progress");
  const txt1 = document.getElementById(projectId+"-status-text");
  const bar2 = document.getElementById(projectId+"-t" + "-progress");
  const txt2 = document.getElementById(projectId+"-t" + "-status-text");
  const donePercent = parseInt(100 * done_task / all_task);
  if (bar1) {
    bar1.style.width = donePercent + "%";
  }
  if (txt1) {
    txt1.innerText = "Status : " + done_task + "/" + all_task + ' (' + donePercent + '%)';
  }
  if (bar2) {
    bar2.style.width = donePercent + "%";
  }
  if (txt2) {
    txt2.innerText = "Status : " + done_task + "/" + all_task + ' (' + donePercent + '%)';
  }
}


function initialShow() {
  const content_wrapper = document.getElementById('content-wrapper');
  content_wrapper.className = 'grid-main';
  clearTaskItem()
  clearProjectItem()
  document.querySelectorAll('.proj-status')[0].style.display = "none";
  document.querySelectorAll('.add-button')[0].style.display = "none";
  document.querySelectorAll('.containner')[0].style.display = "none";
  document.querySelectorAll('#add-project-wrapper')[0].style.display = "initial";
  homeBtnEvent();
  userBtnEvent();
  showUserView();
}


function clearTaskItem() {
  const task_items = document.querySelectorAll('.grid-task-item');
  task_items.forEach(task => {
    task.remove();
  });
}

function clearProjectItem() {
  const project_items = document.querySelectorAll('.grid-proj-item');
  project_items.forEach(proj => {
    if (proj.id != 'add-project-wrapper') {
      proj.remove();
    }
  });
}

function homeBtnEvent() {
  const homeBtns = document.getElementsByClassName('home-btn')[0];
  homeBtns.addEventListener('click', (e) => {
    e.stopPropagation();
    document.addEventListener('click', showProjectGrid());
  });
}

function userBtnEvent() {
  const userBtns = document.getElementsByClassName('user-btn')[0];
  userBtns.addEventListener('click', (e) => {
    e.stopPropagation();
    document.addEventListener('click', showUserView());
  });
}

function showUserView(){
  addUserPopup.style.display = "flex";
}

function toggleProjectLabel(isShow) {
  const proj_labels = document.getElementsByClassName("label-proj");
  if (isShow) {
    proj_labels[0].style.display = "block";
    proj_labels[1].style.display = "block";
    return;
  }
  proj_labels[0].style.display = "none";
  proj_labels[1].style.display = "none";
}

initialShow();

// showProjectGrid();

manageAddProject();

manageAddTask();


// showTaskGrid("UqYEPEXE5NQymjFwAeiX");


//===================================================


addUserButton.addEventListener("click", () => {
  const name = addUserPopup.querySelector("input.name").value;
  if (name.trim().length == 0){
    generalPopup("username can not be empty!", null, false);
    return 
  }
  addUserToFirebase(name);
  addUserToHTML(name);
  showProjectGrid();
  addUserPopup.style.display = "none";
  
});

function generalPopup(textDisplay, callBack, opt){

  const generalPop = document.querySelector('.general.popup');
  generalPop.style.display = "flex";
  generalPop.querySelector('p').innerText = textDisplay;

  let _listenner = function() {
    if(callBack){
      callBack();
      }
    generalPop.style.display = "none";
  }

  generalPop.querySelector('.success-button').addEventListener("click", _listenner);

  if(!opt){
    generalPop.querySelector('.secondary-button').style.display = 'none';
    return;
  }
  generalPop.querySelector('.secondary-button').style.display = 'initial';

  generalPop.querySelector('.secondary-button').addEventListener("click", () => {
    generalPop.style.display = "none";
    if(callBack){
      generalPop.querySelector('.success-button').removeEventListener("click",_listenner);
    }
  });
}

function manageAddProject() {
  let checker = true;
  // open add project popup
  const addProjectButton = document.querySelector("#add-proj-click");
  addProjectButton.addEventListener("click", () => {
    addProjectPopup.style.display = "flex";
    addProjectPopup.querySelector("input.name").value = "";
    addProjectPopup.querySelector("textarea.description").value = "";
  });

//confirm adding new project
  const confirmAddProjectButton = addProjectPopup.querySelector(".success-button");
  confirmAddProjectButton.addEventListener("click", async () => {
    const name = addProjectPopup.querySelector("input.name").value;
    
    if (name.trim().length == 0){
      checker = false;
      generalPopup("Project name can not be empty!", null, false);
      return ;
    }else{
      checker = true;
    }
    const description = addProjectPopup.querySelector("textarea.description").value;
    const taskList = [];
    const id = await addProjectToFirebase(name, description, taskList);
    addProjectToHTML(name, description,taskList, userId, id);
  });

//close add project popup
  addProjectPopup.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      if(!checker && button.className == 'success-button'){return}
      addProjectPopup.style.display = "none";
    })
  });

}
function manageEditProject(project, name, description, taskList, owner, id) {
  let checker = false;
  let isEditProjectButtonClicked = false;
  let isDeleteProjectButtonClicked = false;

  //open edit project popup
  const editProjectButton = project.querySelector(".edit-project-btn");
  editProjectButton.addEventListener("click", () => {
    editProjectPopup.style.display = "flex";
    editProjectPopup.querySelector("input.name").value = name;
    editProjectPopup.querySelector("textarea.description").value = description;
    editProjectPopup.id = id;
    isEditProjectButtonClicked = true;
  });

  //confirm editing project
  const confirmEditProjectButton = editProjectPopup.querySelector(".success-button");
  confirmEditProjectButton.addEventListener("click", () => {
    const editedName = editProjectPopup.querySelector("input.name").value;
    if (editedName.trim().length == 0){
      generalPopup("Project name can not be empty!", null, false);
      checker = false;
      return; 
    }else{
      checker = true
    }
    const editedDescription = editProjectPopup.querySelector("textarea.description").value;
    const currentId = editProjectPopup.id;
    editProjectInHTML(editedName, editedDescription, taskList, currentId);
    editProjectInFirebase(editedName, editedDescription, taskList, currentId);
  });

  //close edit project popup
  const buttons = editProjectPopup.querySelectorAll("button");
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      if(!checker && button.className == 'success-button'){return}
      editProjectPopup.style.display = "none";
      isEditProjectButtonClicked = false;
    })
  });

  //delete project
  const deleteProjectButton = project.querySelector(".delete-project-btn");
  deleteProjectButton.addEventListener("click", () => {
    
    generalPopup("Are you sure to delete this Project?", 
    () =>{
      deleteProjectInFirebase(id);
      deleteProjectInHTML(id);
    }, true);
    isDeleteProjectButtonClicked = true;
  });

  project.querySelector(".btn-to-project").addEventListener("click", (e) => {
    if (!isEditProjectButtonClicked && !isDeleteProjectButtonClicked) {
      e.stopPropagation();
      projectId = id;
      showTaskGrid();
    }
  });
}

async function addUserToFirebase(name) {
  const checkExistence = await getDocs(query(usersRef, where("name", "==", name)));
  if (checkExistence.size > 0) {
    console.log(checkExistence);
    console.log(checkExistence.docs[0].id);
    userId = checkExistence.docs[0].id;
    return;
  }
  const newUser = await addDoc(usersRef, {
    name,
    createdTime: serverTimestamp(),
  });
  userId = newUser.id;
}

function addUserToHTML(name) {
  document.querySelector(".user-btn").innerText = name;
}

async function addProjectToFirebase(name, description, taskList) {
  const newProject = await addDoc(projectsRef, {
    name,
    description,
    owner: userId,
    taskList,
    createdTime: serverTimestamp(),
  });
  return newProject.id;
}


function addProjectToHTML(name, description, taskList, owner, id) {
  let proj_item = document.createElement('div');
  proj_item.className = 'grid-proj-item';
  proj_item.innerHTML = `
    <div class="project-box drop-shadow" id="${id}">
      <div class="btn-to-project">
        <h3 class="name" style="overflow-wrap: break-word;">${name}</h3>
        <div class="proj-des-box">
        <p class="description">Description : ${description}</p>
        </div>
        <p id="${id}-status-text">Status: 0%</p>
        <div class="progress">
          <div class="progress-done" style="width:0%" id="${id}-progress"></div>
        </div>
        <br>
        <div class="proj-edit-wrapper">
          <button class="edit-project-btn">
            edit
          </button>
          <button class="delete-project-btn">
            delete
          </button>
        </div>
      </div>
    </div>`;
  
  if (owner === userId) {
    content_wrapper.insertBefore(proj_item, content_wrapper.children[0]);
  } else {
    const proj_edit_wrapper = proj_item.querySelector(".proj-edit-wrapper");
    proj_edit_wrapper.style = "grid-template-columns: 1fr; text-align:center;";
    getDoc(doc(db, `users/${owner}`)).then( (user) => {
      if(user.exists()){
        proj_edit_wrapper.innerHTML = "Creator : " + user.data().name;
        return;
      }
      proj_edit_wrapper.innerHTML = "system created"
    });
    second_wrapper.insertBefore(proj_item, second_wrapper.children[0]);
  }
  projectId = id;
  updateProjectPercent(projectId);

  manageEditProject(proj_item, name, description, taskList, owner, id);

}

async function editProjectInFirebase(name, description, taskList, id) {
  const updatedDoc = await updateDoc(doc(db, "projects", id), {
    name,
    description,
    taskList
  });
}
function editProjectInHTML(name, descripton, taskList, id) {
  const project = document.getElementById(id);
  project.querySelector(".name").innerHTML = name;
  project.querySelector(".description").innerHTML = descripton;
}

async function deleteProjectInFirebase(id) {
  await deleteDoc(doc(db, "projects", id));
}
function deleteProjectInHTML(id) {
  const project = document.getElementById(id);
  if(!project){return;}
  content_wrapper.removeChild(project.parentElement);
}

//===============================================================



function manageAddTask() {
  let checker = true;
// open add task popup
  const addTaskButton = document.querySelector(".add-task-btn");
  addTaskButton.addEventListener("click", () => {
    addTaskPopup.style.display = "flex";
    addTaskPopup.querySelector("input.name").value = "";
    addTaskPopup.querySelector("textarea.description").value = "";
  });

//confirm adding new task
  const confirmAddTaskButton = addTaskPopup.querySelector(".success-button");
  confirmAddTaskButton.addEventListener("click", async () => {
    const name = addTaskPopup.querySelector("input.name").value;
    if (name.trim().length == 0){
      checker = false;
      generalPopup("Task name can not be empty!", null, false);
      return ;
    }else{
      checker = true;
    }
    const description = addTaskPopup.querySelector("textarea.description").value;
    const status = "todo";
    const taskId = await addTaskToFirebase(name, description, status);
    await addTaskToHTML(name, description, status, taskId, projectId);
    await addTaskToProjectInFireBase(taskId, projectId);
    updateProjectPercent(projectId);
  });

//close add project popup
  addTaskPopup.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      if(!checker && button.className == 'success-button'){return}
      addTaskPopup.style.display = "none";
    })
  });
}

function manageEditTask(task, name, description, status, taskId) {
  let checker = true;
  //open edit task popup
  const editTaskButton = task.querySelector(".edit-task-btn");
  editTaskButton.addEventListener("click", () => {
    editTaskPopup.style.display = "flex";
    editTaskPopup.querySelector("input.name").value = name;
    editTaskPopup.querySelector("textarea.description").value = description;
    editTaskPopup.id = taskId;
  });

  //confirm editing task
  const confirmEditTaskButton = editTaskPopup.querySelector(".success-button");
  confirmEditTaskButton.addEventListener("click", async () => {
    const editedName = editTaskPopup.querySelector("input.name").value;
    if (editedName.trim().length == 0){
      generalPopup("Task name can not be empty!", null, false);
      checker = false;
      return; 
    }else{
      checker = true
    }
    const editedDescription = editTaskPopup.querySelector("textarea.description").value;
    const editedStatus = task.querySelector(".status").value;
    const currentId = editTaskPopup.id;
    editTaskInHTML(editedName, editedDescription, editedStatus, currentId);
    await editTaskInFirebase(editedName, editedDescription, editedStatus, currentId, projectId);
  });

  //close edit project popup
  const buttons = editTaskPopup.querySelectorAll("button");
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      if(!checker && button.className == 'success-button'){return}
      editTaskPopup.style.display = "none";
    })
  });

  //delete project
  const deleteTaskButton = task.querySelector(".delete-task-btn");
  deleteTaskButton.addEventListener("click", async () => {
    generalPopup("Are you sure to delete this Task?", 
    async() =>{
      await deleteTaskInFirebase(taskId, projectId);
      deleteTaskInHTML(taskId);
      await deleteTaskFromProjectInFirebase(taskId, projectId);
      await updateProjectPercent(projectId);
    }, true);
    
  });

  //editing status
  const statusSelectionButton = task.querySelector(".status");
  statusSelectionButton.addEventListener("change", async () => {
    const name = task.querySelector(".name").innerHTML;
    const description = task.querySelector(".description").innerHTML;
    const editedStatus = statusSelectionButton.value;
    const id = taskId;
    editTaskInHTML(name, description, editedStatus, taskId);
    await editTaskInFirebase(name, description, editedStatus, taskId);
    await updateProjectPercent(projectId);
  });

}

async function addTaskToFirebase(name, description, status) {
  const newTask = await addDoc(tasksRef, {
    name,
    description,
    status: status,
    createdTime: serverTimestamp(),
    userList: [],
  });
  return newTask.id;
}
async function addTaskToHTML(name, description, status, taskId) {
  let t_item = document.createElement('div');
  t_item.className = 'grid-task-item drop-shadow';
  t_item.id = taskId;
  t_item.innerHTML = `
      <div class="task-name-box">
        <div class="taskheader"><p class="name">${name}</p></div>
        <p class="description" style="font-wei: normal">
          ${description}
        </p>
      </div>
      <div class="task-status-box">
        <div>
          <select class="status">
            <option selected="todo">todo</option>
            <option value="doing">doing</option>
            <option value="done">done</option>
          </select>
        </div>
      </div>
      <div class="task-menu-box">
        <button class="edit-task-btn">
          <img src="images/edit.png" height="16" width="16" alt="edit button" />
        </button>
        <button class="delete-task-btn">
          <img src="images/delete.png" height="18" width="18" alt="delete" />
        </button>
      </div>`;
  // console.log(t.name);
  t_item.querySelector(".status").value = status;

  content_wrapper.insertBefore(t_item, content_wrapper.children[1]);

  await updateProjectPercent(projectId);

  manageEditTask(t_item, name, description, status, taskId, projectId);

}

async function editTaskInFirebase(name, description, status, id) {
  const updatedDoc = await updateDoc(doc(db, "tasks", id), {
    name,
    description,
    status,
  });
}
function editTaskInHTML(name, descripton, status, id) {
  const task = document.getElementById(id);
  task.querySelector(".name").innerHTML = name;
  task.querySelector(".description").innerHTML = descripton;
  task.querySelector(".status").value = status
}

async function deleteTaskInFirebase(id) {
  await deleteDoc(doc(db, "tasks", id));
}
function deleteTaskInHTML(id) {
  const task = document.getElementById(id);
  content_wrapper.removeChild(document.getElementById(id));
}

async function addTaskToProjectInFireBase(taskId) {
  const project = await getDoc(doc(db, "projects", projectId));
  const taskList = project.data().taskList;
  taskList.push(taskId);
  const ret = await updateDoc(doc(db, "projects", projectId), {
    taskList,
  });
}
async function deleteTaskFromProjectInFirebase(taskId) {
  const project = await getDoc(doc(db, "projects", projectId));
  const taskList = project.data().taskList;
  taskList.splice(taskList.indexOf(taskId), 1);
  await updateDoc(doc(db, "projects", projectId), {
    taskList,
  });
}
