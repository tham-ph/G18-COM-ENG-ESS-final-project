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
let lastUserId = sessionStorage.getItem('lastId');
let localLastName  = localStorage.getItem('lastId');

async function showProjectGrid() {
  document.querySelectorAll('.containner')[0].style.display = '';
  if (content_wrapper.classList.contains('grid-task')) {
    content_wrapper.className = 'grid-main';
    clearTaskItem();
    document.querySelectorAll('.proj-status')[0].style.display = "none";
    document.querySelectorAll('.add-button')[0].style.display = "none";
    document.querySelectorAll('#add-project-wrapper')[0].style.display = "";
    
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
    document.querySelectorAll('.proj-status')[0].style.display = "";
    document.querySelectorAll('.add-button')[0].style.display = "";
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
      await addTaskToHTML(t.name, t.description, t.status, taskDoc.id);
      // console.log(t.userList);
      updateTaskStatus(task, t.status, Boolean(t.userList.indexOf(userId)>-1));
      updateTaskParticipant(task);
    }
  });
  document.getElementById("proj-name-task").innerText = proj.data().name;
  document.getElementById("proj-name-owner").innerText = "Creator : " + await userNamefromId(proj.data().owner);
  const pd2 = document.getElementById("proj-desc-task");
  pd2.innerText = "";
  const sta2 = document.createElement("strong");
  sta2.innerText = "Description : "; 
  pd2.appendChild(sta2);
  const data2 = document. createTextNode(proj.data().description);
  pd2.appendChild(data2);
  const proj_task_status_txt = document.getElementsByClassName("proj-task-status-txt")[0];
  const proj_task_status_bar = document.getElementsByClassName("proj-task-status-bar")[0];
  const proj_participants = document.getElementsByClassName("proj-participants")[0];
  proj_task_status_txt.id = projectId + "-t-status-text";
  proj_task_status_bar.id = projectId + "-t-progress";
  proj_task_status_txt.innerText = "Status : 0%"
  proj_task_status_bar.style.width = "0px";
  proj_participants.id = projectId + "-t-participants";
  proj_participants.innerText = "Participants : 0 people";

  // console.log("taskgirdshow" + projectId);
}

async function userNamefromId(usrId){
    const usrDoc = await getDoc(doc(db, `users/${usrId}`));
    if(usrDoc.exists()){
      return usrDoc.data().name;
    }
    return "";
}

async function updateProjectPercent(projectId) {
  const project = await getDoc(doc(db, "projects", projectId));
  const taskList = project.data().taskList;
  const all_task = taskList.length;
  let participants = [];
  if (all_task == 0) {
    return 0
  }
  var done_task = 0;
  const promises = await taskList.map(async (task) => {
    const taskRef = doc(db, `tasks/${task}`);
    const taskDoc = await getDoc(taskRef);
    if (taskDoc.exists()){
      if(taskDoc.data().status == "done"){
        done_task += 1;
      }
      participants = participants.concat(taskDoc.data().userList.filter((item) => participants.indexOf(item) < 0));
    }
  });
  await Promise.all(promises);
  // console.log(participants);
  const bar1 = document.getElementById(projectId+"-progress");
  const txt1 = document.getElementById(projectId+"-status-text");
  const bar2 = document.getElementById(projectId+"-t-progress");
  const txt2 = document.getElementById(projectId+"-t-status-text");
  const par1 = document.getElementById(projectId+"-participants");
  const par2 = document.getElementById(projectId+"-t-participants");
  const donePercent = parseInt(100 * done_task / all_task);
  if (bar1) {
    bar1.style.width = donePercent + "%";
  }
  if (txt1) {
    txt1.innerText = "";
    const sta = document.createElement("strong");
    sta.innerText = "Status : ";
    txt1.appendChild(sta);
    const data = document. createTextNode(done_task + "/" + all_task + ' (' + donePercent + '%)');
    txt1.appendChild(data);
  }
  if (bar2) {
    bar2.style.width = donePercent + "%";
  }
  if (txt2) {
    txt2.innerText = "";
    const sta = document.createElement("strong");
    sta.innerText = "Status : ";
    txt2.appendChild(sta);
    const data = document. createTextNode(done_task + "/" + all_task + ' (' + donePercent + '%)');
    txt2.appendChild(data);
  }
  if (par1) {
    par1.innerText = "";
    const sta = document.createElement("strong");
    sta.innerText = "Participants : ";
    par1.appendChild(sta);
    const data = document. createTextNode(participants.length +" people");
    par1.appendChild(data);
  }
  if (par2) {
    par2.innerText = "";
    const sta = document.createElement("strong");
    sta.innerText = "Participants : ";
    par2.appendChild(sta);
    const data = document. createTextNode(participants.length +" people");
    par2.appendChild(data);
  }
}

