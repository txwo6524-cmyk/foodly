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
        `;

        results.appendChild(card);
      });

    });

  });
