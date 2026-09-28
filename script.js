fetch("foods.json")
  .then(response => response.json())
  .then(foods => {

    const currentFood = document.getElementById("currentFood");
    const results = document.getElementById("results");
const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
const favoritesButton = document.getElementById("favoritesButton");
const favoritesResults = document.getElementById("favoritesResults");

favoritesButton.addEventListener("click", () => {
  favoritesResults.innerHTML = "";

  const title = document.createElement("h2");
  title.textContent = "お気に入り";
  favoritesResults.appendChild(title);

  const favoriteFoods = foods.filter(food =>
    favorites.includes(food.name)
  );

  if (favoriteFoods.length === 0) {
    favoritesResults.innerHTML += "<p>お気に入りはまだありません。</p>";
    return;
  }

  favoriteFoods.forEach(food => {
    const card = document.createElement("div");
    card.className = "food-card";

    card.innerHTML = `
      <h3>${food.name}</h3>
      <p>🐾 ${food.animal === "dog" ? "犬用" : "猫用"}</p>
      <p>原材料：${food.ingredients.join("・")}</p>
      <p>メーカー：${food.maker || "未登録"}</p>
      <p>🟤 粒の大きさ：${food.size || "不明"}</p>
      <p>
        💰 参考価格：${
          food.price
            ? `¥${food.price.toLocaleString()}（${food.weight || ""}）`
            : "未登録"
        }
      </p>
      ${
        food.url
          ? `<p><a href="${food.url}" target="_blank">公式サイトを見る</a></p>`
          : ""
      }
    `;

    favoritesResults.appendChild(card);
  });
});
function isFavorite(foodName) {
  return favorites.includes(foodName);
}

function toggleFavorite(foodName, button) {
  const index = favorites.indexOf(foodName);

  if (index === -1) {
    favorites.push(foodName);
    button.textContent = "⭐";
  } else {
    favorites.splice(index, 1);
    button.textContent = "☆";
  }

  localStorage.setItem("favorites", JSON.stringify(favorites));
}
    // フード選択欄にフード名を入れる
    foods.forEach(food => {
      const option = document.createElement("option");

      option.value = food.name;
      option.textContent = food.name;

      currentFood.appendChild(option);
    });


    // フードを選択したとき
    currentFood.addEventListener("change", () => {

      const selectedFood = foods.find(
        food => food.name === currentFood.value
      );

      if (!selectedFood) return;

      const similarFoods = foods.filter(food => {

        if (food.name === selectedFood.name) {
          return false;
        }

        const commonIngredients = food.ingredients.filter(
          ingredient =>
            selectedFood.ingredients.includes(ingredient)
        );

        return commonIngredients.length > 0;
      });

      results.innerHTML = "";

      const title = document.createElement("h2");
      title.textContent = "似ているフード";
      results.appendChild(title);

      similarFoods.forEach(food => {

        const card = document.createElement("div");
        card.className = "food-card";

        card.innerHTML = `
        <button class="favorite-button" data-food="${food.name}">
  ${isFavorite(food.name) ? "★" : "☆"}
</button>
          <h3>${food.name}</h3>

          <p>
            🐾 ${food.animal === "dog" ? "犬用" : "猫用"}
          </p>

          <p>
            共通する原材料：
            ${
              food.ingredients
                .filter(ingredient =>
                  selectedFood.ingredients.includes(ingredient)
                )
                .join("・")
            }
          </p>

          <p>
            原材料：${food.ingredients.join("・")}
          </p>

          <p>
            メーカー：${food.maker || "未登録"}
          </p>
      <p>
  🟤 粒の大きさ：${food.size || "不明"}
</p>    
<p>
  💰 参考価格：${
    food.price ? `¥${food.price.toLocaleString()}（${food.weight || ""}）` : "未登録"
  }
</p>
          ${
            food.url
              ? `<p><a href="${food.url}" target="_blank">公式サイトを見る</a></p>`
              : ""
          }
        `;
const favoriteButton = card.querySelector(".favorite-button");

favoriteButton.addEventListener("click", () => {
  toggleFavorite(food.name, favoriteButton);
});
        results.appendChild(card);
      });
    });


    // 犬・猫ボタン
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
    const ingredientSearchButton = document.getElementById("ingredientSearchButton");
    const searchResults = document.getElementById("searchResults");

  ingredientSearchButton.addEventListener("click", () => {

      const checked = document.querySelectorAll(
        'input[type="checkbox"]:checked'
      );

      const avoidedIngredients = Array.from(checked).map(
        checkbox => checkbox.value
      );

      searchResults.innerHTML = "";

      const title = document.createElement("h2");
      title.textContent = "検索結果";
      searchResults.appendChild(title);

      const filteredFoods = foods.filter(food => {

        if (food.animal !== selectedAnimal) {
          return false;
        }

        return !food.ingredients.some(
          ingredient =>
            avoidedIngredients.includes(ingredient)
        );
      });

      filteredFoods.forEach(food => {

        const card = document.createElement("div");
        card.className = "food-card";

        card.innerHTML = `
        <button class="favorite-button" data-food="${food.name}">
  ${isFavorite(food.name) ? "★" : "☆"}
</button>
          <h3>${food.name}</h3>

          <p>
            🐾 ${food.animal === "dog" ? "犬用" : "猫用"}
          </p>

          <p>
            原材料：${food.ingredients.join("・")}
          </p>

          <p>
            メーカー：${food.maker || ""}
          </p>
     <p>
  🟤 粒の大きさ：${food.size || "不明"}
</p>     
<p>
  💰 参考価格：${
    food.price ? `¥${food.price.toLocaleString()}（${food.weight || ""}）` : "未登録"
  }
</p>
          ${
            food.url
              ? `<p><a href="${food.url}" target="_blank">公式サイトを見る</a></p>`
              : ""
          }
        `;
const favoriteButton = card.querySelector(".favorite-button");

favoriteButton.addEventListener("click", () => {
  toggleFavorite(food.name, favoriteButton);
});
        searchResults.appendChild(card);
      });
    });

  });
