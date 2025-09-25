// Configuração do Firebase
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

// ==================== POKEMON API INTEGRATION ====================

class PokemonAPIManager {
  constructor() {
    this.pokemonList = [];
    this.pokemonDetails = new Map();
    this.isLoading = false;
    this.isLoaded = false;
    this.loadPromise = null;
    
    // Lista completa de IDs de Pokémon Lendários e Míticos
    this.legendaryIds = new Set([
      // Gen 1 - Lendários e Míticos
      144, 145, 146, 150, 151, // Articuno, Zapdos, Moltres, Mewtwo, Mew
      
      // Gen 2 - Lendários e Míticos
      243, 244, 245, 249, 250, 251, // Raikou, Entei, Suicune, Lugia, Ho-Oh, Celebi
      
      // Gen 3 - Lendários e Míticos
      377, 378, 379, 380, 381, 382, 383, 384, 385, 386, // Regirock, Regice, Registeel, Latias, Latios, Kyogre, Groudon, Rayquaza, Jirachi, Deoxys
      
      // Gen 4 - Lendários e Míticos
      480, 481, 482, 483, 484, 485, 486, 487, 488, 489, 490, 491, 492, 493, // Uxie, Mesprit, Azelf, Dialga, Palkia, Heatran, Regigigas, Giratina, Cresselia, Phione, Manaphy, Darkrai, Shaymin, Arceus
      
      // Gen 5 - Lendários e Míticos
      494, 638, 639, 640, 641, 642, 643, 644, 645, 646, 647, 648, 649, // Victini, Cobalion, Terrakion, Virizion, Tornadus, Thundurus, Reshiram, Zekrom, Landorus, Kyurem, Keldeo, Meloetta, Genesect
      
      // Gen 6 - Lendários e Míticos
      716, 717, 718, 719, 720, 721, // Xerneas, Yveltal, Zygarde, Diancie, Hoopa, Volcanion
      
      // Gen 7 - Lendários e Míticos
      785, 786, 787, 788, 789, 790, 791, 792, 800, 801, 802, 807, 808, 809, // Tapu Koko, Tapu Lele, Tapu Bulu, Tapu Fini, Cosmog, Cosmoem, Solgaleo, Lunala, Necrozma, Magearna, Marshadow, Zeraora
      
      // Gen 8 - Lendários e Míticos
      888, 889, 890, 891, 892, 893, 894, 895, 896, 897, 898, // Zacian, Zamazenta, Eternatus, Kubfu, Urshifu, Regieleki, Regidrago, Glastrier, Spectrier, Calyrex, Zarude
      
      // Gen 9 - Lendários e Míticos
      1007, 1008, 1009, 1010, 1011, 1012, 1013, 1014, 1015, 1016, 1017, 1018, 1019, 1020, 1021, 1022, 1023, 1024, 1025 // Koraidon, Miraidon, Walking Wake, Iron Leaves, Okidogi, Munkidori, Fezandipiti, Ogerpon, Archaludon, Hydrapple, Gouging Fire, Raging Bolt, Iron Boulder, Iron Crown, Terapagos, Pecharunt
    ]);
  }

  // Carrega a lista completa de Pokémon da PokeAPI
  //AAAAAAAAAAAAAAAAAAAAAAAAA
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
      console.log('🔄 Carregando Pokémon da PokeAPI...');
      
      const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=2000');
      if (!response.ok) throw new Error('Falha ao buscar lista da PokeAPI');
      
      const data = await response.json();
      
      // Filtrar Pokémon removendo lendários e míticos
      this.pokemonList = data.results
        .map(pokemon => {
          const id = this._extractIdFromUrl(pokemon.url);
          
          // Formatar nomes: primeira letra maiúscula, substituir hífens por espaços
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
          // ★ AQUI REMOVE TODOS OS LENDÁRIOS E MÍTICOS ★
          return !this.legendaryIds.has(pokemon.id);
        });
      
      // Ordenar por ID para manter ordem das gerações
      this.pokemonList.sort((a, b) => a.id - b.id);
      
      this.isLoaded = true;
      this.isLoading = false;
      
