const searchSection = document.getElementById("searchSection");


// =====================================================
// 犬・猫のJSONを読み込む
// =====================================================

Promise.all([
  fetch("dog-food.json")
    .then(response => {
      if (!response.ok) {
        throw new Error(
          `dog-food.json HTTPエラー: ${response.status}`
        );
      }
      return response.text();
    })
    .then(text => {
      try {
        return JSON.parse(text);
      } catch (error) {
        console.error("dog-food.jsonの中身:", text);
        throw new Error(
          "dog-food.jsonのJSON形式が壊れています: " +
          error.message
        );
      }
    }),

  fetch("cat-food.json")
    .then(response => {
      if (!response.ok) {
        throw new Error(
          `cat-food.json HTTPエラー: ${response.status}`
        );
      }
      return response.text();
    })
    .then(text => {
      try {
        return JSON.parse(text);
      } catch (error) {
        console.error("cat-food.jsonの中身:", text);
        throw new Error(
          "cat-food.jsonのJSON形式が壊れています: " +
          error.message
        );
      }
    })
])

.then(([dogFoods, catFoods]) => {

  // JSONが配列か確認
  if (!Array.isArray(dogFoods)) {
    throw new Error(
      "dog-food.jsonは配列形式になっていません"
    );
  }

  if (!Array.isArray(catFoods)) {
    throw new Error(
      "cat-food.jsonは配列形式になっていません"
    );
  }


  // 犬＋猫を1つにまとめる
  const foods = [
    ...dogFoods,
    ...catFoods
  ];

  console.log(
    `犬 ${dogFoods.length}件 / 猫 ${catFoods.length}件`
  );

  // ↓↓↓ここから下は今のJSをそのまま続ける
