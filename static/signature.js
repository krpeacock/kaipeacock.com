const max = 24;
let initialCharacters = "sfck0pwtqhnx3dlwgrm6";
const input = document.querySelector("#characters");
const poemDiv = document.querySelector("#poem");
const clearButton = document.querySelector("#clear");

input.maxLength = max;

input.addEventListener("keyup", (e) => {
  if (e.keyCode < 48 || e.keyCode > 106) {
    return;
  }
  if (input.value.length === max) {
    // protect against duplicates once full
    if (input.value.includes(e.key)) return;

    // protect against repeated keys
    if (input.value[input.value.length - 1] !== e.key) {
      input.value = input.value.slice(1) + e.key;
    }
  }
  update();
});

function update() {
  const poem = `0nly after
the forms     were signed
and seal3d

did 1 stop to consider
at age 32

1 would need to l34rn
to sign my 0wn name 4gain
5lowly
1ike a chi1d

love
kaia peacock`;
  const letters = [...initialCharacters, ...input.value.toLowerCase()].slice(
    -1 * max
  );
  // const letters = [...input.value.toLowerCase()].slice(-1 * max);
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