      console.log(`✅ ${this.pokemonList.length} Pokémon carregados com sucesso! (Lendários removidos)`);
      
    } catch (error) {
      console.error('❌ Erro ao carregar PokeAPI:', error);
      this.isLoading = false;
      
      // Fallback para lista básica (também sem lendários)
      this.pokemonList = this._getFallbackList();
      this.isLoaded = true;
      
      console.log('⚠️ Usando lista de fallback com Pokémon básicos');
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

  // Busca Pokémon por nome (busca parcial)
  searchPokemon(query) {
    if (!query || !this.isLoaded) return [];
    
    const searchTerm = this._normalize(query);
    
    return this.pokemonList.filter(pokemon => {
      const pokemonName = this._normalize(pokemon.name);
      const pokemonOriginal = this._normalize(pokemon.originalName);
      
      return pokemonName.includes(searchTerm) || pokemonOriginal.includes(searchTerm);
    });
  }

  // Encontra Pokémon exato por nome
  findExactPokemon(name) {
    if (!name || !this.isLoaded) return null;
    
    const searchTerm = this._normalize(name);
    
    return this.pokemonList.find(pokemon => {
      const pokemonName = this._normalize(pokemon.name);
      const pokemonOriginal = this._normalize(pokemon.originalName);
      
      return pokemonName === searchTerm || pokemonOriginal === searchTerm;
    });
  }

  // Obtém detalhes de um Pokémon específico (cache)
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
      console.error(`Erro ao buscar detalhes de ${pokemonName}:`, error);
      return null;
    }
  }

  // Normaliza texto para comparação
  _normalize(text) {
    if (!text) return '';
    return text
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '');
  }

  // Retorna todos os Pokémon (já filtrados sem lendários)
  getAllPokemon() {
    return this.pokemonList;
  }

  // Verifica se um Pokémon é lendário pelo ID
  isLegendary(pokemonId) {
    return this.legendaryIds.has(pokemonId);
  }

  // Verifica se um Pokémon é lendário pelo nome
  isPokemonLegendary(pokemonName) {
    const pokemon = this.findExactPokemon(pokemonName);
    return pokemon ? this.isLegendary(pokemon.id) : false;
  }

  // Pokémon aleatório
  getRandomPokemon() {
    if (!this.isLoaded || this.pokemonList.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * this.pokemonList.length);
    return this.pokemonList[randomIndex];
  }

  // Filtra por geração
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

// Instância global do gerenciador de Pokémon
window.pokemonAPI = new PokemonAPIManager();

