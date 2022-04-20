//The user will enter a cocktail. Get a cocktail name, photo, and instructions and place them in the DOM
const RESULTS_SECTION = document.querySelector('#results');
const RESULTS_LIST = document.querySelector('.cocktail-results');
const DRINK_CHOICE = document.querySelector('.container');
let currentDrinkSelection,
    currentChoiceNumber;

document.addEventListener('DOMContentLoaded', appInit);

async function appInit() {
    let app = new App();
    await app.init();
    
}

// display list of choices
class App {
    constructor() {
        this.searches = {};
        this.cards = {};
        this.current = [];
        this.currentIndex = 0;
        this.carouselTrack = document.querySelector('.carousel__track');
        this.carouselNav = document.querySelector('.carousel__nav');
        this.prevSlideButton = document.querySelector('.carousel__button--left');
        this.nextSlideButton = document.querySelector('.carousel__button--right');
    }

    async getFetch(url) {
        try {
            const res = await fetch(url);
            const data = await res.json();
            return data;
        } catch (error) {
            console.error(error);
        }
    }

    async init() {
        // set click event for button on search function
        document.querySelector("#get-cocktails").addEventListener('click', async () => {
            let ingredient = document.querySelector("input").value;
            if (!(`${ingredient}` in this.searches)) {
                let data = await this.getFetch(`https://www.thecocktaildb.com/api/json/v1/1/filter.php?i=${ingredient}`);
                this.searches[ingredient] = data.drinks;
            }
            this.current = this.searches[ingredient];
            // console.log(this.current);
            // render search results
            this.renderCocktailList(this.current, 'results');
            this.renderSkeletonCards(this.current);
            const track = this.carouselTrack;
            const slides = Array.from(this.carouselTrack.children);
            const currentSlide = track.querySelector('.current-slide');
            const targetSlide = slides[0]
            this.moveToSlide(currentSlide, targetSlide);
            this.fetchCocktail(this.current[0].strDrink);
            this.hideShowCarouselButtons(0);
        });
        // random cocktail function
        document.querySelector("#random-cocktail").addEventListener('click', async e => {
            // //fetch a random cocktail from search results
            const track = this.carouselTrack;
            const slides = Array.from(this.carouselTrack.children);
            const currentSlide = track.querySelector('.current-slide');
            const drinkIndex = Math.floor(Math.random() * this.current.length);
            const targetSlide = slides[drinkIndex];
            await this.moveToSlide(currentSlide, targetSlide);
            this.hideShowCarouselButtons(drinkIndex);
        });
        //add event listener to prevButton
        this.prevSlideButton.addEventListener('click', e => {
            const track = this.carouselTrack;
            const slides = Array.from(this.carouselTrack.children);
            const currentSlide = track.querySelector('.current-slide');
            const prevSlide = currentSlide.previousElementSibling;
            const prevIndex = slides.findIndex(slide => slide === prevSlide);
            this.moveToSlide(currentSlide, prevSlide);
            this.hideShowCarouselButtons(prevIndex);
        })
        //add event listener to nextButton
        this.nextSlideButton.addEventListener('click', e => {
            const track = this.carouselTrack;
            const slides = Array.from(this.carouselTrack.children);
            const currentSlide = track.querySelector('.current-slide');
            const nextSlide = currentSlide.nextElementSibling;
            const nextIndex = slides.findIndex(slide => slide === nextSlide);
            this.moveToSlide(currentSlide, nextSlide);
            this.hideShowCarouselButtons(nextIndex);
        });
    }

    /**
     * renders text search results with link in list items
     * calls addLinkListeners on the created links
     * unhides results section if it's hidden
     * **/
    renderCocktailList(arr, parentId) {
        // currentDrinkSelection = data;
        // console.log(currentDrinkSelection);
        RESULTS_LIST.innerHTML = "";
        arr.forEach((c, i) => {
            const li = document.createElement('li');
            li.classList.add('slide-link');
            if (i === 0) li.classList.add('current-slide');
            const link = document.createElement('a');
            link.setAttribute('href', '#');
            link.textContent = c.strDrink;
            li.appendChild(link);
            RESULTS_LIST.appendChild(li);
        });
        this.addLinkListeners(parentId);
        if (RESULTS_SECTION.classList.contains('hidden')) {
            RESULTS_SECTION.classList.remove('hidden');
        }
    }

