const searchSection = document.getElementById("searchSection");


// =====================================================
// 犬・猫のJSONを読み込む
// =====================================================

Promise.all([
  loadFoodJson("dog-food.json"),
  loadFoodJson("cat-food.json")
])

.then(([dogFoods, catFoods]) => {

  if (!Array.isArray(dogFoods)) {
    throw new Error("dog-food.jsonが配列になっていません");
  }

  if (!Array.isArray(catFoods)) {
    throw new Error("cat-food.jsonが配列になっていません");
  }


  // 犬＋猫
  const foods = [
    ...dogFoods,
    ...catFoods
  ];


  console.log(
    `犬 ${dogFoods.length}件 / 猫 ${catFoods.length}件`
  );


  // =====================================================
  // HTML要素
  // =====================================================

  const results =
    document.getElementById("results");

  const favoritesButton =
    document.getElementById("favoritesButton");

  const favoritesResults =
    document.getElementById("favoritesResults");

  const dogButton =
    document.getElementById("dogButton");

  const catButton =
    document.getElementById("catButton");

  const dogSizeFilter =
    document.getElementById("dogSizeFilter");

  const ingredientSearchButton =
    document.getElementById("ingredientSearchButton");

  const searchResults =
    document.getElementById("searchResults");

  const currentFoodSearch =
    document.getElementById("currentFoodSearch");

  const foodSuggestions =
    document.getElementById("foodSuggestions");


  // =====================================================
  // お気に入り
  // =====================================================

  let favorites = [];

  try {

    favorites = JSON.parse(
      localStorage.getItem("favorites") || "[]"
    );

    if (!Array.isArray(favorites)) {
      favorites = [];
    }

  } catch (error) {

    favorites = [];

  }


  function isFavorite(foodName) {

    return favorites.includes(foodName);

  }


  function toggleFavorite(foodName, button) {

    const index =
      favorites.indexOf(foodName);


    if (index === -1) {

      favorites.push(foodName);

      if (button) {
        button.textContent = "★";
      }

    } else {

      favorites.splice(index, 1);

      if (button) {
        button.textContent = "☆";
      }

    }


    localStorage.setItem(
      "favorites",
      JSON.stringify(favorites)
    );

  }


  // =====================================================
  // フードカード
  // =====================================================

  function createFoodCard(food) {

    const card =
      document.createElement("div");

    card.className = "food-card";


    const priceText =
      food.price !== undefined &&
      food.price !== null &&
      food.price !== "" &&
      !isNaN(Number(food.price))

        ? `¥${Number(food.price).toLocaleString()}${food.weight ? `（${food.weight}）` : ""}`

        : "不明";


    card.innerHTML = `

      <button
        class="favorite-button"
        type="button"
      >
        ${isFavorite(food.name) ? "★" : "☆"}
      </button>


      <h3>${escapeHtml(food.name || "商品名不明")}</h3>


      <p>
        🐾 ${food.animal === "dog" ? "犬用" : "猫用"}
      </p>


      ${
        food.age
          ? `<p>🎂 年齢：${escapeHtml(food.age)}</p>`
          : ""
      }


      ${
        food.animal === "dog" && food.sizeCategory
          ? `<p>📏 サイズ：${escapeHtml(food.sizeCategory)}</p>`
          : ""
      }


      <p>
        原材料：
        ${escapeHtml(food.actualIngredients || "未登録")}
      </p>


      <p>
        メーカー：
        ${escapeHtml(food.maker || "未登録")}
      </p>


      <p>
        🟤 粒の大きさ：
        ${escapeHtml(food.size || "不明")}
      </p>


      <p>
        💰 参考価格：
        ${priceText}
      </p>


      ${
        food.url
          ? `
            <p>
              <a
                href="${escapeAttribute(food.url)}"
                target="_blank"
                rel="noopener noreferrer"
              >
                公式サイトを見る
              </a>
            </p>
          `
          : ""
      }

    `;


    const favoriteButton =
      card.querySelector(".favorite-button");


    favoriteButton.addEventListener(
      "click",
      () => {

        toggleFavorite(
          food.name,
          favoriteButton
        );

      }
    );


    return card;

  }


  // =====================================================
  // HTMLエスケープ
  // =====================================================

  function escapeHtml(value) {

    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  }


  function escapeAttribute(value) {

    return escapeHtml(value);

  }


  // =====================================================
  // 犬・猫切り替え
  // =====================================================

  let selectedAnimal = "dog";


  if (dogButton && catButton) {

    dogButton.classList.add(
      "animal-selected"
    );


    if (dogSizeFilter) {
      dogSizeFilter.style.display = "block";
    }


    dogButton.addEventListener(
      "click",
      () => {

        selectedAnimal = "dog";


        dogButton.classList.add(
          "animal-selected"
        );


        catButton.classList.remove(
          "animal-selected"
        );


        if (dogSizeFilter) {
          dogSizeFilter.style.display = "block";
        }


        runSearch();

      }
    );


    catButton.addEventListener(
      "click",
      () => {

        selectedAnimal = "cat";


        catButton.classList.add(
          "animal-selected"
        );


        dogButton.classList.remove(
          "animal-selected"
        );


        if (dogSizeFilter) {
          dogSizeFilter.style.display = "none";
        }


        document
          .querySelectorAll('input[name="size"]')
          .forEach(checkbox => {

            checkbox.checked = false;

          });


        runSearch();

      }
    );

  }


  // =====================================================
  // 通常検索ボタン
  // =====================================================

  if (ingredientSearchButton) {

    ingredientSearchButton.addEventListener(
      "click",
      runSearch
    );

  }


  // =====================================================
  // 通常検索
  // =====================================================

  function runSearch() {

    const ingredientCheckboxes =
      document.querySelectorAll(
        '.ingredient-category input[type="checkbox"]:checked'
      );


    const avoidedIngredients =
      Array.from(
        ingredientCheckboxes
      ).map(
        checkbox => checkbox.value
      );


    // ===================================================
    // 年齢
    // ===================================================

    const ageCheckboxes =
      document.querySelectorAll(
        'input[name="age"]:checked'
      );


    const selectedAges =
      Array.from(
        ageCheckboxes
      ).map(
        checkbox => checkbox.value
      );


    // ===================================================
    // 犬サイズ
    // ===================================================

    const sizeCheckboxes =
      document.querySelectorAll(
        'input[name="size"]:checked'
      );


    const selectedSizes =
      Array.from(
        sizeCheckboxes
      ).map(
        checkbox => checkbox.value
      );


    // ===================================================
    // 絞り込み
    // ===================================================

    const filteredFoods =
      foods.filter(food => {

        if (
          food.animal !== selectedAnimal
        ) {

          return false;

        }


        // ------------------------------------------------
        // 避けたい原材料
        // 検索用に統一した ingredients を使用
        // ------------------------------------------------

        const ingredients =
          Array.isArray(food.ingredients)
            ? food.ingredients
            : [];


        const hasAvoidedIngredient =
  ingredients.some(ingredient => {

    // 「鶏肉」だけは完全一致
    if (avoidedIngredients.includes("鶏肉")) {
      if (ingredient === "鶏肉") {
        return true;
      }
    }

    // その他は今まで通り
    return avoidedIngredients.includes(ingredient);

  });


        if (hasAvoidedIngredient) {

          return false;

        }


        // ------------------------------------------------
        // 年齢
        // ------------------------------------------------

        if (
          selectedAges.length > 0
        ) {

          const ageMatch =
            selectedAges.includes(food.age) ||
            food.age === "全年齢";


          if (!ageMatch) {

            return false;

          }

        }


        // ------------------------------------------------
        // 犬サイズ
        // ------------------------------------------------

        if (
          selectedAnimal === "dog" &&
          selectedSizes.length > 0
        ) {

          const sizeMatch =
            selectedSizes.includes(
              food.sizeCategory
            ) ||
            food.sizeCategory === "全犬種";


          if (!sizeMatch) {

            return false;

          }

        }


        return true;

      });


    // ===================================================
    // 結果表示
    // ===================================================

    if (!searchResults) {

      return;

    }


    searchResults.innerHTML = "";


    const title =
      document.createElement("h2");


    title.textContent =
      `検索結果（${filteredFoods.length}件）`;


    searchResults.appendChild(
      title
    );


    if (
      filteredFoods.length === 0
    ) {

      searchResults.innerHTML +=
        "<p>条件に合うフードがありません。</p>";

      return;

    }


    filteredFoods.forEach(
      food => {

        searchResults.appendChild(
          createFoodCard(food)
        );

      }
    );

  }


  // =====================================================
  // 今食べているフード
  // =====================================================

  let currentFoodAnimal = "dog";


  let currentDogButton =
    document.getElementById(
      "currentDogButton"
    );


  let currentCatButton =
    document.getElementById(
      "currentCatButton"
    );


  // =====================================================
  // ボタンがなければ作成
  // =====================================================

  if (
    currentFoodSearch &&
    (
      !currentDogButton ||
      !currentCatButton
    )
  ) {

    const switchArea =
      document.createElement("div");


    switchArea.className =
      "current-food-animal-switch";


    switchArea.innerHTML = `

      <button
        type="button"
        id="currentDogButton"
      >
        🐶 犬用
      </button>


      <button
        type="button"
        id="currentCatButton"
      >
        🐱 猫用
      </button>

    `;


    currentFoodSearch.parentElement.insertBefore(
      switchArea,
      currentFoodSearch
    );


    currentDogButton =
      document.getElementById(
        "currentDogButton"
      );


    currentCatButton =
      document.getElementById(
        "currentCatButton"
      );

  }


  // =====================================================
  // 今食べているフード 犬・猫切り替え
  // =====================================================

  if (
    currentDogButton &&
    currentCatButton
  ) {

    currentDogButton.classList.add(
      "animal-selected"
    );


    currentDogButton.addEventListener(
      "click",
      () => {

        currentFoodAnimal = "dog";


        currentDogButton.classList.add(
          "animal-selected"
        );


        currentCatButton.classList.remove(
          "animal-selected"
        );


        if (currentFoodSearch) {

          currentFoodSearch.value = "";

        }


        if (foodSuggestions) {

          foodSuggestions.innerHTML = "";

        }


        if (results) {

          results.innerHTML = "";

        }

      }
    );


    currentCatButton.addEventListener(
      "click",
      () => {

        currentFoodAnimal = "cat";


        currentCatButton.classList.add(
          "animal-selected"
        );


        currentDogButton.classList.remove(
          "animal-selected"
        );


        if (currentFoodSearch) {

          currentFoodSearch.value = "";

        }


        if (foodSuggestions) {

          foodSuggestions.innerHTML = "";

        }


        if (results) {

          results.innerHTML = "";

        }

      }
    );

  }


  // =====================================================
  // 比較用の原材料を取得
  // ingredients = 検索用に統一した原材料
  // =====================================================

  function getSearchIngredients(food) {

    if (!food) {
      return [];
    }

    let ingredients = food.ingredients;

    // 配列の場合
    if (Array.isArray(ingredients)) {

      return ingredients
        .map(ingredient => String(ingredient).trim())
        .filter(ingredient => ingredient !== "");

    }

    // 文字列の場合にも対応
    if (typeof ingredients === "string") {

      return ingredients
        .split(/[、，,]/)
        .map(ingredient => ingredient.trim())
        .filter(ingredient => ingredient !== "");

    }

    return [];

  }


  // =====================================================
  // 今食べているフード検索
  // =====================================================

  if (currentFoodSearch) {

    currentFoodSearch.addEventListener(
      "input",
      () => {

        const keyword =
          currentFoodSearch.value
            .trim()
            .toLowerCase();

        if (foodSuggestions) {
          foodSuggestions.innerHTML = "";
        }

        if (!keyword) {
          return;
        }

        const suggestions =
          foods.filter(food => {

            if (
              food.animal !== currentFoodAnimal
            ) {
              return false;
            }

            const name =
              String(food.name || "")
                .toLowerCase();

            return name.includes(keyword);

          });

        if (suggestions.length === 0) {

          if (foodSuggestions) {
            foodSuggestions.innerHTML =
              "<p>該当するフードがありません。</p>";
          }

          return;

        }

        suggestions.forEach(food => {

          const button =
            document.createElement("button");

          button.type = "button";

          button.className =
            "food-suggestion";

          button.textContent =
            food.name;

          button.addEventListener(
            "click",
            () => {

              currentFoodSearch.value =
                food.name;

              if (foodSuggestions) {
                foodSuggestions.innerHTML = "";
              }

              showSimilarFoods(food);

            }
          );

          if (foodSuggestions) {
            foodSuggestions.appendChild(button);
          }

        });

      }
    );

  }


  // =====================================================
  // 似ているフード検索
  // =====================================================

  function showSimilarFoods(selectedFood) {

    // 選択したフードの「検索用原材料」
    const selectedIngredients =
      getSearchIngredients(selectedFood);


    console.log(
      "比較元:",
      selectedFood.name,
      selectedIngredients
    );


    // ---------------------------------------------------
    // 共通原材料を調べる
    // ---------------------------------------------------

    const similarFoods =
      foods
        .filter(food => {

          // 自分自身は除外
          if (
            food.name === selectedFood.name
          ) {
            return false;
          }

          // 犬・猫をまたがない
          if (
            food.animal !== selectedFood.animal
          ) {
            return false;
          }

          const foodIngredients =
            getSearchIngredients(food);


          const commonIngredients =
            foodIngredients.filter(
              ingredient =>
                selectedIngredients.includes(
                  ingredient
                )
            );


          return commonIngredients.length > 0;

        })


        .map(food => {

          const foodIngredients =
            getSearchIngredients(food);


          const commonIngredients =
            foodIngredients.filter(
              ingredient =>
                selectedIngredients.includes(
                  ingredient
                )
            );


          let score =
            commonIngredients.length * 10;


          // 年齢
          if (
            selectedFood.age &&
            food.age &&
            selectedFood.age === food.age
          ) {
            score += 5;
          }


          // 全年齢
          if (
            food.age === "全年齢"
          ) {
            score += 2;
          }


          // 犬サイズ
          if (
            selectedFood.animal === "dog"
          ) {

            if (
              selectedFood.sizeCategory &&
              food.sizeCategory &&
              selectedFood.sizeCategory ===
                food.sizeCategory
            ) {
              score += 5;
            }

            if (
              food.sizeCategory === "全犬種"
            ) {
              score += 2;
            }

          }


          return {
            food,
            commonIngredients,
            score
          };

        })


        .sort(
          (a, b) =>
            b.score - a.score
        );


    // ===================================================
    // 結果表示
    // ===================================================

    if (!results) {

      console.error(
        "結果表示用の #results がHTMLにありません"
      );

      return;

    }


    results.innerHTML = "";


    const title =
      document.createElement("h2");

    title.textContent =
      "似ているフード";

    results.appendChild(title);


    // ---------------------------------------------------
    // 共通原材料がない場合
    // ---------------------------------------------------

    if (
      similarFoods.length === 0
    ) {

      const message =
        document.createElement("p");

      message.textContent =
        selectedIngredients.length === 0
          ? "このフードには比較用の原材料が登録されていません。"
          : "共通する原材料を持つフードがありません。";

      results.appendChild(message);

      return;

    }


    // ---------------------------------------------------
    // 結果表示
    // ---------------------------------------------------

    similarFoods.forEach(item => {

      const food =
        item.food;


      const card =
        createFoodCard(food);


      const common =
        document.createElement("p");


      common.innerHTML = `
        🔗 共通する原材料：
        ${item.commonIngredients
          .map(escapeHtml)
          .join("・")}
      `;


      const foodName =
        card.querySelector("h3");


      if (foodName) {
        foodName.after(common);
      }


      results.appendChild(card);

    });

  }
  // =====================================================
  // お気に入り
  // =====================================================

  if (favoritesButton) {

    favoritesButton.addEventListener(
      "click",
      () => {

        if (
          searchSection &&
          searchSection.style.display ===
            "none"
        ) {

          searchSection.style.display =
            "block";


          if (favoritesResults) {

            favoritesResults.style.display =
              "none";

          }


          return;

        }


        if (searchSection) {

          searchSection.style.display =
            "none";

        }


        if (favoritesResults) {

          favoritesResults.style.display =
            "block";


          favoritesResults.innerHTML =
            "";


          const title =
            document.createElement(
              "h2"
            );


          title.textContent =
            "お気に入り";


          favoritesResults.appendChild(
            title
          );


          const favoriteFoods =
            foods.filter(food =>
              favorites.includes(
                food.name
              )
            );


          if (
            favoriteFoods.length === 0
          ) {

            favoritesResults.innerHTML +=
              "<p>お気に入りはまだありません。</p>";

            return;

          }


          favoriteFoods.forEach(
            food => {

              const card =
                createFoodCard(
                  food
                );


              const button =
                card.querySelector(
                  ".favorite-button"
                );


              if (button) {

                button.addEventListener(
                  "click",
                  () => {

                    if (
                      !isFavorite(
                        food.name
                      )
                    ) {

                      card.remove();

                    }

                  }
                );

              }


              favoritesResults.appendChild(
                card
              );

            }
          );

        }

      }
    );

  }


  // =====================================================
  // 初期状態
  // =====================================================

  if (dogSizeFilter) {

    dogSizeFilter.style.display =
      "block";

  }

})


// =====================================================
// JSON読み込みエラー
// =====================================================

.catch(error => {

  console.error(
    "フードデータ読み込みエラー:",
    error
  );


  alert(
    "フードデータを読み込めませんでした。\n\n" +
    error.message
  );

});


// =====================================================
// JSON読み込み関数
// =====================================================

async function loadFoodJson(fileName) {

  const response =
    await fetch(fileName);


  if (!response.ok) {

    throw new Error(
      `${fileName}を読み込めませんでした（HTTP ${response.status}）`
    );

  }


  const text =
    await response.text();


  if (!text.trim()) {

    throw new Error(
      `${fileName}が空です`
    );

  }


  try {

    return JSON.parse(text);

  } catch (error) {

    console.error(
      `${fileName}の内容:`,
      text
    );


    throw new Error(
      `${fileName}のJSON形式が壊れています。`
    );

  }

}
