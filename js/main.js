const BASE_URL = "https://acnhapi.com/v1a",
  PERSONALITIES = ['Jock', 'Peppy', 'Snooty', 'Cranky', 'Lazy', 'Normal', 'Uchi', 'Smug'].sort(),
  MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  CHAR_CODE = 65,
  DETAILS = Array.from(document.querySelectorAll('details')),
  ALPHABET = [],
  SPECIES = [],
  VILLAGERS = [],
  listPairs = [[SPECIES, `#species-list`], [ALPHABET, `#alphabet-list`], [PERSONALITIES, `#personalities-list`], [MONTHS, `#months-list`]];

// too lazy to make an alphabet array by hand
for (let i = CHAR_CODE; i < CHAR_CODE + 26; i++) {
  ALPHABET.push(String.fromCharCode(i));
}

fetch(`${BASE_URL}/villagers`)
  .then(data => data.json())
  .then(json => {
    json.forEach(obj => VILLAGERS.push(obj));
    setSpeciesList(VILLAGERS);
    listPairs.forEach(pair => {
      [list, parentId] = pair;
      setListLinks(list, parentId);
    });
  })
  .catch(err => {
    console.log(`err: ${err}`);
  });

  console.log(VILLAGERS);

// when the user chooses a category from the list, it populates the sub-category list.
// when the user chooses a name from the sub-category list, it generates a villager passport

function setSpeciesList(arr) {
  arr.map(v => v.species)
    .filter((species, i, arr) => {
      if (i === arr.indexOf(species)) return species;
    })
    .forEach(species => SPECIES.push(species));
}

function setListLinks(arr, parentId) {
  let parentUl = document.querySelector(`${parentId}`)
  let res = '';
  for (let i = 0; i < arr.length; i++) {
    res += createListItem(arr[i]);
  }
  parentUl.innerHTML = res;
  addLinkEventListeners(parentId);
}

function addLinkEventListeners(parentId) {
  let links = Array.from(document.querySelectorAll(`${parentId} a`));
  links.forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      advanceSelection(e.currentTarget);
    })
  });
}

function advanceSelection(c) {
  let names = getFilteredNames(c.innerText);
  let res = '';
  if (names.length > 1) {
    const namesParent = document.querySelector('#filtered-names');
    names.forEach(villager => {
      res += createListItem(villager.name["name-USen"]);
    });
    namesParent.innerHTML = res; 
    addLinkEventListeners(`#filtered-names`);
  } else {
    const villager = names[0];
    setPassportDiv(villager);
  }
}

function createListItem(val) {
  return `<li><a href="#">${val}</a></li>`;
}

function getFilteredNames(s) {
  let res;
  if (SPECIES.includes(s)) {
    res = villagersFilter('species', s);
  } else if (PERSONALITIES.includes(s)) {
    res = villagersFilter('personality', s);
  } else if (MONTHS.includes(s)) {
    res = villagersFilter('birthday-string', s);
  } else {
    res = villagersFilter('name', s);
  }
  return res;
}

function villagersFilter(prop, val) {
  switch (prop) {
    case 'name':
      if (val.length === 1) {
        return VILLAGERS.filter(villager => {
          return villager.name["name-USen"][0] === val;
        });
      } else {
        return VILLAGERS.filter(villager => {
          return villager.name["name-USen"] === val;
        });
      }
    case 'birthday-string':
      return VILLAGERS.filter(villager => {
        return villager["birthday-string"].split(' ')[0] === val;
      });
    default:
      return VILLAGERS.filter(villager => {
        return villager[prop] === val;
      });
  }  
}

function setPassportDiv(villager) {
  const passportParent = document.querySelector('#villager-passport');
  passportParent.querySelector('#villager-name').innerText = villager.name["name-USen"];
  passportParent.querySelector('#villager-pic').src = villager["image_uri"];
  passportParent.querySelector('#villager-birthdate').innerText = villager["birthday-string"];
  passportParent.querySelector('#villager-personality').innerText = villager.personality;
  passportParent.querySelector('#villager-saying').innerText = villager.saying;
  passportParent.classList.remove('hidden');
}

// close details that are not the last one clicked.
DETAILS.forEach(d => {
  d.addEventListener('click', e => {
    DETAILS.forEach(detail => {
      if (detail !== d) detail.removeAttribute('open');
    })
  });
});