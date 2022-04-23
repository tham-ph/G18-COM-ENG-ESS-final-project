
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


const gridProject = document.querySelector(".grid-main");
const addUserPopup = document.querySelector(".add-user.popup");
const addProjectPopup = document.querySelector(".add-project.popup");
const editProjectPopup = document.querySelector(".edit-project.popup");

const addUserButton = addUserPopup.querySelector(".success-button");
addUserButton.addEventListener("click", () => {
  const name = addUserPopup.querySelector("input.name").value;
  addUserToFirebase(name);
  addUserToHTML(name);
  addUserPopup.style.display = "none";
});


//load projects when the website is open or refreshed
await loadProjects();

// open add project popup
const addProjectButton = document.querySelector(".add-project");
addProjectButton.addEventListener("click", () => {
  addProjectPopup.style.display = "flex";
  addProjectPopup.querySelector("input.name").value = "";
  addProjectPopup.querySelector("textarea.description").value = "";
});

//confirm adding new project
const confirmAddProjectButton = addProjectPopup.querySelector(".success-button");
confirmAddProjectButton.addEventListener("click", () => {
  const name = addProjectPopup.querySelector("input.name").value;
  const description = addProjectPopup.querySelector("textarea.description").value;
  const id = addProjectToFirebase(name, description)
  addProjectToHTML(name, description, id);
});

//close add project popup
addProjectPopup.querySelectorAll("button").forEach((button) => {
  button.addEventListener("click", () => {
    addProjectPopup.style.display = "none";
  })
});


async function loadProjects() {
  const projects = await getDocs(query(projectsRef, orderBy("createdTime")));
  projects.forEach((project) => {
    const name = project.data().name;
    const description = project.data().description;
    const id = project.id;
    addProjectToHTML(name, description, id);
  });
}

async function addUserToFirebase(name) {
  const checkExistence = await getDocs(query(usersRef, where("name", "==", name)));
  if (checkExistence.size > 0) {
    return;
  }
  await addDoc(usersRef, {
    name,
    createdTime: serverTimestamp(),
  })
}
function addUserToHTML(name) {
  document.querySelectorAll(".menu h1")[1].innerHTML = name;
}

async function addProjectToFirebase(name, description) {
  const newProject = await addDoc(projectsRef, {
    name,
    description,
    createdTime: serverTimestamp(),
    taskList: [],
  });
  return newProject.id;
}
function addProjectToHTML(name, description, id) {
  let project = document.querySelector(".grid-proj-item.template").cloneNode(true);
  project.style.display = "grid";
  project.id = id;
  project.querySelector(".name").innerHTML = name;
  project.querySelector(".description").innerHTML = description;
  gridProject.insertBefore(project, gridProject.lastElementChild);

  //open edit project popup
  const editProjectButton = project.querySelector(".edit-project-btn");
  editProjectButton.addEventListener("click", () => {
    editProjectPopup.style.display = "flex";
    editProjectPopup.querySelector("input.name").value = name;
    editProjectPopup.querySelector("textarea.description").value = description;
    editProjectPopup.id = id;
  });

  //confirm editing project
  const confirmEditProjectButton = editProjectPopup.querySelector(".success-button");
  confirmEditProjectButton.addEventListener("click", () => {
    const editedName = editProjectPopup.querySelector("input.name").value;
    const editedDescription = editProjectPopup.querySelector("textarea.description").value;
    const currentId = editProjectPopup.id;
    editProjectInHTML(editedName, editedDescription, currentId);
    editProjectInFirebase(editedName, editedDescription, currentId);
  });

  //close edit project popup
  const buttons = editProjectPopup.querySelectorAll("button");
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      editProjectPopup.style.display = "none";
    })
  });

  //delete project
  const deleteProjectButton = project.querySelector(".delete-project-btn");
  deleteProjectButton.addEventListener("click", () => {
    deleteProjectInFirebase(id);
    deleteProjectInHTML(id);
  });
}

async function editProjectInFirebase(name, description, id) {
  const updatedDoc = await updateDoc(doc(db, "projects", id), {
    name,
    description,
  });
}
function editProjectInHTML(name, descripton, id) {
  const project = document.getElementById(id);
  project.querySelector(".name").innerHTML = name;
  project.querySelector(".description").innerHTML = descripton;
}

async function deleteProjectInFirebase(id) {
  await deleteDoc(doc(db, "projects", id));
}
function deleteProjectInHTML(id) {
  const project = document.getElementById(id);
  gridProject.removeChild(document.getElementById(id));
}

//===============================================================