// ==================== POKEMON SELECT COMPONENT (ATUALIZADO) ====================

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
    // Mostrar loading
    this.showLoading();
    
    try {
      await window.pokemonAPI.loadPokemonList();
      this.createOptions();
      this.bindEvents();
      this.hideLoading();
    } catch (error) {
      console.error('Erro ao inicializar PokemonSelect:', error);
      this.showError();
    }
  }

  showLoading() {
    this.optionsList.innerHTML = '<div class="pokemon-loading">🔄 Carregando Pokémon...</div>';
  }

  showError() {
    this.optionsList.innerHTML = '<div class="pokemon-error">❌ Erro ao carregar Pokémon</div>';
  }

  hideLoading() {
    // Remove loading, as opções já foram criadas
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
    
    // Atualizar input oculto se existir
    const nomeInput = document.getElementById("NomeDosPoke");
    if (nomeInput) {
      nomeInput.value = pokemon.name;
    }
    
    // Marcar opção como selecionada
    this.optionsList.querySelectorAll('.pokemon-option').forEach(opt => {
      opt.classList.remove('selected');
      if (opt.dataset.value === pokemon.name) {
        opt.classList.add('selected');
      }
    });
    
    this.close();
    
    // Disparar evento customizado
    this.element.dispatchEvent(new CustomEvent('pokemonSelected', {
      detail: { pokemon: pokemon }
    }));
  }
  
  filterOptions(searchTerm) {
    if (!searchTerm.trim()) {
      // Mostrar todos
      this.currentOptions = window.pokemonAPI.getAllPokemon();
    } else {
      // Filtrar usando a API
      this.currentOptions = window.pokemonAPI.searchPokemon(searchTerm);
    }

    // Limpar e recriar opções
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

    // Mostrar apenas os primeiros 50 resultados para performance
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

    // Mostrar contador se há mais resultados
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

// ==================== SISTEMA ORIGINAL (ATUALIZADO) ====================

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

// EVENTO SECRETO - Função para verificar se o evento deve ser ativado
let contadorEventoSecreto = 0;

function verificarEventoSecreto() {
  contadorEventoSecreto++;
  
  // Pity: força evento aos 1000 pedidos
  if (contadorEventoSecreto >= 1000) {
    contadorEventoSecreto = 0; // Reset contador
    return { ativado: true, tipo: 'pity' };
  }

  const chance = Math.floor(Math.random() * 1000) + 1;
  return chance === 1; // 1 em 1000 chance
}

// EVENTO SECRETO - Função para executar o evento
function executarEventoSecreto() {
  // Primeira mensagem
  alert("Uma besta das sombras aparece em sua frente");
  
  // Criar e exibir a imagem
  const imagemEvento = document.createElement('div');
  imagemEvento.id = 'eventoSecreto';
  
  const img = document.createElement('img');
  img.src = 'img/Umbreon_Secreto.png'; 
  
  // Fallback caso a imagem não carregue
  img.onerror = function() {
    img.className = 'shadow-beast-placeholder';
    img.alt = '🌙 BESTA DAS SOMBRAS 🌙';
  };
  
  imagemEvento.appendChild(img);
  document.body.appendChild(imagemEvento);
  
  // Aguardar um pouco e então mostrar a segunda mensagem
  setTimeout(() => {
    alert("Parabéns, umbreon escolheu você como ganhador de um prêmio! Marque @heichurr para receber seu prêmio! (lembrando que só aceitarei a primeira pessoa que mandar)");
    
    // Remover a imagem após o segundo alert
    setTimeout(() => {
      if (document.getElementById('eventoSecreto')) {
        document.getElementById('eventoSecreto').remove();
      }
    }, 1000);
  }, 3000);
}

// ==================== VALIDAÇÃO DE POKÉMON (ATUALIZADA) ====================

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
    // Garantir que a API está carregada
    if (!window.pokemonAPI.isLoaded) {
      await window.pokemonAPI.loadPokemonList();
    }
    
    const pokemon = window.pokemonAPI.findExactPokemon(nomeDigitado);
    
    if (pokemon) {
      return { encontrado: true, pokemon: pokemon.name };
    }
    
    return { encontrado: false };
  } catch (error) {
    console.error('Erro ao buscar Pokémon:', error);
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
      mensagem: '❌ Nome impróprio detectado!' 
    };
  }
  
  const resultado = await encontrarPokemonExato(nomeDigitado);
  
  if (resultado.encontrado) {
    // Verificar se é lendário
    const isLegendary = window.pokemonAPI.isPokemonLegendary(nomeDigitado);
    if (isLegendary) {
      return {
        valido: false,
        tipo: 'legendario',
        mensagem: '🚫 Pokémon Lendários e Míticos não estão disponíveis para compra!'
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
      mensagem: `❓ "${nomeDigitado}" não foi encontrado na PokeAPI!\n\n⚠️ Tem certeza que deseja continuar?` 
    };
  }
}

// ==================== RESTO DO SISTEMA ORIGINAL ====================

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
      mensagem: `❌ Campo IVs é obrigatório!

📋 Formatos aceitos:
🎯 IVs Zerados (afetam preço):** 0atk, 0spe, 0hp, etc.
📝 Informações adicionais:** -atk, -spe, -hp, etc.

💡 Exemplos:
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
      mensagem: `❌ Erros encontrados: ${erros.join(', ')}