async function updateTaskParticipant(taskId){
    const holder = document.getElementById(`${taskId}-task-parti`);
    holder.innerHTML = "";
    const taskDoc = await getDoc(doc(db, "tasks", taskId));
    if (taskDoc.exists()) {
      taskDoc.data().userList.map( async(usr) => {
        const usrName = await userNamefromId(usr);
        let pdiv = document.createElement('div');
        pdiv.className = "participant";
        pdiv.style = "background: #ef4374;";
        pdiv.innerText = usrName;
        holder.appendChild(pdiv);
      });
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
  document.querySelectorAll('#add-project-wrapper')[0].style.display = "";
  homeBtnEvent();
  userBtnEvent();

  if (lastUserId){
    userId = lastUserId;
    showProjectGrid();
    renameUser();
  }else{
  showUserView();
  }
}
async function renameUser(){
  const name = await userNamefromId(userId);
  addUserToHTML(name);
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
  if(localLastName){
    addUserPopup.querySelector("input.name").value = localLastName;
  }

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


addUserButton.addEventListener("click", async() => {
  const name = addUserPopup.querySelector("input.name").value;
  if (name.trim().length == 0){
    generalPopup("username can not be empty!", null, false);
    return 
  }
  await addUserToFirebase(name);
  addUserToHTML(name);
  localStorage.setItem("lastId",name);
  showProjectGrid();
  addUserPopup.style.display = "none";
});

//
addUserButton.addEventListener('keydown', (event) => {
  if (event.key === "Enter"){
    event.preventDefault();
    const name = addUserPopup.querySelector("input.name").value;
    if (name.trim().length == 0){
      generalPopup("username can not be empty!", null, false);
      return 
    }
    addUserToFirebase(name);
    addUserToHTML(name);
    showProjectGrid();
    addUserPopup.style.display = "none";
  }
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
  generalPop.querySelector('.secondary-button').style.display = '';

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
    // console.log(checkExistence);
    // console.log(checkExistence.docs[0].id);
    userId = checkExistence.docs[0].id;
    sessionStorage.setItem('lastId', checkExistence.docs[0].id);
    return;
  }
  const newUser = await addDoc(usersRef, {
    name,
    createdTime: serverTimestamp(),
  });
  userId = newUser.id;
  sessionStorage.setItem('lastId', checkExistence.docs[0].id);
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
        <h3 class="name" style="overflow-wrap: break-word;"></h3>
        <div class="proj-des-box">
        <p class="description"><strong>Description : </strong></p>
        </div>
        <p id="${id}-participants"><strong>Participants :</strong> 0 people</p>
        <p id="${id}-status-text"><strong>Status :</strong> 0%</p>
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
  
    proj_item.querySelector(".name").innerText = name;
    const pd1 = proj_item.querySelector(".description");
    pd1.innerText = "";
    const sta1 = document.createElement("strong");
    sta1.innerText = "Description : "; 
    pd1.appendChild(sta1);
    const data1 = document. createTextNode(description);
    pd1.appendChild(data1);
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
    updateTaskStatus(taskId, status, false);
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
    // const editedStatus = task.querySelector(".status").value;
    const currentId = editTaskPopup.id;
    editTaskInHTML(editedName, editedDescription, null, currentId);
    await editTaskInFirebase(editedName, editedDescription, currentId,);
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
  const join_btn = task.querySelector(".join-task-btn");
  join_btn.addEventListener('click', async() =>{
    const taskRef = await doc(db, "tasks", taskId);
    const taskDoc = await getDoc(taskRef);
    const t_data = taskDoc.data();
    if (t_data.status == 'done'){return}
    let usrs = t_data.userList;
    let sta = t_data.status;
    let is_parti = false
    if(usrs.indexOf(userId)>-1){
      usrs.splice(usrs.indexOf(userId), 1);
      is_parti = false;
    }else{
      usrs.push(userId);
      is_parti = true
    }
    if(usrs.length > 0){
      sta = "doing"
      
    }else{
      sta = "todo"
    }
    
    updateTaskStatus(taskId, sta, is_parti);
    await updateDoc(taskRef, {userList:usrs, status:sta});
    updateProjectPercent(projectId);
    updateTaskParticipant(taskId);
  });
  const done_btn = task.querySelector(".mark-as-done");
  done_btn.addEventListener( 'click', async()=> {
    const taskRef = await doc(db, "tasks", taskId);
    const taskDoc = await getDoc(taskRef);
    const t_data = taskDoc.data();
    if (t_data.status == 'todo'){return}
    let usrs = t_data.userList;
    let sta = t_data.status;
    if(usrs.indexOf(userId)<0){
      return;
    }
    if(t_data.status == 'done'){
      sta = "doing"
    }else{
      sta = "done"
    }
    updateTaskStatus(taskId, sta, true)
    await updateDoc(taskRef, {status:sta});
    updateProjectPercent(projectId);
    updateTaskParticipant(taskId);
  });
  // const statusSelectionButton = task.querySelector(".status");
  // statusSelectionButton.addEventListener("change", async () => {
  //   const name = task.querySelector(".name").innerHTML;
  //   const description = task.querySelector(".description").innerHTML;
  //   const editedStatus = statusSelectionButton.value;
  //   const id = taskId;
  //   editTaskInHTML(name, description, editedStatus, taskId);
  //   await editTaskInFirebase(name, description, editedStatus, taskId);
  //   await updateProjectPercent(projectId);
  // });
}

function updateTaskStatus(taskId, sta, is_parti){
  const task = document.getElementById(taskId);
  const status_real = task.querySelector(".real-status-box");
  const join_btn = task.querySelector(".join-task-btn");
  const join_img = join_btn.querySelector('.img-ratio-cover');
  const done_btn = task.querySelector(".mark-as-done");
  const done_img = done_btn.querySelector('.img-ratio-cover');

  join_img.src = "images/blank.png";
  done_img.src = "images/blank.png";
  join_img.classList.remove("hover-exit-icon");
  done_img.classList.remove("hover-cross-icon");
  join_btn.classList.remove("point");
  done_btn.classList.remove("point");
  join_btn.firstElementChild.classList.remove("acc-hide");
  done_btn.firstElementChild.classList.remove("acc-hide");

  switch (sta){
    case "done":
        join_btn.firstElementChild.classList.add("acc-hide");
        status_real.innerText = "Task Done";
        status_real.style = "background:green;";
        if(is_parti){
          join_btn.style = "background:white";
          done_img.src = "images/check_green.png";
          done_img.classList.add("hover-cross-icon");
          done_btn.classList.add("point");
        }else{
          done_img.src = "images/check_green.png";
        }
        break;
    case "doing":
        join_btn.classList.add("point");
        if(is_parti){
          join_img.src = "images/hand.png";
          join_btn.style = "background:green";
          status_real.innerText = "Participating";
          status_real.style = "background:blue;";
          join_img.classList.add("hover-exit-icon");
          done_btn.classList.add("point");
        }else{
          join_img.src = "images/hand.png";
          join_btn.style = "background:var(--background-color)";
          status_real.innerText = "Undertaking";
          status_real.style = "background:orange;";
          done_btn.firstElementChild.classList.add("acc-hide");
        }
        break;
    case "todo":
          
          done_btn.firstElementChild.classList.add("acc-hide");
          join_img.src = "images/hand.png";
          join_btn.classList.add('point');
          join_btn.style = "background:var(--background-color)";
          status_real.innerText = "TO-DO";
          status_real.style = "background:rgb(189, 80, 115)";
          break;
    default:
      done_btn.firstElementChild.classList.add("acc-hide");
      join_img.src = "images/hand.png";
      join_btn.classList.add('point');
      join_btn.style = "background:var(--background-color)";
      status_real.innerText = "TO-DO";
      status_real.style = "background:rgb(189, 80, 115)";
    }
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
      <div class="task-name-box point">
        <div class="taskheader"><p class="name"></p></div>
      </div>
      <div class="task-status-box" style="display:grid; align-items:center">
        <div style="display:grid; grid-template-columns: 1fr 1fr 1fr;">
          <button class="join-task-btn">
          <div>
            <div class="ratio-box-img">
            
            <img
              class="img-ratio-cover"
              src="images/blank.png"
              alt="add button"
            />
            </div>
          </button>
          <div class="real-status-box">
            TO-DO
          </div>
          <button class="mark-as-done">
            <div class="ratio-box-img">
            <img
              class="img-ratio-cover"
              src="images/blank.png"
              alt="add button"
            />
            </div>
          </button>
        </div>
      </div>
      <div class="accord-sep"></div>
      <div class="task-des-acc according-task acc-hide">Description :</div>
      <div class="task-part-acc according-task acc-hide">Participants :</div>
      <div class="task-des according-task acc-hide">
        <p class="description task-description">
        </p>
      </div>
      <div class="task-parti-holder according-task acc-hide" id="${taskId}-task-parti">
      </div>
      <div class="task-menu-box according-task acc-hide">
        <button class="edit-task-btn">
          <img src="images/edit.png" height="16" width="16" alt="edit button" />
        </button>
        <button class="delete-task-btn">
          <img src="images/delete.png" height="18" width="18" alt="delete" />
        </button>
      </div>`
      ;
  // console.log(t.name);
  // t_item.querySelector(".status").value = status;
  t_item.querySelector(".task-description").innerText = description;
  t_item.querySelector(".name").innerText = name;
  t_item.querySelector(".task-name-box").addEventListener('click', () =>{
    t_item.querySelectorAll(".according-task").forEach( (acc) =>{
      acc.classList.toggle("acc-hide");
      if(acc.classList.contains("task-parti-holder")){
        acc.classList.toggle("task-parti");
      }
    })
  })
  content_wrapper.insertBefore(t_item, content_wrapper.children[1]);
  await updateProjectPercent(projectId);
  manageEditTask(t_item, name, description, status, taskId, projectId);
}

async function editTaskInFirebase(name, description, id) {
  const updatedDoc = await updateDoc(doc(db, "tasks", id), {
    name,
    description,
  });
}
// here
function editTaskInHTML(name, descripton, status, id) {
  const task = document.getElementById(id);
  task.querySelector(".name").innerHTML = name;
  task.querySelector(".description").innerHTML = descripton;
  // task.querySelector(".status").value = status
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
