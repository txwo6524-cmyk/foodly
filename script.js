fetch("foods.json")
  .then(response => response.json())
  .then(foods => {

    const buttons = document.querySelectorAll("body > button");
    const searchButton = document.getElementById("searchButton");
    const results = document.getElementById("results");

    let selectedAnimal = "dog";

    // 犬ボタン
    buttons[0].addEventListener("click", () => {
      selectedAnimal = "dog";
    });

    // 猫ボタン
    buttons[1].addEventListener("click", () => {
      selectedAnimal = "cat";
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
