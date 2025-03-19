import WISEAPI from "./wiseAPI.js";

var days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function getUrlParameter(name) {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
  var results = regex.exec(location.search);
  return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

document.addEventListener("DOMContentLoaded", function () {
  const tableHeader = document.getElementById("table-header");
  const tableContent = document.getElementById("table-content");
  const submitButton = document.querySelector("button");
  const confirmationMessage = document.getElementById("submit-msg");

  let dayStatuses = {};
  const wiseAPI = new WISEAPI();

  const variablesParam = getUrlParameter("variables");
  const variables = variablesParam ? variablesParam.split(",") : [];
  if (variables.length === 0) {
    variables.push("light", "water");
  }

  const labelParam = getUrlParameter("label");
  const labelText = labelParam ? `: ${labelParam}` : "";

  const h1 = document.querySelector("h1");
  if (labelText) {
    h1.textContent = `${h1.textContent}${labelText}`;
  }

  // Generate table headers and checkboxes
  days.forEach((day) => {
    // Create table header
    let th = document.createElement("th");
    th.textContent = day;
    tableHeader.appendChild(th);

    // Create table data cell with checkbox
    let td = document.createElement("td");
    let checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.ariaLabel = day;
    td.appendChild(checkbox);
    tableContent.appendChild(td);

    // Initialize day status object
    dayStatuses[day] = false;

    // Add event listener to update day status on change
    checkbox.addEventListener("change", function () {
      dayStatuses[day] = this.checked;
    });
  });

  // Add event listener to submit button
  submitButton.addEventListener("click", function () {
    confirmationMessage.textContent = "";
    let instructions = [];
    for (const day in dayStatuses) {
      let instruction = {
        days: 1,
        light: 4,
        water: 4,
      };
      if (variables.includes("light")) {
        instruction.light = dayStatuses[day] ? 4 : 0;
      }
      if (variables.includes("water")) {
        instruction.water = dayStatuses[day] ? 4 : 0;
      }
      instructions.push(instruction);
    }

    // Create component state
    let componentState = wiseAPI.createComponentState(
      { instructions: instructions.concat(instructions).concat(instructions) },
      "studentWork",
      false,
      true
    );

    // Send component state to parent
    wiseAPI.sendMessageToParent(componentState);
    setTimeout(function () {
      confirmationMessage.textContent = "Schedule updated!";
    }, 1000);
  });
});
