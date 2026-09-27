fetch("foods.json")
  .then(response => response.json())
  .then(foods => {
    console.log(foods);
  });
