const startButton = document.getElementById('start-journey');
const showNextButton = document.getElementById('show-next-button');
const diagramSection1 = document.getElementById('diagram-section-1');
const diagramSection2 = document.getElementById('diagram-section-2');
const diagramSection3 = document.getElementById('diagram-section-3');
const showNextButtonSection = document.getElementById('show-next-button-section');
let hasBeenPressed = false;

startButton.addEventListener('click', () => {
  console.log("pressed start button")
  diagramSection1.classList.toggle('hidden');
  setupDataAndPlots();
  showNextButtonSection.classList.toggle('hidden');
  startButton.remove();
});

showNextButton.addEventListener('click', () => {
  if (hasBeenPressed) {
    diagramSection3.classList.toggle('hidden');
    showNextButton.remove();
  } else {
    diagramSection2.classList.toggle('hidden');
    hasBeenPressed = true;
  }
});