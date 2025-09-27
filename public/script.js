import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc, addDoc, collection } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAfRSdeNWR7CFtj5XA_5_Gm_z_BS--Dvw0",
  authDomain: "manda-shop.firebaseapp.com",
  projectId: "manda-shop",
  storageBucket: "manda-shop.firebasestorage.app",
  messagingSenderId: "874318178210",
  appId: "1:874318178210:web:a0ea9f9bc1b5a1a1abb4fb",
  measurementId: "G-CLQ13B615D"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

class PokemonAPIManager {
  constructor() {
    this.pokemonList = [];
    this.pokemonDetails = new Map();
    this.isLoading = false;
    this.isLoaded = false;
    this.loadPromise = null;
    
    this.legendaryIds = new Set([
      144, 145, 146, 150, 151,
      243, 244, 245, 249, 250, 251,
      377, 378, 379, 380, 381, 382, 383, 384, 385, 386,
      480, 481, 482, 483, 484, 485, 486, 487, 488, 489, 490, 491, 492, 493,
      494, 638, 639, 640, 641, 642, 643, 644, 645, 646, 647, 648, 649,
      716, 717, 718, 719, 720, 721,
      785, 786, 787, 788, 789, 790, 791, 792, 800, 801, 802, 807, 808, 809,
      888, 889, 890, 891, 892, 893, 894, 895, 896, 897, 898,
      1007, 1008, 1009, 1010, 1011, 1012, 1013, 1014, 1015, 1016, 1017, 1018, 1019, 1020, 1021, 1022, 1023, 1024, 1025
    ]);

    this.specialFormsKeywords = [
      'mega', 'gigantamax', 'gmax', 'primal', 'ultra', 'eternamax', 
      'crowned', 'origin', 'sky', 'hangry', 'zen', 'therian', 
      'black', 'white', 'complete', 'unbound', 'resolute', 'pirouette',
      'blade', 'shield', 'dusk', 'dawn', 'ice', 'shadow', 'rider',
      'low-key', 'amped', 'full-belly', 'ruby', 'sapphire', 'emerald',
      'sunshine', 'east', 'west', 'autumn', 'summer', 'spring', 'winter',
      'red-striped', 'blue-striped', 'incarnate', 'school', 'solo',
      'midday', 'midnight', 'dusk', 'ultra', 'dawn-wings', 'dusk-mane',
      'stellar', 'wellspring', 'hearthflame', 'cornerstone', 'teal'
    ];

    this.allowedRegionalForms = [
      'alola', 'galar', 'hisui', 'paldea'
    ];
  }

  async loadPokemonList() {
    if (this.isLoaded) return this.pokemonList;
    if (this.isLoading) return this.loadPromise;
    
    this.isLoading = true;
    
    this.loadPromise = this._fetchPokemonList();
    try {
      await this.loadPromise;
    } catch (error) {
      this.isLoading = false;
      throw error;
    }
    
    return this.pokemonList;
  }

  async _fetchPokemonList() {
    try {
      const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=2000');
      if (!response.ok) throw new Error('Falha ao buscar lista da PokeAPI');
      
      const data = await response.json();
      
      this.pokemonList = data.results
        .map(pokemon => {
          const id = this._extractIdFromUrl(pokemon.url);
          
          const formattedName = pokemon.name
            .split('-')
            .map(part => part.charAt(0).toUpperCase() + part.slice(1))
            .join(' ');
          
          return {
            id: id,
            name: formattedName,
            originalName: pokemon.name,
            url: pokemon.url
          };
        })
        .filter(pokemon => {
          if (this.legendaryIds.has(pokemon.id)) return false;
          if (this.isSpecialForm(pokemon.originalName)) return false;
          return true;
        });
      
      this.pokemonList.sort((a, b) => a.id - b.id);
      
      this.isLoaded = true;
      this.isLoading = false;
      
    } catch (error) {
      this.isLoading = false;
      this.pokemonList = this._getFallbackList();
      this.isLoaded = true;
    }
  }

  _extractIdFromUrl(url) {
    const matches = url.match(/\/(\d+)\/$/);
    return matches ? parseInt(matches[1]) : 0;
  }

  _getFallbackList() {
    return [
      { id: 1, name: 'Bulbasaur', originalName: 'bulbasaur' },
      { id: 4, name: 'Charmander', originalName: 'charmander' },
      { id: 7, name: 'Squirtle', originalName: 'squirtle' },
      { id: 25, name: 'Pikachu', originalName: 'pikachu' },
      { id: 39, name: 'Jigglypuff', originalName: 'jigglypuff' },
      { id: 94, name: 'Gengar', originalName: 'gengar' },
      { id: 143, name: 'Snorlax', originalName: 'snorlax' },
      { id: 150, name: 'Mewtwo', originalName: 'mewtwo' },
      { id: 151, name: 'Mew', originalName: 'mew' }
    ];
  }

  searchPokemon(query) {
    if (!query || !this.isLoaded) return [];
    
    const searchTerm = this._normalize(query);
    
    return this.pokemonList.filter(pokemon => {
      const pokemonName = this._normalize(pokemon.name);
      const pokemonOriginal = this._normalize(pokemon.originalName);
      
      return pokemonName.includes(searchTerm) || pokemonOriginal.includes(searchTerm);
    });
  }

  findExactPokemon(name) {
    if (!name || !this.isLoaded) return null;
    
    const searchTerm = this._normalize(name);
    
    return this.pokemonList.find(pokemon => {
      const pokemonName = this._normalize(pokemon.name);
      const pokemonOriginal = this._normalize(pokemon.originalName);
      
      return pokemonName === searchTerm || pokemonOriginal === searchTerm;
    });
  }

