
// const popup = document.querySelector(".popup");
//
// //Create a project popup from the template.
// const projectPopup = popup.cloneNode(true);
// projectPopup.id = "project";
// document.body.appendChild(projectPopup);



const addProjectButton = document.querySelector(".add-project");
addProjectButton.addEventListener("click", () => {
  const projectPopup = document.querySelector(".popup#project");
  projectPopup.style.display = "flex";
});

const addTaskButton = document.querySelector(".add-task");
addTaskButton.addEventListener("click", () => {
  const projectPopup = document.querySelector(".popup#task");
  projectPopup.style.display = "flex";
});




const successButtons = document.querySelectorAll(".success-button");
for (const successButton of successButtons) {
  successButton.addEventListener("click", () => {
    successButton.parentElement.parentElement.parentElement.style.display = "none";
  });
}

const secondaryButtons = document.querySelectorAll(".secondary-button");
for (const secondaryButton of secondaryButtons) {
  secondaryButton.addEventListener("click", () => {
    secondaryButton.parentElement.parentElement.parentElement.style.display = "none";
  });
}