    /** NEED TO RE-WORK EVENT LISTENER
     * collects all links in parentId
     * adds a click listener that calls fetchCocktail
     * fetchCocktail uses the link's inner text
     * **/
    addLinkListeners(parentId) {
        
        const links = Array.from(document.querySelectorAll(`#${parentId} a`));
        const resultsList = document.querySelector('.cocktail-results');

        // currentChoiceNumber = links.length;
        links.forEach(a => a.addEventListener('click', async e => {
            e.preventDefault();
            // console.log(e.target.innerText);
            // console.log(resultsList);
            const currentSlide = this.carouselTrack.querySelector('.current-slide');
            const links = Array.from(resultsList.children).map(li => li.children[0]);
            const slides = Array.from(this.carouselTrack.children)
            const targetIndex = links.findIndex(listItem => listItem === e.target);
            const targetSlide = slides[targetIndex];
            // console.log(targetSlide);

            this.moveToSlide(currentSlide, targetSlide);
            this.hideShowCarouselButtons(targetIndex);
            this.fetchCocktail(e.target.innerText);
        }));
    }

    /**
     * Get and render cocktail object data.
     *
     * filters the this.current array to find the index of a drink 
     * object that has a property name whose value matches the string
     * checks to see if drink string exists in this.cards
     * runs getFetch on string if drink does not exist in this.cards
     * calls renderCocktail on this.cards[drinkName]
     * 
     * @param {string}  str     'Surprise me.' or a 'Drink Name'.
     */
    async fetchCocktail(str) {
        let fetch;
        if (!this.cards[str]) {
            let drinkIndex;
            if (str === "Surprise me.") {
                drinkIndex = Math.floor(Math.random() * this.current.length);    
            } else {
                drinkIndex = this.current.findIndex(drink => drink.strDrink === str);
            }
            this.currentIndex = drinkIndex;
            fetch = this.current[drinkIndex].strDrink;
            if (!(`${fetch}` in this.cards)) {
                const data = await this.getFetch(`https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${fetch}`);
                const drink = data.drinks[0];
                this.cards[drink.strDrink] = data.drinks[0];
            }
        }
        this.renderCocktailRecipe(this.cards[str]);
    }

    /**
     * places slides side by side instead of on top of one another
     * **/
    placeSlides() {
        //get slides
        const slides = Array.from(this.carouselTrack.children);
        //set slide width
        const slideWidth = slides[0].getBoundingClientRect().width;
        //lay slides out side-by-side
        const setSlidePosition = (slide, index) => {
            slide.style.left = slideWidth * index + 'px';
        }
        //add current-slide class to first slide
        slides[0].classList.add('current-slide');
        slides.forEach(setSlidePosition);
    }

    /**
     * helper function for prev and next button clicks
     * transitions from current slide to target slide (prev or next)
     * **/
    async moveToSlide(currentSlide, targetSlide) {
        this.carouselTrack.style.transform = `translateX(-${targetSlide.style.left})`;
        currentSlide.classList.remove('current-slide');
        targetSlide.classList.add('current-slide');
        await this.fetchCocktail(targetSlide.children[0].id);
    }

    /**
     * helper function for prev and next button display
     * hides prev button when there is nothing to the left
     * hides next button when there is nothing to the right
     * **/
    hideShowCarouselButtons(targetIndex) {
        const slides = Array.from(this.carouselTrack.children);
        const prevButton = this.prevSlideButton;
        const nextButton = this.nextSlideButton;
        if (targetIndex === 0) {
            prevButton.classList.add('is-hidden');
            nextButton.classList.remove('is-hidden');
        } else if (targetIndex === slides.length - 1) {
            prevButton.classList.remove('is-hidden');
            nextButton.classList.add('is-hidden');
        } else {
            prevButton.classList.remove('is-hidden');
            nextButton.classList.remove('is-hidden');
        }
    }

    /**
     * Initiates the skeleton card slide rendering
     * Calls placeSlides to place slides side-by-side
     * sets current slide class to first slide
     * **/
    renderSkeletonCards(arr) {
        this.carouselTrack.textContent = '';
        arr.forEach((obj, i) => {
            this.renderSkeletonCard(obj.strDrink);
        });
        this.placeSlides();
        document.querySelector('.carousel__slide').classList.add('current-slide');

    }
    
