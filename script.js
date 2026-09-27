fetch("foods.json")
  .then(response => response.json())
  .then(foods => {
    const currentFood = document.getElementById("currentFood");
currentFood.addEventListener("change", () => {
  const selectedFood = foods.find(
    food => food.name === currentFood.value
  );

  if (!selectedFood) return;

  const similarFoods = foods.filter(food => {
    if (food.name === selectedFood.name) return false;

    const commonIngredients = food.ingredients.filter(ingredient =>
      selectedFood.ingredients.includes(ingredient)
    );

    return commonIngredients.length > 0;
  });

  results.innerHTML = "";

  similarFoods.forEach(food => {
    const card = document.createElement("div");
    card.className = "food-card";

    card.innerHTML = `
      <h3>${food.name}</h3>
      <p>🐾 ${food.animal === "dog" ? "犬用" : "猫用"}</p>
      <p>共通する原材料：${
        food.ingredients
          .filter(ingredient => selectedFood.ingredients.includes(ingredient))
          .join("・")
      }</p>
      <p>原材料：${food.ingredients.join("・")}</p>
      <p>メーカー：${food.maker || "未登録"}</p>
      <p><a href="${food.url}" target="_blank">公式サイトを見る</a></p>
    `;

    results.appendChild(card);
  });
});
foods.forEach(food => {
  const option = document.createElement("option");
  option.value = food.name;
  option.textContent = food.name;
  currentFood.appendChild(option);
});
const searchButton = document.getElementById("searchButton");
const results = document.getElementById("results");

const dogButton = document.getElementById("dogButton");
const catButton = document.getElementById("catButton");

let selectedAnimal = "dog";

dogButton.addEventListener("click", () => {
  selectedAnimal = "dog";
  dogButton.classList.add("animal-selected");
catButton.classList.remove("animal-selected");
});

catButton.addEventListener("click", () => {
  selectedAnimal = "cat";
  catButton.classList.add("animal-selected");
dogButton.classList.remove("animal-selected");
});
  

    // 検索ボタン
    searchButton.addEventListener("click", () => {

      const checked = document.querySelectorAll(
        'input[type="checkbox"]:checked'
      );

      const avoidedIngredients = Array.from(checked).map(
        checkbox => checkbox.value
      );

      const filteredFoods = foods.filter(food => {

        // 犬・猫を判定
        if (food.animal !== selectedAnimal) {
          return false;
        }

        // 避けたい原材料を除外
        return !food.ingredients.some(ingredient =>
          avoidedIngredients.includes(ingredient)
        );

      });

      results.innerHTML = "";

      filteredFoods.forEach(food => {

        const card = document.createElement("div");
        card.className = "food-card";

        card.innerHTML = `
          <h3>${food.name}</h3>
          <p>🐾 ${food.animal === "dog" ? "犬用" : "猫用"}</p>
          <p>原材料：${food.ingredients.join("・")}</p>
  
          <p>メーカー：${food.maker || ""}</p>
          ${
            food.url
              ? `<p><a href="${food.url}" target="_blank">商品ページを見る</a></p>`
              : ""
          }
        `;

        results.appendChild(card);

      });

    });

  });
