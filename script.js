const searchSection = document.getElementById("searchSection");

Promise.all([
  fetch("dog-food.json").then(response => response.json()),
  fetch("cat-food.json").then(response => response.json())
])
  .then(([dogFoods, catFoods]) => {

    const foods = [...dogFoods, ...catFoods];

    
    const results = document.getElementById("results");

    const favorites = JSON.parse(
      localStorage.getItem("favorites") || "[]"
    );

    const favoritesButton =
      document.getElementById("favoritesButton");

    const favoritesResults =
      document.getElementById("favoritesResults");

    // =========================
    // お気に入り
    // =========================

    favoritesButton.addEventListener("click", () => {

      if (searchSection.style.display === "none") {
        searchSection.style.display = "block";
        favoritesResults.style.display = "none";
        return;
      }

      searchSection.style.display = "none";
      favoritesResults.style.display = "block";

      favoritesResults.innerHTML = "";

      const title = document.createElement("h2");
      title.textContent = "お気に入り";
      favoritesResults.appendChild(title);

      const favoriteFoods = foods.filter(food =>
        favorites.includes(food.name)
      );

      if (favoriteFoods.length === 0) {
        favoritesResults.innerHTML +=
          "<p>お気に入りはまだありません。</p>";
        return;
      }

      favoriteFoods.forEach(food => {

        const card = document.createElement("div");
        card.className = "food-card";

        card.innerHTML = `
          <button class="favorite-button" data-food="${food.name}">
            ★
          </button>

          <h3>${food.name}</h3>

          <p>
            🐾 ${food.animal === "dog" ? "犬用" : "猫用"}
          </p>

          <p>
  原材料：${food.actualIngredients || "未登録"}
</p>

          <p>
            メーカー：${food.maker || "未登録"}
          </p>

          <p>
            🟤 粒の大きさ：${food.size || "不明"}
          </p>

          <p>
            💰 参考価格：
            ${
              food.price
                ? `¥${food.price.toLocaleString()}（${food.weight || ""}）`
                : "未登録"
            }
          </p>

          ${
            food.url
              ? `<p>
                  <a href="${food.url}" target="_blank">
                    公式サイトを見る
                  </a>
                </p>`
              : ""
          }
        `;

        const favoriteButton =
          card.querySelector(".favorite-button");

        favoriteButton.addEventListener("click", () => {
          toggleFavorite(food.name, favoriteButton);
          card.remove();
        });

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
        button.textContent = "★";
      } else {
        favorites.splice(index, 1);
        button.textContent = "☆";
      }

      localStorage.setItem(
        "favorites",
        JSON.stringify(favorites)
      );
    }


// =========================
// 今食べているフード検索
// =========================

const currentFoodSearch =
  document.getElementById("currentFoodSearch");

const foodSuggestions =
  document.getElementById("foodSuggestions");

let selectedCurrentFood = null;


// 入力した文字から候補を表示
currentFoodSearch.addEventListener("input", () => {

  const keyword =
    currentFoodSearch.value.trim().toLowerCase();

  foodSuggestions.innerHTML = "";
  selectedCurrentFood = null;

  if (!keyword) {
    return;
  }

  const suggestions = foods.filter(food =>
    food.name.toLowerCase().includes(keyword)
  );


  if (suggestions.length === 0) {

    foodSuggestions.innerHTML =
      "<p>該当するフードがありません。</p>";

    return;
  }


  suggestions.forEach(food => {

    const button = document.createElement("button");

    button.type = "button";
    button.className = "food-suggestion";

    button.textContent = food.name;

    button.addEventListener("click", () => {

      selectedCurrentFood = food;

      currentFoodSearch.value = food.name;

      foodSuggestions.innerHTML = "";

      showSimilarFoods(food);
    });

    foodSuggestions.appendChild(button);
  });

});

// =========================
// フードを選択したとき
// =========================
    function showSimilarFoods(selectedFood) {

  // =========================
  // 似ているフードを計算
  // =========================

  const similarFoods = foods
    .filter(food => {

      // 自分自身は除外
      function showSimilarFoods(selectedFood) {

  const similarFoods = foods
    .filter(food => {

      // 自分自身は除外
      if (food.name === selectedFood.name) {
        return false;
      }

      // 犬・猫をまたがない
      if (food.animal !== selectedFood.animal) {
        return false;
      }

      // 実際の原材料を分割
      const selectedActualIngredients =
        selectedFood.actualIngredients
          ? selectedFood.actualIngredients
              .split("、")
              .map(i => i.trim())
          : [];

      const foodActualIngredients =
        food.actualIngredients
          ? food.actualIngredients
              .split("、")
              .map(i => i.trim())
          : [];

      // 実際の原材料で共通点を探す
      const commonIngredients =
        foodActualIngredients.filter(ingredient =>
          selectedActualIngredients.includes(ingredient)
        );

      // 共通原材料がなければ除外
      return commonIngredients.length > 0;

    })

    .map(food => {

      const selectedActualIngredients =
        selectedFood.actualIngredients
          ? selectedFood.actualIngredients
              .split("、")
              .map(i => i.trim())
          : [];

      const foodActualIngredients =
        food.actualIngredients
          ? food.actualIngredients
              .split("、")
              .map(i => i.trim())
          : [];

      const commonIngredients =
        foodActualIngredients.filter(ingredient =>
          selectedActualIngredients.includes(ingredient)
        );

      // 似ている度
      let score = commonIngredients.length * 10;

      // 年齢が同じなら加点
      if (
        selectedFood.age &&
        food.age &&
        food.age === selectedFood.age
      ) {
        score += 5;
      }

      // 全年齢なら少し加点
      if (food.age === "全年齢") {
        score += 2;
      }

      // 犬の場合はサイズも比較
      if (selectedFood.animal === "dog") {

        if (
          selectedFood.sizeCategory &&
          food.sizeCategory &&
          selectedFood.sizeCategory === food.sizeCategory
        ) {
          score += 5;
        }

        if (food.sizeCategory === "全犬種") {
          score += 2;
        }
      }

      return {
        food,
        commonIngredients,
        score
      };

    })

    // 似ている度の高い順
    .sort((a, b) => b.score - a.score);


  // =========================
  // 結果表示
  // =========================

  results.innerHTML = "";

  const title = document.createElement("h2");
  title.textContent = "似ているフード";

  results.appendChild(title);


  if (similarFoods.length === 0) {

    results.innerHTML +=
      "<p>共通する原材料を持つフードがありません。</p>";

    return;
  }


  similarFoods.forEach(item => {

    const food = item.food;

    const card = document.createElement("div");
    card.className = "food-card";

    card.innerHTML = `

      <button
        class="favorite-button"
        data-food="${food.name}"
      >
        ${isFavorite(food.name) ? "★" : "☆"}
      </button>

      <h3>${food.name}</h3>

      <p>
        🐾 ${food.animal === "dog" ? "犬用" : "猫用"}
      </p>

      ${
        food.age
          ? `<p>🎂 年齢：${food.age}</p>`
          : ""
      }

      ${
        food.animal === "dog" && food.sizeCategory
          ? `<p>📏 サイズ：${food.sizeCategory}</p>`
          : ""
      }

      <p>
        🔗 共通する原材料：
        ${item.commonIngredients.join("・")}
      </p>

      <p>
  原材料：${food.actualIngredients || "未登録"}
</p>

      <p>
        メーカー：${food.maker || "未登録"}
      </p>

      <p>
        🟤 粒の大きさ：${food.size || "不明"}
      </p>

      <p>
        💰 参考価格：
        ${
          food.price
            ? `¥${food.price.toLocaleString()}（${food.weight || ""}）`
            : "未登録"
        }
      </p>

      ${
        food.url
          ? `<p>
              <a href="${food.url}" target="_blank">
                公式サイトを見る
              </a>
            </p>`
          : ""
      }
    `;


    const favoriteButton =
      card.querySelector(".favorite-button");

    favoriteButton.addEventListener("click", () => {

      toggleFavorite(
        food.name,
        favoriteButton
      );

    });


    results.appendChild(card);
  });
    }


    // =========================
    // 犬・猫
    // =========================

    const dogButton =
      document.getElementById("dogButton");

    const catButton =
      document.getElementById("catButton");

    const dogSizeFilter =
      document.getElementById("dogSizeFilter");

    let selectedAnimal = "dog";


    dogButton.classList.add("animal-selected");


    dogButton.addEventListener("click", () => {

      selectedAnimal = "dog";

      dogButton.classList.add("animal-selected");
      catButton.classList.remove("animal-selected");

      // 犬なのでサイズ表示
      dogSizeFilter.style.display = "block";

      // 絞り込み結果を更新
      runSearch();
    });


    catButton.addEventListener("click", () => {

      selectedAnimal = "cat";

      catButton.classList.add("animal-selected");
      dogButton.classList.remove("animal-selected");

      // 猫なのでサイズ非表示
      dogSizeFilter.style.display = "none";

      // 犬のサイズチェックを解除
      document
        .querySelectorAll('input[name="size"]')
        .forEach(checkbox => {
          checkbox.checked = false;
        });

      // 絞り込み結果を更新
      runSearch();
    });


    // =========================
    // 検索
    // =========================

    const ingredientSearchButton =
      document.getElementById("ingredientSearchButton");

    const searchResults =
      document.getElementById("searchResults");


    ingredientSearchButton.addEventListener(
      "click",
      runSearch
    );


    function runSearch() {

      // -------------------------
      // 避けたい原材料
      // -------------------------

      const ingredientCheckboxes =
        document.querySelectorAll(
          '.ingredient-category input[type="checkbox"]:checked'
        );

      const avoidedIngredients =
        Array.from(ingredientCheckboxes).map(
          checkbox => checkbox.value
        );


      // -------------------------
      // 年齢
      // -------------------------

      const ageCheckboxes =
        document.querySelectorAll(
          'input[name="age"]:checked'
        );

      const selectedAges =
        Array.from(ageCheckboxes).map(
          checkbox => checkbox.value
        );


      // -------------------------
      // サイズ
      // -------------------------

      const sizeCheckboxes =
        document.querySelectorAll(
          'input[name="size"]:checked'
        );

      const selectedSizes =
        Array.from(sizeCheckboxes).map(
          checkbox => checkbox.value
        );


      // -------------------------
      // 検索
      // -------------------------

      const filteredFoods = foods.filter(food => {

        // 犬・猫
        if (food.animal !== selectedAnimal) {
          return false;
        }


        // 避けたい原材料
        const hasAvoidedIngredient =
          food.ingredients.some(
            ingredient =>
              avoidedIngredients.includes(ingredient)
          );

        if (hasAvoidedIngredient) {
          return false;
        }


        // =========================
        // 年齢
        // =========================

        if (selectedAges.length > 0) {

          const ageMatch =
            selectedAges.includes(food.age) ||
            food.age === "全年齢";

          if (!ageMatch) {
            return false;
          }
        }


        // =========================
        // サイズ（犬だけ）
        // =========================

        if (
          selectedAnimal === "dog" &&
          selectedSizes.length > 0
        ) {

          const sizeMatch =
            selectedSizes.includes(food.sizeCategory) ||
            food.sizeCategory === "全犬種";

          if (!sizeMatch) {
            return false;
          }
        }


        return true;
      });


      // =========================
      // 結果表示
      // =========================

      searchResults.innerHTML = "";

      const title = document.createElement("h2");

      title.textContent =
        `検索結果（${filteredFoods.length}件）`;

      searchResults.appendChild(title);


      if (filteredFoods.length === 0) {

        searchResults.innerHTML +=
          "<p>条件に合うフードがありません。</p>";

        return;
      }


      filteredFoods.forEach(food => {

        const card = document.createElement("div");

        card.className = "food-card";

        card.innerHTML = `
          <button
            class="favorite-button"
            data-food="${food.name}"
          >
            ${isFavorite(food.name) ? "★" : "☆"}
          </button>

          <h3>${food.name}</h3>

          <p>
            🐾 ${food.animal === "dog" ? "犬用" : "猫用"}
          </p>

          <p>
  原材料：${food.actualIngredients || "未登録"}
</p>

          <p>
            メーカー：${food.maker || "未登録"}
          </p>

          <p>
            🟤 粒の大きさ：${food.size || "不明"}
          </p>

          <p>
            💰 参考価格：
            ${
              food.price
                ? `¥${food.price.toLocaleString()}（${food.weight || ""}）`
                : "未登録"
            }
          </p>

          ${
            food.url
              ? `<p>
                  <a href="${food.url}" target="_blank">
                    公式サイトを見る
                  </a>
                </p>`
              : ""
          }
        `;


        const favoriteButton =
          card.querySelector(".favorite-button");

        favoriteButton.addEventListener("click", () => {

          toggleFavorite(
            food.name,
            favoriteButton
          );

        });


        searchResults.appendChild(card);
      });
    }


    // =========================
    // 初期状態
    // =========================

    dogSizeFilter.style.display = "block";

  });