    /****
     * Render skeleton card for recipes
     * append skeleton card to carousel__track
     ****/
    renderSkeletonCard(str) {
        //helper function for adding skeleton text to an element
        const appendSkeleText = (parent, child) => {
            for (let i = 1; i <= 3; i++) {
                parent.appendChild(child)
            }
        }

        //create containing item list
        const listItem = document.createElement('li');
        listItem.classList.add('carousel__slide');

        //create article
        const card = document.createElement('article');
        card.classList.add('cocktail-recipe');
        card.setAttribute('id', str);

        //create img
        const img = document.createElement('img');
        img.classList.add('skeleton');

        //create name title
        const nameTitle = document.createElement('h2');
        nameTitle.setAttribute('data-name', true);
        const nameTitleSkel = document.createElement('div');
        nameTitleSkel.classList.add('skeleton', 'skeleton-header', 'skeleton-name');
        nameTitle.appendChild(nameTitleSkel);

        //create ingredients
        ////title
        const ingredientsTitle = document.createElement('h3');
        ingredientsTitle.classList.add('ingredients-title');
        const ingredientsTitleSkel = document.createElement('div');
        ingredientsTitleSkel.classList.add('skeleton', 'skeleton-header');
        ingredientsTitle.appendChild(ingredientsTitleSkel);
        ////ingredients list
        const ingredientsList = document.createElement('ul');
        ingredientsList.setAttribute('data-ingredients', true);
        //create skeleton list items for ingredientsList
        const ingredientItem = document.createElement('li');
        ingredientItem.classList.add('skeleton', 'skeleton-text', 'skeleton-ingredient');
        appendSkeleText(ingredientsList, ingredientItem);

        //create instructions
        ////title
        const instructionsTitle = document.createElement('h3');
        instructionsTitle.classList.add('instructions-title');
        const instructionsTitleSkel = document.createElement('div');
        instructionsTitleSkel.classList.add('skeleton', 'skeleton-header');
        instructionsTitle.appendChild(instructionsTitleSkel);
        ////text
        const instructionsText = document.createElement('p');
        instructionsText.setAttribute('data-instructions', true);
        //create skeleton text for instructionsText
        const skeletonText = document.createElement('div');
        skeletonText.classList.add('skeleton', 'skeleton-text');
        appendSkeleText(instructionsText, skeletonText);
        
        //append elements to article
        const elements = [
            img, 
            nameTitle, 
            ingredientsTitle, 
            ingredientsList, 
            instructionsTitle, 
            instructionsText
        ];
        elements.forEach(el => {
            card.appendChild(el);
        });

        //append article to list item
        listItem.appendChild(card);

        //append list item to carousel track    
        this.carouselTrack.appendChild(listItem);
    }

     /**
     * finds article/cocktail-recipe by id
     * fetches cocktail info
     * renders cocktail info to 
     * **/
      renderCocktailRecipe(obj) {
        // console.log(obj);
        const card = this.carouselTrack.querySelector(`article[id="${obj.strDrink}"]`);
        const img = card.querySelector('img');
        const name = card.querySelector('[data-name]');
        const ingredientsTitle = card.querySelector('.ingredients-title');
        const ingredients = card.querySelector('[data-ingredients]');
        const instructionsTitle = card.querySelector('.instructions-title');
        const instructions = card.querySelector('[data-instructions]');

        //image
        img.src = obj.strDrinkThumb;

        //name
        name.textContent = obj.strDrink;

        //ingredients
        ingredientsTitle.textContent = 'Ingredients';
        ingredients.textContent = '';
        this.getIngredients(obj, ingredients);

        //instructions
        instructionsTitle.textContent = 'Instructions';
        instructions.textContent = obj.strInstructions;
    }

    /**
     * takes an object in (a drink object) and an parentElement (ul)
     * creates a list item element for each ingredient
     * list item is a string that shows measurement for the ingredient and the ingredient's name
     * appends each list item to parentElement.
     * **/
     getIngredients(obj, parentElement) {
        const ingredientKeys = Object.keys(obj)
        .map(i => {
            if (i.includes('Ingredient')) return i;
        })
        .filter(i => {
            if (obj[i] !== null && obj[i] !== "") return i;
        });
        for (let i = 0; i < ingredientKeys.length; i++) {
            let currentKey = ingredientKeys[i];
            let number = currentKey.slice(currentKey.lastIndexOf('t') + 1);
            let ingredientName = obj[currentKey];
            let ingredientMeasure = obj[`strMeasure${number}`];
            if (ingredientMeasure === null) ingredientMeasure = "";
            const li = document.createElement('li');
            li.textContent = `${ingredientMeasure} ${ingredientName}`;
            parentElement.appendChild(li);
        }
    }

    // //will re-purpose for rendering nav indicator dots
    // //render thumbs in carousel track
    // renderCocktailThumbs(arr) {
    //     this.carouselTrack.textContent = '';
    //     arr.forEach(drinkObj => this.renderCocktailThumb(drinkObj));
    //     this.placeSlides();
    // }

    // //render individual thumb
    // renderCocktailThumb(obj) {
    //     // create li slide item
    //     console.log(obj);

    //     const li = document.createElement('li');
    //     li.classList.add('carousel__slide');

    //     // create elements that go into slide

    //     //name of drink
    //     const name = document.createElement('h2');
    //     name.classList.add('thumb-drink-name');
    //     name.textContent = obj.strDrink;

    //     //image
    //     const img = document.createElement('img');
    //     img.src = obj.strDrinkThumb;
    //     img.classList.add('carousel__image');

    //     // //append to ul
    //     [name, img].forEach(tag => li.appendChild(tag));
    //     // li.appendChild(img);
    //     this.carouselTrack.appendChild(li);
    // }

}