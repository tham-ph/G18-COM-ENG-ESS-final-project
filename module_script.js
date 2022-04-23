// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.11/firebase-app.js";
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
} from 'https://www.gstatic.com/firebasejs/9.6.11/firebase-firestore.js';
  
const db = getFirestore();
const projectRef = collection(db, 'projects');

async function showProjectGrid() {
  const content_wrapper = document.getElementById('content-wrapper');
  if (content_wrapper.classList.contains('grid-task')){
    content_wrapper.className = 'grid-main';
    clearTaskItem()
    document.querySelectorAll('.proj-status')[0].style.display = "none";
    document.querySelectorAll('.add-button')[0].style.display = "none";
    document.querySelectorAll('#add-project-wrapper')[0].style.display = "initial";
  }else{
    clearProjectItem()
  }
  

  const collection = await getDocs(projectRef)
  const projects = collection.docs.map(proj => {
    return { ...proj.data(), id: proj.id }
  })

  projects.map((proj) => {
    let proj_item = document.createElement('div');
    proj_item.className = 'grid-proj-item';
    proj_item.innerHTML = `
    <div class="project-box drop-shadow" id="${proj.id}">
      <div class="btn-to-project">
        <h3 style="overflow-wrap: break-word;">${proj.name}</h3>
        <div class="proj-des-box">
        <p>Description : ${proj.description}</p>
        </div>
        <p id="${proj.id}-staus-text">Status: 0%</p>
        <div class="progress">
          <div class="progress-done" style="width:0%" id="${proj.id}-progress"></div>
        </div>
        <br>
        <button class="edit-project-btn">
          <p>edit</p>
        </button>
      </div>
    </div>`;
    // console.log(proj.name);
    content_wrapper.insertBefore(proj_item, content_wrapper.children[0]);
    updateProjectPercent(proj.taskList, proj.id);
  })
  projectBtnEvent();
  // countTotal();
}

async function showTaskGrid(project_id) {
  const content_wrapper = document.getElementById('content-wrapper');
  if (content_wrapper.classList.contains('grid-main')){
    content_wrapper.className = 'grid-task';
    clearProjectItem()
    document.querySelectorAll('.proj-status')[0].style.display = "initial";
    document.querySelectorAll('.add-button')[0].style.display = "initial";
    document.querySelectorAll('#add-project-wrapper')[0].style.display = "none"
  }else{
    clearTaskItem()
  }

  const projRef = doc(db, `projects/${project_id}`);
  const proj = await getDoc(projRef);
  const tasks = proj.data().taskList;
  
  tasks.map(async(task) => {
    const taskRef = doc(db, `tasks/${task}`);
    const taskDoc = await getDoc(taskRef);
    if (taskDoc.exists()){
      const t = taskDoc.data()
      let t_item = document.createElement('div');
      t_item.className = 'grid-task-item drop-shadow';
      t_item.innerHTML = `
      <div class="task-name-box">
        <div class="taskheader"><div class="task-name">${t.name}</div></div>
        <div class="task-description">
          ${t.description}
        </div>
      </div>
      <div class="task-status-box">
        <div>
          <select id="status">
            <option selected="todo">todo</option>
            <option value="doing">doing</option>
            <option value="done">done</option>
          </select>
        </div>
      </div>
      <div class="task-menu-box">
        <button class="edit">
          <img src="images/edit.png" height="16" width="16" alt="edit button" />
        </button>
        <button class="delete">
          <img src="images/delete.png" height="18" width="18" alt="delete" />
        </button>
      </div>`;
    // console.log(t.name);
      content_wrapper.insertBefore(t_item, content_wrapper.children[1]);
    }
  });
  document.getElementById("proj-name-task").innerText = proj.data().name;
  document.getElementById("proj-desc-task").innerText = "Description : " + proj.data().description;
  const proj_task_status_txt = document.getElementsByClassName("proj-task-status-txt")[0];
  const proj_task_status_bar = document.getElementsByClassName("proj-task-status-bar")[0];
  proj_task_status_txt.id = project_id+"-staus-text";
  proj_task_status_bar.id = project_id+"-progress";
  proj_task_status_txt.innerText = "Status : 0%"
  proj_task_status_bar.style.width = "0px";
  updateProjectPercent(tasks, project_id);
}

async function updateProjectPercent(taskList, proj_id){
  const all_task = taskList.length;
  if (all_task == 0) {return 0}
  var done_task = 0;
  const promises = await taskList.map(async(task) => {
    const taskRef = doc(db, `tasks/${task}`);
    const taskDoc = await getDoc(taskRef);
    if(taskDoc.exists() && taskDoc.data().status == "done"){
        done_task += 1;
      }
  })
  await Promise.all(promises);
  const bar = document.getElementById(proj_id+"-progress");
  const txt = document.getElementById(proj_id+"-staus-text");
  const donePercent = parseInt(100*done_task/ all_task);
  if(bar){
    bar.style.width = donePercent + "%";
  }
  if(txt){
    txt.innerText = "Status : " + done_task + "/" + all_task + ' (' + donePercent + '%)' ;
  }
}


function initialShow(){
  const content_wrapper = document.getElementById('content-wrapper');
  content_wrapper.className = 'grid-main';
  clearTaskItem()
  clearProjectItem()
  document.querySelectorAll('.proj-status')[0].style.display = "none";
  document.querySelectorAll('.add-button')[0].style.display = "none";
  document.querySelectorAll('#add-project-wrapper')[0].style.display = "initial";
  homeBtnEvent()
}


function clearTaskItem(){
  const task_items = document.querySelectorAll('.grid-task-item');
  task_items.forEach(task => {
    task.remove();
  });
}

function clearProjectItem(){
  const project_items = document.querySelectorAll('.grid-proj-item');
  project_items.forEach(proj => {
    if(proj.id != 'add-project-wrapper'){
      proj.remove();
    }
  });
}

function projectBtnEvent() {
  const projBtns = document.getElementsByClassName('btn-to-project');
  for (let i = 0; i < projBtns.length; i++) {
    const project_id = projBtns.item(i).parentElement.id;
    //console.log(idTodelete);
    projBtns.item(i).addEventListener('click', (e) => {
      e.stopPropagation();
      document.addEventListener('click', showTaskGrid(project_id));
    });
  }
}

function homeBtnEvent() {
  const homeBtns = document.getElementsByClassName('home-btn')[0];
  homeBtns.addEventListener('click', (e) => {
    e.stopPropagation();
    document.addEventListener('click', showProjectGrid());
  });
}

initialShow();

showProjectGrid();

// showTaskGrid("UqYEPEXE5NQymjFwAeiX");