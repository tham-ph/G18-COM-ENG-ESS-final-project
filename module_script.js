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
    <div class="project-box">
      <h3 style="overflow-wrap: break-word;">${proj.name}</h3>
      <p>Description: ${proj.description}</p>
      <br>
      <br>
      <br>
      <p>Status:</p>
      <div class="progress">
        <div class="progress-done"></div>
      </div>
      <br>
      <button class="edit-project-btn">
        <p>edit</p>
      </button>
    </div>`;
    console.log(proj.name);
    content_wrapper.insertBefore(proj_item, content_wrapper.children[0]);
  })
  // deleteBtnEvent();
  // countTotal();
}

async function showTaskGrid() {
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
}


function initialShow(){
  const content_wrapper = document.getElementById('content-wrapper');
  content_wrapper.className = 'grid-main';
    clearTaskItem()
    clearProjectItem()
    document.querySelectorAll('.proj-status')[0].style.display = "none";
    document.querySelectorAll('.add-button')[0].style.display = "none";
    document.querySelectorAll('#add-project-wrapper')[0].style.display = "initial";
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

initialShow();

showProjectGrid();