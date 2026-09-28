const searchSection = document.getElementById("searchSection");

fetch("foods.json")
  .then(response => response.json())
  .then(foods => {

    const currentFood = document.getElementById("currentFood");
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
            原材料：${food.ingredients.join("・")}
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
    // フード選択欄
    // =========================

    foods.forEach(food => {

      const option = document.createElement("option");

      option.value = food.name;
      option.textContent = food.name;

      currentFood.appendChild(option);
    });


    // =========================
    // フードを選択したとき
    // =========================

    currentFood.addEventListener("change", () => {

      const selectedFood = foods.find(
        food => food.name === currentFood.value
      );

      if (!selectedFood) return;

      const similarFoods = foods.filter(food => {

        if (food.name === selectedFood.name) {
          return false;
        }

        const commonIngredients =
          food.ingredients.filter(
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
        });

        results.appendChild(card);
      });
    });


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
            原材料：${food.ingredients.join("・")}
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
