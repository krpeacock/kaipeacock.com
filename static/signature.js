const max = 20;
let initialCharacters = "aeukpcthsnx2dlwgrmf";
const input = document.querySelector("#characters");
const poemDiv = document.querySelector("#poem");
const clearButton = document.querySelector("#clear");

input.maxLength = max;
input.addEventListener("keyup", (e) => {
  if (e.keyCode < 48 || e.keyCode > 106) {
    return;
  }
  if (input.value.length >= max) {
    input.value = input.value.slice(1, max) + e.key;
  }
  update();
});

function update() {
  const poem = `only after
the forms     were signed
and sealed

did i stop to consider
at age 32

i would need to learn
to sign my own name again

kaia peacock`;
  const letters = [...initialCharacters, ...input.value.toLowerCase()].slice(
    -1 * max
  );
  const newPoem = [...poem].reduce((prev, next) => {
    if (next === "\n") {
      prev += next;
    } else if (letters.includes(next.toLowerCase())) {
      prev += next;
    } else {
      prev += " ";
    }
    return prev;
  }, ``);
  poemDiv.innerHTML = newPoem;
}

clearButton.addEventListener("click", () => {
  initialCharacters = "";
  input.value = "";
  poemDiv.innerHTML = "";
});

update();