  async getPokemonDetails(pokemonName) {
    const cacheKey = pokemonName.toLowerCase();
    
    if (this.pokemonDetails.has(cacheKey)) {
      return this.pokemonDetails.get(cacheKey);
    }

    try {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${cacheKey}`);
      if (!response.ok) return null;
      
      const pokemon = await response.json();
      
      const details = {
        id: pokemon.id,
        name: pokemon.name,
        height: pokemon.height,
        weight: pokemon.weight,
        types: pokemon.types.map(type => type.type.name),
        sprite: pokemon.sprites.front_default,
        abilities: pokemon.abilities.map(ability => ({
          name: ability.ability.name,
          isHidden: ability.is_hidden
        })),
        stats: pokemon.stats.map(stat => ({
          name: stat.stat.name,
          value: stat.base_stat
        }))
      };

      this.pokemonDetails.set(cacheKey, details);
      return details;
      
    } catch (error) {
      return null;
    }
  }

  _normalize(text) {
    if (!text) return '';
    return text
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '');
  }

  getAllPokemon() {
    return this.pokemonList;
  }

  isLegendary(pokemonId) {
    return this.legendaryIds.has(pokemonId);
  }

  isPokemonLegendary(pokemonName) {
    const pokemon = this.findExactPokemon(pokemonName);
    return pokemon ? this.isLegendary(pokemon.id) : false;
  }

  isSpecialForm(pokemonName) {
    const nameLower = pokemonName.toLowerCase();
    
    const hasSpecialForm = this.specialFormsKeywords.some(keyword => 
      nameLower.includes(keyword)
    );
    
    if (!hasSpecialForm) return false;
    
    const isAllowedRegional = this.allowedRegionalForms.some(regional => 
      nameLower.includes(regional)
    );
    
    if (isAllowedRegional) return false;
    return true;
  }

  getRandomPokemon() {
    if (!this.isLoaded || this.pokemonList.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * this.pokemonList.length);
    return this.pokemonList[randomIndex];
  }

  getPokemonByGeneration(generation) {
    if (!this.isLoaded) return [];
    
    const ranges = {
      1: [1, 151], 2: [152, 251], 3: [252, 386], 4: [387, 493], 5: [494, 649],
      6: [650, 721], 7: [722, 809], 8: [810, 905], 9: [906, 1025]
    };

    const range = ranges[generation];
    if (!range) return [];

    return this.pokemonList.filter(p => p.id >= range[0] && p.id <= range[1]);
  }
}

window.pokemonAPI = new PokemonAPIManager();

class AbilitySelect {
  constructor(element) {
    this.element = element;
    this.trigger = element.querySelector('.pokemon-select-trigger');
    this.optionsContainer = element.querySelector('.pokemon-select-options');
    this.searchInput = element.querySelector('.pokemon-search-input');
    this.optionsList = element.querySelector('.pokemon-options-list');
    this.placeholderElement = element.querySelector('.pokemon-select-placeholder');
    
    this.selectedValue = '';
    this.selectedAbility = null;
    this.isOpen = false;
    this.boundDocumentClickHandler = null;
    this.currentOptions = [];
    this.currentPokemon = null;
    this.abilities = [];
    this.hiddenAbility = null;
    
    this.init();
  }
  
  init() {
    this.bindEvents();
  }

  bindEvents() {
    this.trigger.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (this.currentPokemon) {
        this.toggle();
      }
    });
    
    this.trigger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (this.currentPokemon) {
          this.toggle();
        }
      } else if (e.key === 'Escape') {
        this.close();
      }
    });
    
    this.searchInput.addEventListener('input', (e) => {
      this.filterOptions(e.target.value);
    });
   
    this.searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        this.close();
      }
      e.stopPropagation();
    });
   
    this.searchInput.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
    });

    this.optionsContainer.addEventListener('click', (e) => {
      e.stopPropagation();
    });
    
    this.boundDocumentClickHandler = (e) => {
      if (!this.element.contains(e.target)) {
        this.close();
      }
    };
  }
  
  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }
  
  open() {
    if (this.isOpen || !this.currentPokemon) return;
    
    this.isOpen = true;
    this.trigger.classList.add('active');
    this.optionsContainer.classList.add('active');
    
    setTimeout(() => {
      document.addEventListener('click', this.boundDocumentClickHandler, true);
      this.searchInput.focus();
    }, 50);
    
    this.searchInput.value = '';
    this.filterOptions('');
  }
  
  close() {
    if (!this.isOpen) return;
    
    this.isOpen = false;
    this.trigger.classList.remove('active');
    this.optionsContainer.classList.remove('active');
    
    if (this.boundDocumentClickHandler) {
      document.removeEventListener('click', this.boundDocumentClickHandler, true);
    }
    
    if (document.activeElement === this.searchInput) {
      this.trigger.focus();
    }
  }
  
  async loadAbilities(pokemonName) {
    try {
      this.placeholderElement.textContent = 'Carregando habilidades...';
      this.currentPokemon = pokemonName;
      
      const pokemonDetails = await window.pokemonAPI.getPokemonDetails(pokemonName.toLowerCase());
      
      if (!pokemonDetails || !pokemonDetails.abilities) {
        this.showError('Erro ao carregar habilidades');
        return;
      }
      
      this.abilities = pokemonDetails.abilities.filter(ability => !ability.isHidden);
      this.hiddenAbility = pokemonDetails.abilities.find(ability => ability.isHidden);
      
      this.createAbilityOptions();
      this.updatePlaceholder();
      
    } catch (error) {
      this.showError('Erro ao carregar habilidades');
    }
  }
  
  createAbilityOptions() {
    this.optionsList.innerHTML = '';
    this.currentOptions = [];
    
    if (this.abilities.length > 0) {
      const normalHeader = document.createElement('div');
      normalHeader.className = 'ability-header';
      normalHeader.textContent = 'Hability';
      this.optionsList.appendChild(normalHeader);
      
      this.abilities.forEach(ability => {
        const abilityData = {
          name: ability.name,
          displayName: this.formatAbilityName(ability.name),
          isHidden: false
        };
        
        this.currentOptions.push(abilityData);
        
        const option = document.createElement('div');
        option.className = 'pokemon-option';
        option.textContent = abilityData.displayName;
        option.dataset.ability = ability.name;
        option.dataset.isHidden = 'false';
        
        option.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.selectAbility(abilityData);
        });
        
        this.optionsList.appendChild(option);
      });
    }
    
    if (this.hiddenAbility) {
      const hiddenHeader = document.createElement('div');
      hiddenHeader.className = 'ability-header hidden';
      hiddenHeader.textContent = 'Hidden Ability';
      this.optionsList.appendChild(hiddenHeader);
      
      const abilityData = {
        name: this.hiddenAbility.name,
        displayName: this.formatAbilityName(this.hiddenAbility.name),
        isHidden: true
      };
      
      this.currentOptions.push(abilityData);
      
      const option = document.createElement('div');
      option.className = 'pokemon-option hidden';
      option.textContent = abilityData.displayName;
      option.dataset.ability = this.hiddenAbility.name;
      option.dataset.isHidden = 'true';
      
      option.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.selectAbility(abilityData);
      });
      
      this.optionsList.appendChild(option);
    }
  }
  
  filterOptions(searchTerm) {
    const searchLower = searchTerm.toLowerCase().trim();
    
    this.optionsList.querySelectorAll('.pokemon-option').forEach(option => {
      const abilityName = option.textContent.toLowerCase();
      if (!searchTerm || abilityName.includes(searchLower)) {
        option.style.display = 'block';
      } else {
        option.style.display = 'none';
      }
    });
    
    const headers = this.optionsList.querySelectorAll('.ability-header');
    headers.forEach(header => {
      const isHiddenHeader = header.classList.contains('hidden');
      const relatedOptions = this.optionsList.querySelectorAll(
        isHiddenHeader ? '.pokemon-option.hidden' : '.pokemon-option:not(.hidden)'
      );
      
      const hasVisibleOptions = Array.from(relatedOptions).some(opt => 
        opt.style.display !== 'none'
      );
      
      header.style.display = hasVisibleOptions ? 'block' : 'none';
    });
  }
  
  formatAbilityName(abilityName) {
    return abilityName
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  
  selectAbility(abilityData) {
    this.selectedValue = abilityData.displayName;
    this.selectedAbility = abilityData;
    
    const hiddenInput = document.getElementById('Habilidade');
    if (hiddenInput) {
      hiddenInput.value = abilityData.displayName;
    }
    
    const hiddenCheckbox = document.getElementById('HiddenHabilidade');
    if (hiddenCheckbox) {
      hiddenCheckbox.checked = abilityData.isHidden;
      console.log('Checkbox HiddenHabilidade setado para:', abilityData.isHidden);
      console.log('Ability selecionada:', abilityData.displayName, 'isHidden:', abilityData.isHidden);
    }
    
    this.placeholderElement.textContent = abilityData.displayName + (abilityData.isHidden ? ' (Hidden)' : '');
    this.placeholderElement.classList.remove('pokemon-select-placeholder');
    this.placeholderElement.classList.add('pokemon-select-selected');
    
    this.optionsList.querySelectorAll('.pokemon-option').forEach(opt => {
      opt.classList.remove('selected');
    });
    
    const selectedOption = this.optionsList.querySelector(`[data-ability="${abilityData.name}"]`);
    if (selectedOption) {
      selectedOption.classList.add('selected');
    }
    
    this.close();
  }
  
  updatePlaceholder() {
    if (this.abilities.length === 0 && !this.hiddenAbility) {
      this.placeholderElement.textContent = 'Nenhuma habilidade encontrada';
    } else {
      this.placeholderElement.textContent = 'Selecione uma habilidade...';
    }
  }
  
  showError(message) {
    this.placeholderElement.textContent = message;
    this.abilities = [];
    this.hiddenAbility = null;
    this.currentOptions = [];
  }
  
  reset() {
    this.currentPokemon = null;
    this.abilities = [];
    this.hiddenAbility = null;
    this.currentOptions = [];
    this.selectedValue = '';
    this.selectedAbility = null;
    
    const hiddenInput = document.getElementById('Habilidade');
    if (hiddenInput) hiddenInput.value = '';
    
    const hiddenCheckbox = document.getElementById('HiddenHabilidade');
    if (hiddenCheckbox) hiddenCheckbox.checked = false;
    
    this.placeholderElement.textContent = 'Selecione um Pokémon primeiro';
    this.placeholderElement.classList.add('pokemon-select-placeholder');
    this.placeholderElement.classList.remove('pokemon-select-selected');
    
    this.optionsList.innerHTML = '';
    this.close();
  }
  
  destroy() {
    if (this.boundDocumentClickHandler) {
      document.removeEventListener('click', this.boundDocumentClickHandler, true);
    }
  }
}

class PokemonSelect {
  constructor(element) {
    this.element = element;
    this.trigger = element.querySelector('.pokemon-select-trigger');
    this.optionsContainer = element.querySelector('.pokemon-select-options');
    this.searchInput = element.querySelector('.pokemon-search-input');
    this.optionsList = element.querySelector('.pokemon-options-list');
    this.placeholderElement = element.querySelector('.pokemon-select-placeholder');
    
    this.selectedValue = '';
    this.selectedPokemon = null;
    this.isOpen = false;
    this.boundDocumentClickHandler = null;
    this.currentOptions = [];
    
    this.init();
  }
  
  async init() {
    this.showLoading();
    
    try {
      await window.pokemonAPI.loadPokemonList();
      this.createOptions();
      this.bindEvents();
      this.hideLoading();
    } catch (error) {
      this.showError();
    }
  }

  showLoading() {
    this.optionsList.innerHTML = '<div class="pokemon-loading">Carregando Pokémon...</div>';
  }

  showError() {
    this.optionsList.innerHTML = '<div class="pokemon-error">Erro ao carregar Pokémon</div>';
  }

  hideLoading() {
  }
  
  createOptions() {
    this.optionsList.innerHTML = '';
    this.currentOptions = window.pokemonAPI.getAllPokemon();
    
    this.currentOptions.forEach(pokemon => {
      const option = document.createElement('div');
      option.className = 'pokemon-option';
      option.innerHTML = `
        <span class="pokemon-name">${pokemon.name}</span>
        <span class="pokemon-id">#${pokemon.id.toString().padStart(3, '0')}</span>
      `;
      option.dataset.value = pokemon.name;
      option.dataset.originalName = pokemon.originalName;
      
      option.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.selectOption(pokemon);
      });
      
      this.optionsList.appendChild(option);
    });
  }
  
  bindEvents() {
    this.trigger.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.toggle();
    });
    
    this.trigger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.toggle();
      } else if (e.key === 'Escape') {
        this.close();
      }
    });
    
    this.searchInput.addEventListener('input', (e) => {
      this.filterOptions(e.target.value);
    });
   
    this.searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        this.close();
      }
      e.stopPropagation();
    });
   
    this.searchInput.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
    });

    this.optionsContainer.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }
  
  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }
  
  open() {
    if (this.isOpen) return;
    
    this.isOpen = true;
    this.trigger.classList.add('active');
    this.optionsContainer.classList.add('active');
    
    this.boundDocumentClickHandler = (e) => {
      if (!this.element.contains(e.target)) {
        this.close();
      }
    };
    
    setTimeout(() => {
      document.addEventListener('click', this.boundDocumentClickHandler, true);
      this.searchInput.focus();
    }, 50);
    
    this.searchInput.value = '';
    this.filterOptions('');
  }
  
  close() {
    if (!this.isOpen) return;
    
    this.isOpen = false;
    this.trigger.classList.remove('active');
    this.optionsContainer.classList.remove('active');
    
    if (this.boundDocumentClickHandler) {
      document.removeEventListener('click', this.boundDocumentClickHandler, true);
      this.boundDocumentClickHandler = null;
    }
    
    if (document.activeElement === this.searchInput) {
      this.trigger.focus();
    }
  }
  
  selectOption(pokemon) {
    this.selectedValue = pokemon.name;
    this.selectedPokemon = pokemon;
    
    this.placeholderElement.textContent = pokemon.name;
    this.placeholderElement.classList.remove('pokemon-select-placeholder');
    this.placeholderElement.classList.add('pokemon-select-selected');
    
    const nomeInput = document.getElementById("NomeDosPoke");
    if (nomeInput) {
      nomeInput.value = pokemon.name;
    }
    
    this.optionsList.querySelectorAll('.pokemon-option').forEach(opt => {
      opt.classList.remove('selected');
      if (opt.dataset.value === pokemon.name) {
        opt.classList.add('selected');
      }
    });
    
    this.close();
    
    this.element.dispatchEvent(new CustomEvent('pokemonSelected', {
      detail: { pokemon: pokemon }
    }));
    
    if (window.abilitySelectInstance) {
      window.abilitySelectInstance.loadAbilities(pokemon.originalName);
    }
  }
  
  filterOptions(searchTerm) {
    if (!searchTerm.trim()) {
      this.currentOptions = window.pokemonAPI.getAllPokemon();
    } else {
      this.currentOptions = window.pokemonAPI.searchPokemon(searchTerm);
    }

    this.optionsList.innerHTML = '';
    
    if (this.currentOptions.length === 0) {
      const noResults = document.createElement('div');
      noResults.className = 'pokemon-no-results';
      noResults.style.padding = '15px';
      noResults.style.textAlign = 'center';
      noResults.style.color = '#666';
      noResults.innerHTML = `
        <p>Nenhum Pokémon encontrado para "${searchTerm}"</p>
        <small>Tente um nome diferente ou verifique a ortografia</small>
      `;
      this.optionsList.appendChild(noResults);
      return;
    }

    const limitedOptions = this.currentOptions.slice(0, 50);
    
    limitedOptions.forEach(pokemon => {
      const option = document.createElement('div');
      option.className = 'pokemon-option';
      option.innerHTML = `
        <span class="pokemon-name">${pokemon.name}</span>
        <span class="pokemon-id">#${pokemon.id.toString().padStart(3, '0')}</span>
      `;
      option.dataset.value = pokemon.name;
      option.dataset.originalName = pokemon.originalName;
      
      option.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.selectOption(pokemon);
      });
      
      this.optionsList.appendChild(option);
    });

    if (this.currentOptions.length > 50) {
      const moreResults = document.createElement('div');
      moreResults.className = 'pokemon-more-results';
      moreResults.style.padding = '10px';
      moreResults.style.textAlign = 'center';
      moreResults.style.color = '#666';
      moreResults.style.fontStyle = 'italic';
      moreResults.textContent = `... e mais ${this.currentOptions.length - 50} resultados. Continue digitando para refinar.`;
      this.optionsList.appendChild(moreResults);
    }
  }
  
  getValue() {
    return this.selectedValue;
  }

  getSelectedPokemon() {
    return this.selectedPokemon;
  }
  
  reset() {
    this.selectedValue = '';
    this.selectedPokemon = null;
    this.placeholderElement.textContent = 'Selecione um Pokémon...';
    this.placeholderElement.classList.add('pokemon-select-placeholder');
    this.placeholderElement.classList.remove('pokemon-select-selected');
    
    const nomeInput = document.getElementById("NomeDosPoke");
    if (nomeInput) {
      nomeInput.value = '';
    }
    
    this.optionsList.querySelectorAll('.pokemon-option').forEach(opt => {
      opt.classList.remove('selected');
    });
    
    if (this.isOpen) {
      this.close();
    }
  }
  
  destroy() {
    if (this.boundDocumentClickHandler) {
      document.removeEventListener('click', this.boundDocumentClickHandler, true);
    }
  }
}

let senhaAdmGlobal = "";  
let webhookUrlGlobal = "";
let ultimoPedidoTimestamp = 0;
const COOLDOWN_PEDIDOS = 10000;

let sistemaAberto = false;

const palavrasProibidas = [
  'porra', 'merda', 'caralho', 'buceta', 'puta', 'vadia', 'fdp', 'cuzao', 'pqp',
  'vsf', 'putaria', 'cacete', 'inferno', 'droga', 'maldito', 'desgraça',
  'idiota', 'imbecil', 'retardado', 'burro', 'estupido', 'babaca', 'otario',
  'filho da puta', 'safado', 'vagabundo', 'corno', 'viado',
  'maconha', 'cocaina', 'sexo', 'transar', 'foder', 'gay', 'bicha', 'nazista', 'hitler'
];

let contadorEventoSecreto = 0;

function verificarEventoSecreto() {
  contadorEventoSecreto++;
  
  if (contadorEventoSecreto >= 1000) {
    contadorEventoSecreto = 0;
    return { ativado: true, tipo: 'pity' };
  }

  const chance = Math.floor(Math.random() * 1000) + 1;
  return chance === 1;
}

function executarEventoSecreto() {
  alert("Uma besta das sombras aparece em sua frente");
  
  const imagemEvento = document.createElement('div');
  imagemEvento.id = 'eventoSecreto';
  
  const img = document.createElement('img');
  img.src = 'img/Umbreon_Secreto.png'; 
  
  img.onerror = function() {
    img.className = 'shadow-beast-placeholder';
    img.alt = 'BESTA DAS SOMBRAS';
  };
  
  imagemEvento.appendChild(img);
  document.body.appendChild(imagemEvento);
  
  setTimeout(() => {
    alert("Parabéns, umbreon escolheu você como ganhador de um prêmio! Marque @heichurr para receber seu prêmio! (lembrando que só aceitarei a primeira pessoa que mandar)");
    
    setTimeout(() => {
      if (document.getElementById('eventoSecreto')) {
        document.getElementById('eventoSecreto').remove();
      }
    }, 1000);
  }, 3000);
}

function normalizarNome(nome) {
  if (!nome || typeof nome !== 'string') return '';
  
  return nome
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

async function encontrarPokemonExato(nomeDigitado) {
  try {
    if (!window.pokemonAPI.isLoaded) {
      await window.pokemonAPI.loadPokemonList();
    }
    
    const pokemon = window.pokemonAPI.findExactPokemon(nomeDigitado);
    
    if (pokemon) {
      return { encontrado: true, pokemon: pokemon.name };
    }
    
    return { encontrado: false };
  } catch (error) {
    return { encontrado: false };
  }
}

function verificarNomeImpropio(nome) {
  if (!nome || typeof nome !== 'string') return false;
  
  const nomeNormalizado = nome.toLowerCase().replace(/[^\w\s]/g, '').trim();
  
  return palavrasProibidas.some(palavra => 
    nomeNormalizado.includes(palavra.toLowerCase())
  );
}

async function validarNomePokemon(nomeDigitado) {
  if (!nomeDigitado || nomeDigitado.trim() === '') {
    return { valido: false, tipo: 'vazio', mensagem: 'Digite o nome de um Pokémon' };
  }
  
  if (verificarNomeImpropio(nomeDigitado)) {
    return { 
      valido: false, 
      tipo: 'improprio', 
      mensagem: 'Nome impróprio detectado!' 
    };
  }
  
  const resultado = await encontrarPokemonExato(nomeDigitado);
  
  if (resultado.encontrado) {
    const isLegendary = window.pokemonAPI.isPokemonLegendary(nomeDigitado);
    if (isLegendary) {
      return {
        valido: false,
        tipo: 'legendario',
        mensagem: 'Pokémon Lendários e Míticos não estão disponíveis para compra!'
      };
    }
    
    return { 
      valido: true, 
      tipo: 'exato', 
      pokemon: resultado.pokemon
    };
  } else {
    return { 
      valido: false, 
      tipo: 'naoEncontrado', 
      mensagem: `"${nomeDigitado}" não foi encontrado na PokeAPI!\n\nTem certeza que deseja continuar?` 
    };
  }
}

function verificarCooldown() {
  const tempoRestante = COOLDOWN_PEDIDOS - (Date.now() - ultimoPedidoTimestamp);
  
  if (tempoRestante > 0) {
    return {
      emCooldown: true,
      segundosRestantes: Math.ceil(tempoRestante / 1000)
    };
  }
  
  return { emCooldown: false, segundosRestantes: 0 };
}

function analisarIVsUnificado(inputIvs) {
  if (!inputIvs || inputIvs.trim() === '') {
    return {
      valido: false,
      mensagem: `Campo IVs é obrigatório!

Formatos aceitos:
IVs Zerados (afetam preço): 0atk, 0spe, 0hp, etc.
Informações adicionais: -atk, -spe, -hp, etc.

Exemplos:
• F5 = F5 por 70k
• F5, -atk = F5 por 70k (só informativo)  
• F5, 0atk = F6 por 90k (upgrade por IV zerado)
• F4, 0atk, 0spe = F6 por 90k (upgrade por 2 IVs zerados)`
    };
  }

  const partes = inputIvs.split(',').map(parte => parte.trim()).filter(parte => parte !== '');
  
  let tipoIV = null;
  const statsZerados = [];
  const informacoesAdicionais = [];
  const erros = [];

  for (const parte of partes) {
    const parteUpper = parte.toUpperCase();
    
    if (/^F[2-6]$/.test(parteUpper)) {
      if (tipoIV !== null) {
        erros.push(`Apenas um tipo de IV é permitido`);
      } else {
        tipoIV = parteUpper;
      }
    } 
    else if (/^0(hp|atk|def|spa|spd|spe|attack|defense|special|speed)$/i.test(parte.toLowerCase())) {
      const statNormalizado = parte.toLowerCase()
        .replace('attack', 'atk')
        .replace('defense', 'def')
        .replace('special', 'spa')
        .replace('speed', 'spe');
      
      if (!statsZerados.includes(statNormalizado)) {
        statsZerados.push(statNormalizado);
      }
    } 
    else if (/^-(hp|atk|def|spa|spd|spe|attack|defense|special|speed)$/i.test(parte.toLowerCase())) {
      let statNormalizado = parte.toLowerCase()
        .replace('attack', 'atk')
        .replace('defense', 'def') 
        .replace('special', 'spa')
        .replace('speed', 'spe');
      
      if (!informacoesAdicionais.includes(statNormalizado)) {
        informacoesAdicionais.push(statNormalizado);
      }
    } 
    else {
      erros.push(`"${parte}" não é um formato válido`);
    }
  }

  if (!tipoIV) {
    erros.push("É obrigatório especificar um tipo de IV (F2-F6)");
  }

  if (erros.length > 0) {
    return { 
      valido: false, 
      mensagem: `Erros encontrados: ${erros.join(', ')}

Formatos corretos: (LEMBRANDO É NECESSÁRIO SEPARAR POR VIRGULA!! 
EXEMPLO: F5, 0atk  |se for dois ivs zerados: F4, 0atk, 0spe)
• Tipos IV:F2, F3, F4, F5, F6
• IVs zerados: 0atk, 0spe, 0hp, etc. (afetam preço)
• Informações:-atk, -spe, -hp, etc. (apenas informativo)`
    };
  }

  return {
    valido: true,
    tipoIV: tipoIV,
    statsZerados: statsZerados, 
    informacoesAdicionais: informacoesAdicionais, 
    qtdStatsZerados: statsZerados.length 
  }
}

function calcularPrecoIVs(dadosIVs) {
  if (!dadosIVs.valido) return { 
    preco: 0, 
    tipoFinal: '', 
    foiUpgradado: false,
    detalhesUpgrade: ''
  };

  let tipoIVFinal = dadosIVs.tipoIV;
  const qtdZerados = dadosIVs.qtdStatsZerados; 
  const tipoOriginal = dadosIVs.tipoIV;

  if (tipoIVFinal === 'F4') {
    if (qtdZerados >= 2) {
      tipoIVFinal = 'F6';
    } else if (qtdZerados === 1) {
      tipoIVFinal = 'F5';
    }
  } else if (tipoIVFinal === 'F5' && qtdZerados >= 1) {
    tipoIVFinal = 'F6';
  }

  const precos = { F6: 90000, F5: 70000, F4: 40000, F3: 30000, F2: 25000 };
  const foiUpgradado = tipoIVFinal !== tipoOriginal;
  
  let detalhesUpgrade = '';
  if (foiUpgradado) {
    const motivoUpgrade = qtdZerados === 1 ? '1 IV zerado' : `${qtdZerados} IVs zerados`;
    detalhesUpgrade = `Upgrade: ${tipoOriginal} → ${tipoIVFinal} (${motivoUpgrade})`;
  }

  return {
    preco: precos[tipoIVFinal] || 0,
    tipoFinal: tipoIVFinal,
    foiUpgradado: foiUpgradado,
    detalhesUpgrade: detalhesUpgrade
  };
}

function formatarPedidoEstilizado(pedidoData, dadosIVs, calculoIVs) {
  const precoFormatado = pedidoData.precoTotal >= 1000 
    ? `${Math.round(pedidoData.precoTotal / 1000)}.000k`
    : `${pedidoData.precoTotal}k`;

  let linhaIVs = dadosIVs.tipoIV;
  if (calculoIVs.foiUpgradado) {
    linhaIVs += ` → ${calculoIVs.tipoFinal} (upgrade)`;
  }

  let conteudoFormatado = `**Novo Pedido**
Nome do Jogador: ${pedidoData.nomeUsuario}
Nome no Discord: ${pedidoData.nickDiscord}
Pokémon Desejado: ${pedidoData.pokemon}
-----------------------------
Castrado ou Breedável: ${pedidoData.castradoOuBreedavel}
Natureza: ${pedidoData.natureza}
Habilidades: ${pedidoData.habilidades}
Sexo: ${pedidoData.sexo}
IVs Solicitados: ${linhaIVs}`;

  if (pedidoData.ivsZerados && pedidoData.ivsZerados !== "Nenhum") {
    conteudoFormatado += `
IVs Zerados: ${pedidoData.ivsZerados}`;
  }

  if (pedidoData.informacoesAdicionais && pedidoData.informacoesAdicionais !== "Nenhuma") {
    conteudoFormatado += `
Info Adicional: ${pedidoData.informacoesAdicionais} (Como nome diz)`;
  }

  conteudoFormatado += `
Egg Moves: ${pedidoData.eggMoves}
Hidden Habilidade: ${pedidoData.hiddenHabilidade ? "Sim" : "Não"}
-----------------------------
Preço total estimado: ${precoFormatado}`;

  return conteudoFormatado;
}

async function enviarWebhook(conteudo, tentativas = 3) {
  if (!webhookUrlGlobal) return false;

  for (let i = 0; i < tentativas; i++) {
    try {
      const response = await fetch(webhookUrlGlobal, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: conteudo })
      });

      if (response.ok) return true;
      
      if (response.status === 429) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.error(`Erro na tentativa ${i + 1}:`, error);
    }

    if (i < tentativas - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return false;
}

async function carregarConfiguracoes() {
  try {
    const configDoc = await getDoc(doc(db, 'configuracoes', 'admin'));
    if (configDoc.exists()) {
      const data = configDoc.data();
      senhaAdmGlobal = data.senhaAdm || "";
      webhookUrlGlobal = data.webhookUrl || data.webhook_url || "";
    }
  } catch (error) {
    console.error("Erro ao carregar configurações:", error);
  }
}

function obterChaveMesAtual() {
  const agora = new Date();
  return `compradores_${agora.getFullYear()}_${(agora.getMonth() + 1).toString().padStart(2, '0')}`;
}

function obterNomeMesAtual() {
  const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const agora = new Date();
  return `${meses[agora.getMonth()]} ${agora.getFullYear()}`;
}

async function registrarPedido(nomeUsuario) {
  const chaveMes = obterChaveMesAtual();
  
  try {
    const compradorRef = doc(db, 'compradores', chaveMes);
    const compradorDoc = await getDoc(compradorRef);
    
    if (compradorDoc.exists()) {
      const dados = compradorDoc.data();
      const novoValor = (dados[nomeUsuario] || 0) + 1;
      await updateDoc(compradorRef, { [nomeUsuario]: novoValor });
    } else {
      await setDoc(compradorRef, { [nomeUsuario]: 1 });
    }
  } catch (error) {
    console.error("Erro ao registrar pedido:", error);
    throw error;
  }
}

function Aberto() {
  sistemaAberto = true;
  bloquearBotoes();
}

function Fechado() {
  sistemaAberto = false;
  desbloquearBotoes();
}

function verificarSistemaAberto() {
  if (sistemaAberto) {
    alert("Uma operação já está em andamento. Aguarde ou feche a tela atual.");
    return true;
  }
  return false;
}

function bloquearBotoes() {
  const botoesBloqueados = [
    'btnLogin',
    'btnLoginAdm', 
    'btnTabela',
    'btnComprar',
    'btnTopCompradores',
    'btnSobreNos'
  ];
  
  botoesBloqueados.forEach(id => {
    const botao = document.getElementById(id);
    if (botao) {
      botao.disabled = true;
      botao.style.opacity = '0.5';
      botao.style.cursor = 'not-allowed';
      botao.setAttribute('data-bloqueado', 'true');
    }
  });
  
  const botoes = document.querySelectorAll('.botao-principal, .btn-menu, button[onclick*="Fazer"], button[onclick*="Comprar"], button[onclick*="Preços"], button[onclick*="Mostrar"], button[onclick*="Sobre"]');
  botoes.forEach(botao => {
    if (!botao.getAttribute('data-bloqueado')) {
      botao.disabled = true;
      botao.style.opacity = '0.5';
      botao.style.cursor = 'not-allowed';
      botao.setAttribute('data-bloqueado', 'true');
    }
  });
}

function desbloquearBotoes() {
  const botoesBloqueados = [
    'btnLogin',
    'btnLoginAdm',
    'btnTabela', 
    'btnComprar',
    'btnTopCompradores',
    'btnSobreNos'
  ];
  
  botoesBloqueados.forEach(id => {
    const botao = document.getElementById(id);
    if (botao) {
      botao.disabled = false;
      botao.style.opacity = '1';
      botao.style.cursor = 'pointer';
      botao.removeAttribute('data-bloqueado');
    }
  });
  
  const botoes = document.querySelectorAll('button[data-bloqueado="true"]');
  botoes.forEach(botao => {
    botao.disabled = false;
    botao.style.opacity = '1';
    botao.style.cursor = 'pointer';
    botao.removeAttribute('data-bloqueado');
  });
}

function inicializarPokemonSelect() {
  const pokemonSelectElement = document.getElementById('pokemonSelect');
  const abilitySelectElement = document.getElementById('abilitySelect');
  
  if (pokemonSelectElement) {
    if (window.pokemonSelectInstance) {
      window.pokemonSelectInstance.destroy();
      window.pokemonSelectInstance = null;
    }
    
    const isVisible = pokemonSelectElement.offsetParent !== null;
    if (isVisible) {
      window.pokemonSelectInstance = new PokemonSelect(pokemonSelectElement);
      
      pokemonSelectElement.addEventListener('pokemonSelected', (e) => {
        console.log('Pokémon selecionado:', e.detail.pokemon);
      });
    }
  }
  
  if (abilitySelectElement) {
    if (window.abilitySelectInstance) {
      window.abilitySelectInstance.destroy();
      window.abilitySelectInstance = null;
    }
    
    const isVisible = abilitySelectElement.offsetParent !== null;
    if (isVisible) {
      window.abilitySelectInstance = new AbilitySelect(abilitySelectElement);
    }
  }
}

function FazerLogin() {
  if (verificarSistemaAberto()) return;
  
  if (verificarEventoSecreto()) {
    executarEventoSecreto();
    return;
  }
  
  Aberto();
  
  document.getElementById("LoginAdm").style.display = "none";
  document.getElementById("Login").style.display = "flex";
  document.getElementById("TelaLogin").style.display = "flex";
  document.getElementById("Site_Container").style.display = "none";
}

function FazerLoginAdm() {
  if (verificarSistemaAberto()) return;
  
  if (verificarEventoSecreto()) {
    executarEventoSecreto();
    return;
  }
  
  Aberto();
  
  document.getElementById("Login").style.display = "none";
  document.getElementById("LoginAdm").style.display = "flex";
  document.getElementById("TelaLogin").style.display = "flex";
  document.getElementById("Site_Container").style.display = "none";
}

function login() {
  const Nick = document.getElementById("Nickname").value.trim();
  const NickDiscord = document.getElementById("Discord").value.trim();
 
  if (!Nick || !NickDiscord) {
    alert("Por favor, preencha os dois campos!");
    return; 
  }
  
  alert(`Seja bem-vindo ${Nick}!`);
  document.getElementById("TelaLogin").style.display = "none";
  document.getElementById("Site_Container").style.display = "flex";
  Fechado(); 
}

function Comprar() {
  const loginNick = document.getElementById("Nickname")?.value.trim();
  if (!loginNick) {
    alert("Você precisa estar logado para comprar.");
    FazerLogin();
    return;
  }
  
  if (verificarSistemaAberto()) return;
  
  if (verificarEventoSecreto()) {
    executarEventoSecreto();
    return;
  }
  
  const statusCooldown = verificarCooldown();
  if (statusCooldown.emCooldown) {
    alert(`Aguarde ${statusCooldown.segundosRestantes} segundo(s) para fazer um novo pedido.`);
    return;
  }
  
  Aberto();
  
  document.getElementById("Site_Container").style.display = "none";
  document.getElementById("Comprando").style.display = "flex";
  
  setTimeout(() => {
    inicializarPokemonSelect();
  }, 200);
}

function MostrarTopCompradores() {
  if (verificarSistemaAberto()) return;
  
  Aberto();
  
  document.getElementById("Site_Container").style.display = "none";
  document.getElementById("TopCompradores").style.display = "flex";
  document.getElementById("MesAtual").innerHTML = `<h3>Ranking de ${obterNomeMesAtual()}</h3>`;
  carregarTopCompradores();
}

async function carregarTopCompradores() {
  const listaCompradores = document.getElementById("ListaCompradores");
  listaCompradores.innerHTML = "<p>Carregando dados...</p>";
  
  try {
    const compradorRef = doc(db, 'compradores', obterChaveMesAtual());
    const compradorDoc = await getDoc(compradorRef);
    
    let compradores = {};
    if (compradorDoc.exists()) {
      compradores = compradorDoc.data();
    }
    
    if (Object.keys(compradores).length === 0) {
      listaCompradores.innerHTML = "<p>Ainda não há compradores este mês!</p>";
      return;
    }
    
    const compradoresOrdenados = Object.entries(compradores)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);
    
    let html = '<div class="ranking-lista">';
    
    compradoresOrdenados.forEach(([nome, pedidos], index) => {
      const posicao = index + 1;
      const emoji = posicao === 1 ? '🥇' : posicao === 2 ? '🥈' : posicao === 3 ? '🥉' : `${posicao}º`;
      
      html += `
        <div class="comprador-item">
          <span class="posicao">${emoji}</span>
          <span class="nome">${nome}</span>
          <span class="pedidos">${pedidos} pedido${pedidos > 1 ? 's' : ''}</span>
        </div>
      `;
    });
    
    html += '</div>';
    listaCompradores.innerHTML = html;
    
  } catch (error) {
    console.error("Erro ao carregar compradores:", error);
    listaCompradores.innerHTML = "<p>Erro ao carregar dados.</p>";
  }
}

function Preços() {
  if (verificarSistemaAberto()) return;
  
  Aberto();
  
  document.getElementById("Tabela").style.display = "flex";
  document.getElementById("Site_Container").style.display = "none";
}

function SobreNos() {
  if (verificarSistemaAberto()) return;
  
  alert("Em construção...");
}

function Fechar() {
  document.getElementById("TelaLogin").style.display = "none";
  document.getElementById("Site_Container").style.display = "flex";
  Fechado();
}

function VoltarParaSite() {
  if (window.pokemonSelectInstance) {
    window.pokemonSelectInstance.destroy();
    window.pokemonSelectInstance = null;
  }
  
  if (window.abilitySelectInstance) {
    window.abilitySelectInstance.destroy();
    window.abilitySelectInstance = null;
  }
  
  document.getElementById("Comprando").style.display = "none";
  document.getElementById("Site_Container").style.display = "flex";
  Fechado();
}

function FecharTopCompradores() {
  document.getElementById("TopCompradores").style.display = "none";
  document.getElementById("Site_Container").style.display = "flex";
  Fechado();
}

function FecharTabela() {
  document.getElementById("Tabela").style.display = "none";
  document.getElementById("Site_Container").style.display = "flex";
  Fechado();
}

async function EnviarPedido() {
  const btnEnviar = document.querySelector('button[onclick="EnviarPedido()"]') || 
                   document.querySelector('#Comprando button') ||
                   document.querySelector('button[type="submit"]');
  
  if (!btnEnviar) {
    alert('Erro: Botão de envio não encontrado.');
    return;
  }

  try {
    const statusCooldown = verificarCooldown();
    if (statusCooldown.emCooldown) {
      alert(`Aguarde ${statusCooldown.segundosRestantes} segundo(s) antes de fazer outro pedido!`);
      return;
    }

    let pokeNome = '';
    if (window.pokemonSelectInstance) {
      pokeNome = window.pokemonSelectInstance.getValue();
    }
    
    if (!pokeNome) {
      const nomeInput = document.getElementById("NomeDosPoke");
      if (nomeInput) {
        pokeNome = nomeInput.value.trim();
      }
    }
    
    const nomeUsuario = document.getElementById("Nickname")?.value?.trim();
    const NickDiscord = document.getElementById("Discord")?.value?.trim();

    if (!nomeUsuario || !NickDiscord) {
      alert('Por favor, verifique se você está logado corretamente.');
      return;
    }

    if (!pokeNome) {
      alert("Por favor, selecione ou digite o nome de um Pokémon.");
      return;
    }

    btnEnviar.textContent = "Validando...";
    btnEnviar.disabled = true;

    const validacaoPokemon = await Promise.race([
      validarNomePokemon(pokeNome),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout na validação')), 10000)
      )
    ]);
    
    if (!validacaoPokemon.valido) {
      if (validacaoPokemon.tipo === 'improprio') {
        alert(validacaoPokemon.mensagem);
        return;
      } else if (validacaoPokemon.tipo === 'legendario') {
        alert(validacaoPokemon.mensagem);
        return;
      } else if (validacaoPokemon.tipo === 'naoEncontrado') {
        const continuar = confirm(validacaoPokemon.mensagem);
        if (!continuar) return;
      }
    }

    btnEnviar.textContent = "Analisando IVs...";
    
    const ivsInput = document.getElementById("Ivs")?.value?.trim() || '';
    const dadosIVs = analisarIVsUnificado(ivsInput);
    
    if (!dadosIVs.valido) {
      alert(dadosIVs.mensagem);
      return;
    }

    btnEnviar.textContent = "Calculando preços...";
    
    const calculoIVs = calcularPrecoIVs(dadosIVs);
    const castradoOuBreedavel = document.getElementById("CastradoOuBreedavel")?.value?.trim()?.toLowerCase() || '';
    const precoBreedavel = (castradoOuBreedavel === "breedavel" || castradoOuBreedavel === "breedável") ? 10000 : 0;
    const hiddenHabilidade = document.getElementById("HiddenHabilidade")?.checked || false;
    const precoHidden = hiddenHabilidade ? 15000 : 0;
    
    const eggMovesStr = document.getElementById("EggMoves")?.value?.trim() || '';
    let precoEggMoves = 0;
    if (eggMovesStr && eggMovesStr.toLowerCase() !== "nenhum" && eggMovesStr !== "-") {
      const eggMovesArray = eggMovesStr.split(",").map(em => em.trim()).filter(em => em.length > 0);
      precoEggMoves = eggMovesArray.length * 10000;
    }

    const precoTotal = calculoIVs.preco + precoBreedavel + precoHidden + precoEggMoves;
    const nomeParaPedido = validacaoPokemon.valido ? validacaoPokemon.pokemon : pokeNome;

    console.log('Debug HA - Checkbox checked:', hiddenHabilidade);
    console.log('Debug HA - Ability selected:', document.getElementById("Habilidade")?.value);

    const pedidoData = {
      nomeUsuario,
      nickDiscord: NickDiscord,
      pokemon: nomeParaPedido,
      castradoOuBreedavel: castradoOuBreedavel || "não informado",
      natureza: document.getElementById("Nature")?.value || "não selecionada",
      habilidades: document.getElementById("Habilidade")?.value || "não informado",
      sexo: document.getElementById("GeneroDoPoke")?.value || "não informado",
      ivsSolicitados: dadosIVs.tipoIV,
      ivsZerados: dadosIVs.statsZerados.join(', ') || "Nenhum",
      informacoesAdicionais: dadosIVs.informacoesAdicionais.join(', ') || "Nenhuma",
      ivsFinal: calculoIVs.tipoFinal,
      ivsUpgradado: calculoIVs.foiUpgradado,
      detalhesUpgrade: calculoIVs.detalhesUpgrade || "",
      eggMoves: eggMovesStr || "não informado",
      hiddenHabilidade,
      precoTotal,
      timestamp: new Date(),
      status: "pendente"
    };

    const previewFormatado = formatarPedidoEstilizado(pedidoData, dadosIVs, calculoIVs);
    
    btnEnviar.textContent = "Aguardando confirmação...";
    
    const confirmarPedido = confirm(`${previewFormatado}

Confirma este pedido?`);
    
    if (!confirmarPedido) {
      return;
    }

    btnEnviar.textContent = "Salvando pedido...";
    
    await Promise.race([
      addDoc(collection(db, 'pedidos'), pedidoData),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout ao salvar')), 15000)
      )
    ]);

    btnEnviar.textContent = "Atualizando ranking...";
    
    await Promise.race([
      registrarPedido(nomeUsuario),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout no ranking')), 10000)
      )
    ]);

    btnEnviar.textContent = "Enviando notificação...";
    
    try {
      const webhookSucesso = await Promise.race([
        enviarWebhook(previewFormatado),
        new Promise(resolve => setTimeout(() => resolve(false), 8000))
      ]);
    } catch (webhookError) {
      console.warn('Erro no webhook:', webhookError);
    }

    ultimoPedidoTimestamp = Date.now();
    
    alert(`Pedido enviado com sucesso!

Seu pokémon já está em preparação, assim que ficar pronto, te notificamos para retirar na loja. Agradecemos a preferência!

- Pokémon: ${nomeParaPedido}
- IVs: ${dadosIVs.tipoIV}${calculoIVs.foiUpgradado ? ` → ${calculoIVs.tipoFinal} (Upgrade!)` : ''}
- Preço total: ${Math.round(precoTotal/1000)}k`);

    limparFormulario();

  } catch (error) {
    console.error('Erro ao processar pedido:', error);
    
    let mensagemErro = "Erro ao processar pedido. Tente novamente.";
    
    if (error.message.includes('Timeout')) {
      mensagemErro = "Operação demorou muito. Verifique sua conexão e tente novamente.";
    } else if (error.message.includes('Firebase')) {
      mensagemErro = "Erro de conexão com o banco de dados. Tente novamente.";
    } else if (error.message.includes('Pokemon')) {
      mensagemErro = "Erro ao validar Pokémon. Verifique o nome e tente novamente.";
    }
    
    alert(mensagemErro);
    
  } finally {
    if (btnEnviar) {
      btnEnviar.textContent = "Enviar Pedido";
      btnEnviar.disabled = false;
    }
  }
}

function limparFormulario() {
  try {
    if (window.pokemonSelectInstance) {
      window.pokemonSelectInstance.reset();
    }
    
    if (window.abilitySelectInstance) {
      window.abilitySelectInstance.reset();
    }
    
    const campos = [
      "NomeDosPoke",
      "EggMoves", 
      "Nature",
      "Habilidade",
      "GeneroDoPoke",
      "Ivs",
      "CastradoOuBreedavel"
    ];
    
    campos.forEach(id => {
      const elemento = document.getElementById(id);
      if (elemento) {
        elemento.value = "";
      }
    });
    
    const hiddenCheckbox = document.getElementById("HiddenHabilidade");
    if (hiddenCheckbox) {
      hiddenCheckbox.checked = false;
    }
    
  } catch (error) {
    console.error('Erro ao limpar formulário:', error);
  }
}

async function testarConexoes() {
  console.log('=== TESTE DE CONEXÕES ===');
  
  try {
    console.log('Testando Firebase...');
    const testDoc = await getDoc(doc(db, 'teste', 'conexao'));
    console.log('Firebase OK');
  } catch (error) {
    console.error('Firebase erro:', error);
  }
  
  try {
    console.log('Testando PokeAPI...');
    await window.pokemonAPI.loadPokemonList();
    console.log('PokeAPI OK');
  } catch (error) {
    console.error('PokeAPI erro:', error);
  }
  
  if (webhookUrlGlobal) {
    try {
      console.log('Testando Webhook...');
      const testeWebhook = await enviarWebhook('Teste de conexão');
      console.log('Webhook:', testeWebhook ? 'OK' : 'FALHOU');
    } catch (error) {
      console.error('Webhook erro:', error);
    }
  } else {
    console.warn('Webhook URL não configurada');
  }
  
  console.log('=== FIM DOS TESTES ===');
}

function testarSistemaIVs() {
  const testes = [
    "F5",
    "F5, -atk",
    "F5, 0atk", 
    "F4, -atk, -spe",
    "F4, 0atk, 0spe",
    "F4, 0atk, -spe"
  ];
  
  console.log('TESTE DO SISTEMA DE IVS');
  
  testes.forEach(teste => {
    const resultado = analisarIVsUnificado(teste);
    if (resultado.valido) {
      const calculo = calcularPrecoIVs(resultado);
      const precoComHA = calculo.preco + 15000;
      console.log(`Input: "${teste}"
Resultado: ${resultado.tipoIV}${calculo.foiUpgradado ? ` → ${calculo.tipoFinal}` : ''}
Preço base: ${calculo.preco.toLocaleString('pt-BR')}
Preço + HA: ${precoComHA.toLocaleString('pt-BR')} (+15k)
IVs Zerados: [${resultado.statsZerados.join(', ') || 'nenhum'}]
Informativos: [${resultado.informacoesAdicionais.join(', ') || 'nenhum'}]
Explicação: ${calculo.foiUpgradado ? calculo.detalhesUpgrade : 'Sem upgrade'}
---`);
    } else {
      console.log(`Input: "${teste}" - ERRO: ${resultado.mensagem}`);
    }
  });
}

(async function inicializar() {
  await carregarConfiguracoes();
  
  const comprandoSection = document.getElementById("Comprando");
  const topCompradoresSection = document.getElementById("TopCompradores");
  
  if (comprandoSection) comprandoSection.style.display = "none";
  if (topCompradoresSection) topCompradoresSection.style.display = "none";
  
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
        const target = mutation.target;
        if (target.id === 'Comprando') {
          const isHidden = target.style.display === 'none';
          if (isHidden && window.pokemonSelectInstance) {
            window.pokemonSelectInstance.destroy();
            window.pokemonSelectInstance = null;
          }
        }
      }
    });
  });

  const comprandoElement = document.getElementById('Comprando');
  if (comprandoElement) {
    observer.observe(comprandoElement, {
      attributes: true,
      attributeFilter: ['style']
    });
  }

  try {
    await window.pokemonAPI.loadPokemonList();
  } catch (error) {
    console.warn('Erro ao pré-carregar lista:', error);
  }

  Fechado();
})();

window.Aberto = Aberto;
window.Fechado = Fechado;
window.verificarSistemaAberto = verificarSistemaAberto;
window.Comprar = Comprar;
window.Preços = Preços;
window.login = login;
window.FazerLogin = FazerLogin;
window.FazerLoginAdm = FazerLoginAdm;
window.SobreNos = SobreNos;
window.Fechar = Fechar;
window.MostrarTopCompradores = MostrarTopCompradores;
window.FecharTopCompradores = FecharTopCompradores;
window.VoltarParaSite = VoltarParaSite;
window.FecharTabela = FecharTabela;
window.EnviarPedido = EnviarPedido;
window.formatarPedidoEstilizado = formatarPedidoEstilizado;
window.testarSistemaIVs = testarSistemaIVs;
window.testarConexoes = testarConexoes;