📋 Formatos corretos: (LEMBRANDO É NECESSÁRIO SEPARAR POR VIRGULA!! 
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

  let conteudoFormatado = `📦 **Novo Pedido**
Nome do Jogador: ${pedidoData.nomeUsuario}
Nome no Discord: ${pedidoData.nickDiscord}
Pokémon Desejado: ${pedidoData.pokemon}
-----------------------------
Castrado ou Breedável: ${pedidoData.castradoOuBreedavel}
Natureza: ${pedidoData.natureza}
Habilidades: ${pedidoData.habilidades}
Sexo (♂/♀): ${pedidoData.sexo}
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

// ==================== CONTROLE DE SISTEMA ====================

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
    alert("⚠️ Uma operação já está em andamento. Aguarde ou feche a tela atual.");
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

// ==================== FUNÇÃO DE INICIALIZAÇÃO ====================

function inicializarPokemonSelect() {
  const pokemonSelectElement = document.getElementById('pokemonSelect');
  if (pokemonSelectElement) {
    if (window.pokemonSelectInstance) {
      window.pokemonSelectInstance.destroy();
      window.pokemonSelectInstance = null;
    }
    
    const isVisible = pokemonSelectElement.offsetParent !== null;
    if (isVisible) {
      window.pokemonSelectInstance = new PokemonSelect(pokemonSelectElement);
      
      pokemonSelectElement.addEventListener('pokemonSelected', (e) => {
        console.log('✅ Pokémon selecionado:', e.detail.pokemon);
      });
    }
  }
}

// ==================== FUNÇÕES DA INTERFACE ====================

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
    alert("⚠️ Você precisa estar logado para comprar.");
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
    alert(`⏰ Aguarde ${statusCooldown.segundosRestantes} segundo(s) para fazer um novo pedido.`);
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
      listaCompradores.innerHTML = "<p>Ainda não há compradores este mês! 🎮</p>";
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
    listaCompradores.innerHTML = "<p>❌ Erro ao carregar dados.</p>";
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

// ==================== ENVIO DE PEDIDO (PRINCIPAL) ====================

async function EnviarPedido() {
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
  
  const nomeUsuario = document.getElementById("Nickname").value.trim();
  const NickDiscord = document.getElementById("Discord").value.trim();

  const statusCooldown = verificarCooldown();
  if (statusCooldown.emCooldown) {
    alert(`⏰ Aguarde ${statusCooldown.segundosRestantes} segundo(s) antes de fazer outro pedido!`);
    return;
  }

  if (!pokeNome) {
    alert("Por favor, selecione ou digite o nome de um Pokémon.");
    return;
  }

  const validacaoPokemon = await validarNomePokemon(pokeNome);
  
  if (!validacaoPokemon.valido) {
    if (validacaoPokemon.tipo === 'improprio') {
      alert(validacaoPokemon.mensagem);
      return;
    } else if (validacaoPokemon.tipo === 'naoEncontrado') {
      const continuar = confirm(validacaoPokemon.mensagem);
      if (!continuar) return;
    }
  }

  const ivsInput = document.getElementById("Ivs").value.trim();
  const dadosIVs = analisarIVsUnificado(ivsInput);
  
  if (!dadosIVs.valido) {
    alert(dadosIVs.mensagem);
    return;
  }

  const btnEnviar = document.querySelector('#Comprando button[onclick="EnviarPedido()"]');
  btnEnviar.textContent = "Enviando...";
  btnEnviar.disabled = true;

  const calculoIVs = calcularPrecoIVs(dadosIVs);
  const castradoOuBreedavel = document.getElementById("CastradoOuBreedavel").value.trim().toLowerCase();
  const precoBreedavel = (castradoOuBreedavel === "breedavel" || castradoOuBreedavel === "breedável") ? 10000 : 0;
  const hiddenHabilidade = document.getElementById("HiddenHabilidade").checked;
  const precoHidden = hiddenHabilidade ? 15000 : 0;
  
  const eggMovesStr = document.getElementById("EggMoves").value.trim();
  let precoEggMoves = 0;
  if (eggMovesStr && eggMovesStr.toLowerCase() !== "nenhum" && eggMovesStr !== "-") {
    const eggMovesArray = eggMovesStr.split(",").map(em => em.trim()).filter(em => em.length > 0);
    precoEggMoves = eggMovesArray.length * 10000;
  }

  const precoTotal = calculoIVs.preco + precoBreedavel + precoHidden + precoEggMoves;
  
  const nomeParaPedido = validacaoPokemon.valido ? validacaoPokemon.pokemon : pokeNome;

  const pedidoData = {
    nomeUsuario,
    nickDiscord: NickDiscord,
    pokemon: nomeParaPedido,
    castradoOuBreedavel: castradoOuBreedavel || "não informado",
    natureza: document.getElementById("Nature").value || "não selecionada",
    habilidades: document.getElementById("Habilidade").value || "não informado",
    sexo: document.getElementById("GeneroDoPoke").value || "não informado",
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
  
  const confirmarPedido = confirm(`${previewFormatado}

✅ Confirma este pedido?`);
  
  if (!confirmarPedido) {
    btnEnviar.textContent = "Enviar Pedido";
    btnEnviar.disabled = false;
    return;
  }

  try {
    await addDoc(collection(db, 'pedidos'), pedidoData);
    await registrarPedido(nomeUsuario);
    ultimoPedidoTimestamp = Date.now();

    await enviarWebhook(previewFormatado);

    alert(`Seu pokémon já está em preparação, assim que ficar pronto, te notificamos para retirar na loja, Agradecemos a preferência!
- Pokémon: ${nomeParaPedido}
- IVs: ${dadosIVs.tipoIV}${calculoIVs.foiUpgradado ? ` → ${calculoIVs.tipoFinal} (Upgrade!)` : ''}
- Preço total: ${Math.round(precoTotal/1000)}k`);

    // Limpar formulário
    if (window.pokemonSelectInstance) {
      window.pokemonSelectInstance.reset();
    }
    const nomeInput = document.getElementById("NomeDosPoke");
    if (nomeInput) nomeInput.value = "";
    
    document.getElementById("EggMoves").value = "";
    document.getElementById("Nature").value = "";
    document.getElementById("Habilidade").value = "";
    document.getElementById("GeneroDoPoke").value = "";
    document.getElementById("Ivs").value = "";
    document.getElementById("CastradoOuBreedavel").value = "";
    document.getElementById("HiddenHabilidade").checked = false;
    
  } catch (error) {
    console.error("Erro ao processar pedido:", error);
    alert("❌ Erro ao processar pedido. Tente novamente.");
  } finally {
    btnEnviar.textContent = "Enviar Pedido";
    btnEnviar.disabled = false;
  }
}

// ==================== FUNÇÕES DE TESTE ====================

function testarSistemaIVs() {
  const testes = [
    "F5",
    "F5, -atk",
    "F5, 0atk", 
    "F4, -atk, -spe",
    "F4, 0atk, 0spe",
    "F4, 0atk, -spe"
  ];
  
  console.log("🧪 **TESTE DO SISTEMA DE IVS CORRIGIDO**\n");
  
  testes.forEach(teste => {
    const resultado = analisarIVsUnificado(teste);
    if (resultado.valido) {
      const calculo = calcularPrecoIVs(resultado);
      console.log(`Input: "${teste}"
Resultado: ${resultado.tipoIV}${calculo.foiUpgradado ? ` → ${calculo.tipoFinal}` : ''}
Preço: ${calculo.preco.toLocaleString('pt-BR')}k
IVs Zerados: [${resultado.statsZerados.join(', ') || 'nenhum'}]
Informativos: [${resultado.informacoesAdicionais.join(', ') || 'nenhum'}]
Explicação: ${calculo.foiUpgradado ? calculo.detalhesUpgrade : 'Sem upgrade'}
---`);
    } else {
      console.log(`Input: "${teste}" - ERRO: ${resultado.mensagem}`);
    }
  });
}

// ==================== INICIALIZAÇÃO ====================

(async function inicializar() {
  await carregarConfiguracoes();
  
  // Garantir que as telas estejam ocultas inicialmente
  const comprandoSection = document.getElementById("Comprando");
  const topCompradoresSection = document.getElementById("TopCompradores");
  
  if (comprandoSection) comprandoSection.style.display = "none";
  if (topCompradoresSection) topCompradoresSection.style.display = "none";
  
  // Observer para limpar PokemonSelect quando a tela for fechada
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

  // Pré-carregar a lista de Pokémon em background
  try {
    console.log('🔄 Pré-carregando lista de Pokémon...');
    await window.pokemonAPI.loadPokemonList();
    console.log('✅ Lista de Pokémon pré-carregada com sucesso!');
  } catch (error) {
    console.warn('⚠️ Erro ao pré-carregar lista:', error);
  }

  Fechado();
})();

// ==================== EXPORTS GLOBAIS ====================

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