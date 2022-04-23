
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
  getFirestore,
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  where,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
} from 'https://www.gstatic.com/firebasejs/9.6.11/firebase-firestore.js';


const db = getFirestore();
const usersRef = collection(db, "users");
const projectsRef = collection(db, "projects");
const tasksRef = collection(db, "tasks");

const projectId = "omtPPQKp49DPYCaMaXp5";
const project = await getDoc(doc(db, "projects", projectId));

const gridTask = document.querySelector(".grid-task");
const addTaskPopup = document.querySelector(".add-task.popup");
const editTaskPopup = document.querySelector(".edit-task.popup");

//load task when the website is open or refreshed
await loadTasks();

// open add task popup
const addTaskButton = document.querySelector(".add-task");
addTaskButton.addEventListener("click", () => {
  addTaskPopup.style.display = "flex";
  addTaskPopup.querySelector("input.name").value = "";
  addTaskPopup.querySelector("textarea.description").value = "";
});

//confirm adding new task
const confirmAddTaskButton = addTaskPopup.querySelector(".success-button");
confirmAddTaskButton.addEventListener("click", async () => {
  const name = addTaskPopup.querySelector("input.name").value;
  const description = addTaskPopup.querySelector("textarea.description").value;
  const status = "todo";
  const id = await addTaskToFirebase(name, description, status);
  addTaskToHTML(name, description, status, id);
  addTaskToProjectInFireBase(id);
});

//close add project popup
addTaskPopup.querySelectorAll("button").forEach((button) => {
  button.addEventListener("click", () => {
    addTaskPopup.style.display = "none";
  })
});


async function loadTasks() {
  const taskList = project.data().taskList;
  const tasks = await getDocs(query(tasksRef, orderBy("createdTime")));
  tasks.forEach((task) => {
    if (taskList.includes(task.id)) {
      const name = task.data().name;
      const description = task.data().description;
      const status = task.data().status;
      const id = task.id;
      addTaskToHTML(name, description, status, id);
    }
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
function addTaskToHTML(name, description, status, id) {
  let task = document.querySelector(".grid-task .box.template").cloneNode(true);
  task.style.display = "grid";
  task.id = id;
  task.querySelector(".name").innerHTML = name;
  task.querySelector(".description").innerHTML = description;
  task.querySelector(".status").value = status;
  gridTask.insertBefore(task, gridTask.lastElementChild);

  //open edit task popup
  const editTaskButton = task.querySelector(".edit-task-btn");
  editTaskButton.addEventListener("click", () => {
    editTaskPopup.style.display = "flex";
    editTaskPopup.querySelector("input.name").value = name;
    editTaskPopup.querySelector("textarea.description").value = description;
    editTaskPopup.id = id;
  });

  //confirm editing task
  const confirmEditTaskButton = editTaskPopup.querySelector(".success-button");
  confirmEditTaskButton.addEventListener("click", () => {
    const editedName = editTaskPopup.querySelector("input.name").value;
    const editedDescription = editTaskPopup.querySelector("textarea.description").value;
    const editedStatus = task.querySelector(".status").value;
    const currentId = editTaskPopup.id;
    editTaskInHTML(editedName, editedDescription, editedStatus, currentId);
    editTaskInFirebase(editedName, editedDescription, editedStatus, currentId);
  });

  //close edit project popup
  const buttons = editTaskPopup.querySelectorAll("button");
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      editTaskPopup.style.display = "none";
    })
  });

  //delete project
  const deleteTaskButton = task.querySelector(".delete-task-btn");
  deleteTaskButton.addEventListener("click", () => {
    deleteTaskInFirebase(id);
    deleteTaskInHTML(id);
    deleteTaskFromProjectInFirebase(id);
  });

  //editing status
  const statusSelectionButton = task.querySelector(".status");
  statusSelectionButton.addEventListener("change", () => {
    const name = task.querySelector(".name").innerHTML;
    const description = task.querySelector(".description").innerHTML;
    const editedStatus = statusSelectionButton.value;
    const id = task.id;
    editTaskInHTML(name, description, editedStatus, id);
    editTaskInFirebase(name, description, editedStatus, id);
  });

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
  gridTask.removeChild(document.getElementById(id));
}

async function addTaskToProjectInFireBase(id) {
  const taskList = project.data().taskList;
  taskList.push(id);
  const ret = await updateDoc(doc(db, "projects", projectId), {
    taskList,
  });
}

async function deleteTaskFromProjectInFirebase(id) {
  const taskList = project.data().taskList;
  taskList.splice(taskList.findIndex(id), 1);
  await updateDoc(doc(db, "projects", projectId), {
    taskList,
  });
}







