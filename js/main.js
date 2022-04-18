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
        //init lightbox
        this.initLightbox();
        // set click event for button on search function
        document.querySelector("#get-cocktails").addEventListener('click', async () => {
            let ingredient = document.querySelector("input").value;
            if (!(`${ingredient}` in this.searches)) {
                let data = await this.getFetch(`https://www.thecocktaildb.com/api/json/v1/1/filter.php?i=${ingredient}`);
                this.searches[ingredient] = data.drinks;
            }
            this.current = this.searches[ingredient];
            console.log(this.current);
            // render search results
            this.renderCocktailList(this.current, 'results');
            this.renderCocktailThumbs(this.current);
        });
        // random cocktail function
        document.querySelector("#random-cocktail").addEventListener('click', async e => {
            // //fetch a random cocktail from search results
            await this.fetchCocktail(e.currentTarget.innerText); 
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
     * renders search results with link in list items
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

    /**
     * collects all links in parentId
     * addes a click listener that calls fetchCocktail
     * fetchCocktail uses the link's inner text
     * **/
    addLinkListeners(parentId) {
        
        const links = Array.from(document.querySelectorAll(`#${parentId} a`));
        const resultsList = document.querySelector('.cocktail-results');

        // currentChoiceNumber = links.length;
        links.forEach(a => a.addEventListener('click', async e => {
            e.preventDefault();
            console.log(e.target.innerText);
            console.log(resultsList);
            const currentSlide = this.carouselTrack.querySelector('.current-slide');
            const links = Array.from(resultsList.children).map(li => li.children[0]);
            const slides = Array.from(this.carouselTrack.children)
            const targetIndex = links.findIndex(listItem => listItem === e.target);
            const targetSlide = slides[targetIndex];
            console.log(targetSlide);

            this.moveToSlide(currentSlide, targetSlide);
            this.hideShowCarouselButtons(targetIndex);
            this.fetchCocktail(e.target.innerText);
        }));
    }

    /**
     * takes in a string
     * filters the this.current array to find the index of a drink 
     * object that has a property name whose value matches the string
     * checks to see if drink string exists in this.cards
     * runs getFetch on string if drink does not exist in this.cards
     * calls renderCocktail on this.cards[currentIndex]
     * **/
    async fetchCocktail(str) {
        let drinkIndex;
        let fetch;
        if (str === "Surprise me.") {
            drinkIndex = Math.floor(Math.random() * this.current.length);    
        } else {
            drinkIndex = this.current.findIndex(drink => drink.strDrink === str);
        }
        this.currentIndex = drinkIndex;
        fetch = this.current[drinkIndex].strDrink;
        if (!(`${this.currentIndex}` in this.cards)) {
            let data = await this.getFetch(`https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${fetch}`);
            this.cards[this.currentIndex] = data.drinks[0];
        }
        this.renderCocktailRecipe(this.cards[this.currentIndex]);
    }

    /**
     * takes an object in (a drink object) and an parentElement (ul)
     * creates list item elements for each ingredient
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

    //render thumbs in carousel track
    renderCocktailThumbs(arr) {
        this.carouselTrack.textContent = '';
        arr.forEach(drinkObj => this.renderCocktailThumb(drinkObj));
        this.placeSlides();
    }

    //render individual thumb
    renderCocktailThumb(obj) {
        // create li slide item
        console.log(obj);

        const li = document.createElement('li');
        li.classList.add('carousel__slide');

        // create elements that go into slide

        //name of drink
        const name = document.createElement('h2');
        name.classList.add('thumb-drink-name');
        name.textContent = obj.strDrink;

        //image
        const img = document.createElement('img');
        img.src = obj.strDrinkThumb;
        img.classList.add('carousel__image');

        // //append to ul
        [name, img].forEach(tag => li.appendChild(tag));
        // li.appendChild(img);
        this.carouselTrack.appendChild(li);
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
    moveToSlide(currentSlide, targetSlide) {
        this.carouselTrack.style.transform = `translateX(-${targetSlide.style.left})`;
        currentSlide.classList.remove('current-slide');
        targetSlide.classList.add('current-slide');
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
     * creates a lightbox element
     * appends it to body
     * adds an event listener that hides it if clicked outside of nested article
     * **/
    initLightbox() {
        const lightbox = document.createElement('div');
        lightbox.id = 'lightbox';
        document.body.appendChild(lightbox);
        lightbox.addEventListener('click', e => {
            if (e.target !== e.currentTarget) return;
            lightbox.classList.remove('active');
        })
    }

    /**
     * takes in a single cocktail object and renders it to the #drink choice div
     * calls getIngredients on the passed object for help rendering the ingredient list.
     * adds components to an article
     * appends the article to the lightbox
     * unhides the lightbox
     * **/
    renderCocktailRecipe(obj) {
        const lightbox = document.querySelector('#lightbox');
        lightbox.textContent = '';
        // create article
        console.log(obj);

        const article = document.createElement('article');
        article.classList.add('cocktail-recipe');

        // create elements that go into article

        //name of drink
        const name = document.createElement('h2');
        name.classList.add('drink-name');
        name.textContent = obj.strDrink;

        //image
        const img = document.createElement('img');
        img.src = obj.strDrinkThumb;
        img.classList.add('recipe-image');

        //ingredients
        const ingredientsTitle = document.createElement('h3');
        ingredientsTitle.textContent = 'Ingredients';

        const ingredientsList = document.createElement('ul');
        ingredientsList.classList.add('ingredients-list');
        this.getIngredients(obj, ingredientsList);

        //instructions
        const instructionsTitle = document.createElement('h3');
        instructionsTitle.textContent = 'Instructions';

        const instructionsText = document.createElement('p');
        instructionsText.classList.add('instructions-text');
        instructionsText.textContent = obj.strInstructions;

        // //append to ul
        [name, img, ingredientsTitle, ingredientsList, instructionsTitle, instructionsText]
            .forEach(tag => article.appendChild(tag));

        lightbox.appendChild(article);
        lightbox.classList.add('active');
    }

}