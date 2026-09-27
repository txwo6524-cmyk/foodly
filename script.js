let selectedAnimal = "dog";

document.getElementById("dogButton").addEventListener("click", () => {
  selectedAnimal = "dog";
});

document.getElementById("catButton").addEventListener("click", () => {
  selectedAnimal = "cat";
});
fetch("foods.json")
  .then(response => response.json())
  .then(foods => {

    const button = document.getElementById("searchButton");
    const results = document.getElementById("results");

    button.addEventListener("click", () => {

      const checked = document.querySelectorAll(
        'input[type="checkbox"]:checked'
      );

      const avoidedIngredients = Array.from(checked).map(
        checkbox => checkbox.value
      );

      const filteredFoods = foods.filter(food => {
        if (selectedAnimal && food.animal !== selectedAnimal) {
  return false;
}

return !food.ingredients.some(ingredient =>
  avoidedIngredients.includes(ingredient)
);

      results.innerHTML = "";

      filteredFoods.forEach(food => {

        const card = document.createElement("div");
        card.className = "food-card";

        card.innerHTML = `
          <h3>${food.name}</h3>
          <p>🐾 ${food.animal === "dog" ? "犬用" : "猫用"}</p>
          <p>原材料：${food.ingredients.join("・")}</p>
        `;

        results.appendChild(card);
      });

    });

  });
const buttons = document.querySelectorAll("body > button");

buttons[0].addEventListener("click", function() {
  alert("犬モードです！");
});

buttons[1].addEventListener("click", function() {
  alert("猫モードです！");
});
const dogButton = document.querySelector("button:nth-of-type(1)");
const catButton = document.querySelector("button:nth-of-type(2)");

dogButton.addEventListener("click", () => {
  const cards = document.querySelectorAll(".food-card");

  cards.forEach(card => {
    card.style.display =
      card.textContent.includes("犬用") ? "block" : "none";
  });
});

catButton.addEventListener("click", () => {
  const cards = document.querySelectorAll(".food-card");

  cards.forEach(card => {
    card.style.display =
      card.textContent.includes("猫用") ? "block" : "none";
  });
});
let selectedAnimal = "";

dogButton.addEventListener("click", () => {
  selectedAnimal = "dog";
});

catButton.addEventListener("click", () => {
  selectedAnimal = "cat";
});
