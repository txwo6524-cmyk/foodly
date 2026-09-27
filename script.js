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
        const item = document.createElement("p");
        item.textContent = food.name;
        results.appendChild(item);
      });

    });

  });
