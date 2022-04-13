const RESULTS_SECTION = document.querySelector('#results');
const RESULTS_LIST = document.querySelector('.cocktail-results');
const DRINK_CHOICE = document.querySelector('#drink-choice');
let currentDrinkSelection,
    currentChoiceNumber;

// You've done a great job of declaring variables above. Is it worth doing the same with document.querySelector("#get-cocktails")
document.querySelector("#get-cocktails").addEventListener('click', e => {
    let ingredient = document.querySelector("input").value;

    // Great use of template literals, well done.
    fetch(`https://www.thecocktaildb.com/api/json/v1/1/filter.php?i=${ingredient}`)
    .then(res => res.json())
    .then(data => displayCocktailList(data))
    .catch(err => {
        // Have a think about how you could display something to a user if there was an error.
        console.log(`err ${err}`);
    })
});

// Be more descriptive with your parameters. You know what 'd' is but other people might not.
function displayCocktailList(d) {
    currentDrinkSelection = d;
    console.log(currentDrinkSelection);
    RESULTS_LIST.innerHTML = "";
    d.drinks.forEach(c => {
        RESULTS_LIST.innerHTML += `<li><a href="#">${c.strDrink}</a></li>`;
    });
    const links = Array.from(document.querySelectorAll('a'));
    // does currentChoiceNumber make sense as a variable name for links.length?
    currentChoiceNumber = links.length;
    links.forEach(a => a.addEventListener('click', fetchCocktail));
    RESULTS_SECTION.classList.remove('hidden');
}

// Same here, is it worth putting this in a variable to be consistent? document.querySelector("#random-choice")
document.querySelector("#random-choice").addEventListener('click', fetchCocktail);

function fetchCocktail(e) {
    e.preventDefault();
    console.log(e);
    let current;
    // Try and pull out strings from your functions and save them in a variable. eg. const supriseMeText = "Suprise me.". This isn't always necessary but I think would work nicely here.
    if (e.target.innerText === "Surprise me.") {
        // this is a nice feature
        let randomNum = Math.floor(Math.random() * currentChoiceNumber);
        current = currentDrinkSelection.drinks[randomNum].strDrink;
    } else current = e.target.innerText;

    fetch(`https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${current}`)
    .then(res => res.json())
    .then(data => {
        displayCocktail(data);
    })
    .catch(err => {
        // Same as above, try and handle this error in your app.
        console.log(`err: ${err}`);
    });
}

// Again try and be descriptive with your parameters
function displayCocktail(d, i = 0) {
    const drink = d.drinks[i],
        ingredientList = getIngredients(drink),
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
                                // I don't know much about the endpoint but could you check here like this 'if (d[i]) return i;'
                                // if d[i] is truthy then you are ok to return i. Both null and an emtpy string are falsey
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

// I think you've done a great job here mate. I would really recommend taking this project and using it as something you can recreate if you go on to learn a front end framework like React.