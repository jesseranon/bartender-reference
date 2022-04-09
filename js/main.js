//The user will enter a cocktail. Get a cocktail name, photo, and instructions and place them in the DOM
const RESULTS_SECTION = document.querySelector('#results');
const RESULTS_LIST = document.querySelector('.cocktail-results');
const DRINK_CHOICE = document.querySelector('#drink-choice');
let currentDrinkSelection,
    currentChoiceNumber;

// 
document.querySelector("#get-cocktails").addEventListener('click', e => {
    let ingredient = document.querySelector("input").value;
    
    fetch(`https://www.thecocktaildb.com/api/json/v1/1/filter.php?i=${ingredient}`)
    .then(res => res.json())
    .then(data => displayCocktailList(data))
    .catch(err => {
        console.log(`err ${err}`);
    })
});

// display list of choices
function displayCocktailList(d) {
    currentDrinkSelection = d;
    console.log(currentDrinkSelection);
    RESULTS_LIST.innerHTML = "";
    d.drinks.forEach(c => {
        RESULTS_LIST.innerHTML += `<li><a href="#">${c.strDrink}</a></li>`;
    });
    const links = Array.from(document.querySelectorAll('a'));
    currentChoiceNumber = links.length;
    links.forEach(a => a.addEventListener('click', fetchCocktail));
    RESULTS_SECTION.classList.remove('hidden');
}

// choose a random cocktail
document.querySelector("#random-choice").addEventListener('click', fetchCocktail);

function fetchCocktail(e) {
    e.preventDefault();
    console.log(e);
    let current;
    if (e.target.innerText === "Surprise me.") {
        let randomNum = Math.floor(Math.random() * currentChoiceNumber);
        current = currentDrinkSelection.drinks[randomNum].strDrink;
    } else current = e.target.innerText;
    console.log(current);
    fetch(`https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${current}`)
    .then(res => res.json())
    .then(data => {
        displayCocktail(data);
    })
    .catch(err => {
        console.log(`err: ${err}`);
    });
}

function displayCocktail(d, i = 0) {
    console.log(d);
    const drink = d.drinks[i];
    console.log(drink);
    const ingredientList = getIngredients(drink),
        h2 = document.querySelector('#drink-choice h2'),
        img = document.querySelector('#drink-choice img'),
        ingredients = document.querySelector('#ingredients-list'),
        instructions = document.querySelector('#instructions');
    h2.innerText = drink.strDrink;
    img.src = drink.strDrinkThumb;
    instructions.innerText = drink.strInstructions;
    ingredients.innerHTML = ingredientList;
    DRINK_CHOICE.classList.remove('hidden');
}

function getIngredients(d) {
    const ingredientKeys = Object.keys(d)
                            .map(i => {
                                if (i.includes('Ingredient')) return i;
                            })
                            .filter(i => {
                                if (d[i] !== null && d[i] !== "") return i;
                            });
    let res = '';
    for (let i = 0; i < ingredientKeys.length; i++) {
        let currentKey = ingredientKeys[i];
        let number = currentKey.slice(currentKey.lastIndexOf('t') + 1);
        let ingredientName = d[currentKey];
        let ingredientMeasure = d[`strMeasure${number}`];
        if (ingredientMeasure === null) ingredientMeasure = "";
        res += `<li>${ingredientMeasure} ${ingredientName}</li>`;
    }
    return res;
}