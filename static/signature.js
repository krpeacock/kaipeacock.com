const max = 20;

const letters = [];
const input = document.querySelector("#characters");

input.value = "aeukpcthsnx6dlwgrmf";

input.maxLength = max;
input.addEventListener("keyup", (e) => {
  if (e.keyCode < 48 || e.keyCode > 106) {
    return;
  }
  if (input.value.length === max) {
    input.value = input.value.slice(1, max) + e.key;
  }
  update();
});
function update() {
  const poem = `only after
the forms     were signed
and sealed

did I stop to consider
at age 32

I would need to learn
to sign my own name once again

Kaia Peacock`;
  const letters = [...input.value.toLowerCase()];
  console.log(poem);
  console.log(poem.split(""));
  const newPoem = [...poem].reduce((prev, next) => {
    if (next === "\n") {
      console.log("newline");
      prev += next;
    } else if (letters.includes(next.toLowerCase())) {
      prev += next;
    } else {
      prev += " ";
    }
    return prev;
  }, ``);
  console.log(newPoem);
  document.querySelector("#poem").innerHTML = newPoem;
}

update();
