const searchSection = document.getElementById("searchSection");


// =====================================================
// 犬・猫のJSONを読み込む
// =====================================================

Promise.all([
  fetch("dog-food.json").then(response => {
    if (!response.ok) {
      throw new Error("dog-food.jsonを読み込めません");
    }
    return response.json();
  }),

  fetch("cat-food.json").then(response => {
    if (!response.ok) {
      throw new Error("cat-food.jsonを読み込めません");
    }
    return response.json();
  })
])

.then(([dogFoods, catFoods]) => {

  // 犬＋猫を1つにまとめる
  const foods = [
    ...dogFoods,
    ...catFoods
  ];


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

  let favorites = JSON.parse(
    localStorage.getItem("favorites") || "[]"
  );


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


    card.innerHTML = `

      <button
        class="favorite-button"
        type="button"
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
        原材料：
        ${food.actualIngredients || "未登録"}
      </p>

      <p>
        メーカー：
        ${food.maker || "未登録"}
      </p>

      <p>
        🟤 粒の大きさ：
        ${food.size || "不明"}
      </p>

      <p>
        💰 参考価格：
        ${
          food.price
            ? `¥${Number(food.price).toLocaleString()}（${food.weight || ""}）`
            : "未登録"
        }
      </p>

      ${
        food.url
          ? `
            <p>
              <a
                href="${food.url}"
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
  // 通常の犬・猫切り替え
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


        // 犬サイズのチェックを解除
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
  // 通常検索
  // =====================================================

  if (ingredientSearchButton) {

    ingredientSearchButton.addEventListener(
      "click",
      runSearch
    );

  }


  function runSearch() {

    // ---------------------------------------------------
    // 避けたい原材料
    // ---------------------------------------------------

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


    // ---------------------------------------------------
    // 年齢
    // ---------------------------------------------------

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


    // ---------------------------------------------------
    // サイズ
    // ---------------------------------------------------

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


    // ---------------------------------------------------
    // フードを絞り込む
    // ---------------------------------------------------

    const filteredFoods =
      foods.filter(food => {

        // 犬・猫
        if (
          food.animal !== selectedAnimal
        ) {
          return false;
        }


        // ------------------------------------------------
        // 避けたい原材料
        // ------------------------------------------------

        const hasAvoidedIngredient =
          (food.ingredients || []).some(
            ingredient =>
              avoidedIngredients.includes(
                ingredient
              )
          );


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
            selectedAges.includes(
              food.age
            ) ||
            food.age === "全年齢";


          if (!ageMatch) {
            return false;
          }

        }


        // ------------------------------------------------
        // 犬のサイズ
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


    filteredFoods.forEach(food => {

      searchResults.appendChild(
        createFoodCard(food)
      );

    });

  }


  // =====================================================
  // 今食べているフード
  // =====================================================

  let currentFoodAnimal = "dog";


  // -----------------------------------------------------
  // 犬・猫ボタンを取得
  // -----------------------------------------------------

  let currentDogButton =
    document.getElementById(
      "currentDogButton"
    );

  let currentCatButton =
    document.getElementById(
      "currentCatButton"
    );


  // =====================================================
  // ボタンがHTMLに存在しない場合は自動作成
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


        // 検索欄リセット
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


        // 検索欄リセット
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
  // 実際の原材料を分割
  // =====================================================

  function getActualIngredients(food) {

    if (
      !food ||
      !food.actualIngredients
    ) {
      return [];
    }


    return food.actualIngredients

      // 日本語の「、」だけでなく
      // 「，」「,」にも対応
      .split(/[、，,]/)

      .map(
        ingredient =>
          ingredient.trim()
      )

      .filter(
        ingredient =>
          ingredient.length > 0
      );

  }


  // =====================================================
  // 今食べているフード名検索
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


        // 選択中の犬・猫だけ検索
        const suggestions =
          foods.filter(food =>

            food.animal ===
              currentFoodAnimal &&

            food.name
              .toLowerCase()
              .includes(keyword)

          );


        if (
          suggestions.length === 0
        ) {

          if (foodSuggestions) {

            foodSuggestions.innerHTML =
              "<p>該当するフードがありません。</p>";

          }

          return;

        }


        suggestions.forEach(
          food => {

            const button =
              document.createElement(
                "button"
              );


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


                showSimilarFoods(
                  food
                );

              }
            );


            if (foodSuggestions) {

              foodSuggestions.appendChild(
                button
              );

            }

          }
        );

      }
    );

  }


  // =====================================================
  // 似ているフード検索
  // =====================================================

  function showSimilarFoods(
    selectedFood
  ) {

    const selectedIngredients =
      getActualIngredients(
        selectedFood
      );


    const similarFoods =
      foods

        .filter(food => {

          // 自分自身は除外
          if (
            food.name ===
            selectedFood.name
          ) {
            return false;
          }


          // 犬・猫をまたがない
          if (
            food.animal !==
            selectedFood.animal
          ) {
            return false;
          }


          const foodIngredients =
            getActualIngredients(
              food
            );


          // 実際の原材料で共通点を探す
          const commonIngredients =
            foodIngredients.filter(
              ingredient =>
                selectedIngredients.includes(
                  ingredient
                )
            );


          // 共通原材料なしは除外
          return (
            commonIngredients.length > 0
          );

        })


        .map(food => {

          const foodIngredients =
            getActualIngredients(
              food
            );


          const commonIngredients =
            foodIngredients.filter(
              ingredient =>
                selectedIngredients.includes(
                  ingredient
                )
            );


          // ------------------------------------------------
          // 似ている度
          // ------------------------------------------------

          let score =
            commonIngredients.length * 10;


          // 年齢が同じ
          if (
            selectedFood.age &&
            food.age &&
            selectedFood.age ===
              food.age
          ) {

            score += 5;

          }


          // 全年齢
          if (
            food.age === "全年齢"
          ) {

            score += 2;

          }


          // 犬の場合はサイズも考慮
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


            // 全犬種
            if (
              food.sizeCategory ===
              "全犬種"
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


        // 似ている順
        .sort(
          (a, b) =>
            b.score - a.score
        );


    // ===================================================
    // 結果表示
    // ===================================================

    if (!results) {
      return;
    }


    results.innerHTML = "";


    const title =
      document.createElement("h2");


    title.textContent =
      "似ているフード";


    results.appendChild(
      title
    );


    if (
      similarFoods.length === 0
    ) {

      results.innerHTML +=
        "<p>共通する実際の原材料を持つフードがありません。</p>";

      return;

    }


    similarFoods.forEach(
      item => {

        const food =
          item.food;


        const card =
          createFoodCard(
            food
          );


        // ------------------------------------------------
        // 共通原材料
        // ------------------------------------------------

        const common =
          document.createElement(
            "p"
          );


        common.innerHTML = `
          🔗 共通する原材料：
          ${item.commonIngredients.join("・")}
        `;


        const foodName =
          card.querySelector(
            "h3"
          );


        if (foodName) {

          foodName.after(
            common
          );

        }


        results.appendChild(
          card
        );

      }
    );

  }


  // =====================================================
  // お気に入り表示
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


              // お気に入りから外したら
              // カードも消す
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
    "フードデータを読み込めませんでした。dog-food.jsonとcat-food.jsonを確認してください。"
  );

});
