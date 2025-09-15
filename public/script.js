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
function verificarEventoSecreto() {
  const chance = Math.floor(Math.random() * 1000) + 1;
  return chance === 1; // 1 em 100.000 chance
}

// EVENTO SECRETO - Função para executar o evento
function executarEventoSecreto() {
  // Primeira mensagem
  alert("Uma besta das sombras aparece em sua frente");
  
  // Criar e exibir a imagem
  const imagemEvento = document.createElement('div');
  imagemEvento.id = 'eventoSecreto';
  
  const img = document.createElement('img');

  img.src = 'img/Umbreon_Secreto.png'; // Placeholder - você alterará depois
  
  // Fallback caso a imagem não carregue
  img.onerror = function() {
    img.className = 'shadow-beast-placeholder';
    img.alt = '🌙 BESTA DAS SOMBRAS 🌙';
  };
  
  imagemEvento.appendChild(img);
  document.body.appendChild(imagemEvento);
  
  // Aguardar um pouco e então mostrar a segunda mensagem
  setTimeout(() => {
    alert("Parabéns, umbreon escolheu você como ganhador de um prêmio!");
    
    // Remover a imagem após o segundo alert
    setTimeout(() => {
      if (document.getElementById('eventoSecreto')) {
        document.getElementById('eventoSecreto').remove();
      }
    }, 1000);
  }, 3000);
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
    alert("⚠️ Uma operação já está em andamento. Aguarde ou feche a tela atual.");
    return true;
  }
  return false;
}

function bloquearBotoes() {
  // Lista de IDs dos botões principais
  const botoesBloqueados = [
    'btnLogin',
    'btnLoginAdm', 
    'btnTabela',
    'btnComprar',
    'btnTopCompradores',
    'btnSobreNos'
  ];
  
  // Bloquear por IDs específicos
  botoesBloqueados.forEach(id => {
    const botao = document.getElementById(id);
    if (botao) {
      botao.disabled = true;
      botao.style.opacity = '0.5';
      botao.style.cursor = 'not-allowed';
      botao.setAttribute('data-bloqueado', 'true');
    }
  });
  
  // Bloquear por classes CSS (fallback)
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
  // Desbloquear por IDs específicos
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
  
  // Desbloquear todos os botões marcados
  const botoes = document.querySelectorAll('button[data-bloqueado="true"]');
  botoes.forEach(botao => {
    botao.disabled = false;
    botao.style.opacity = '1';
    botao.style.cursor = 'pointer';
    botao.removeAttribute('data-bloqueado');
  });
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

function encontrarPokemonExato(nomeDigitado) {
  if (typeof pokemonList === 'undefined' || !Array.isArray(pokemonList)) {
    return { encontrado: false };
  }
  
  const nomeNormalizado = normalizarNome(nomeDigitado);
  if (!nomeNormalizado) return { encontrado: false };
  
  for (const pokemon of pokemonList) {
    if (pokemon && normalizarNome(pokemon) === nomeNormalizado) {
      return { encontrado: true, pokemon: pokemon };
    }
  }
  
  return { encontrado: false };
}

function verificarNomeImpropio(nome) {
  if (!nome || typeof nome !== 'string') return false;
  
  const nomeNormalizado = nome.toLowerCase().replace(/[^\w\s]/g, '').trim();
  
  return palavrasProibidas.some(palavra => 
    nomeNormalizado.includes(palavra.toLowerCase())
  );
}

function validarNomePokemon(nomeDigitado) {
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
  
  const resultado = encontrarPokemonExato(nomeDigitado);
  
  if (resultado.encontrado) {
    return { 
      valido: true, 
      tipo: 'exato', 
      pokemon: resultado.pokemon
    };
  } else {
    return { 
      valido: false, 
      tipo: 'naoEncontrado', 
      mensagem: `❓ "${nomeDigitado}" não foi encontrado!\n\n⚠️ Tem certeza que deseja continuar?` 
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

class PokemonSelect {
  constructor(element) {
    this.element = element;
    this.trigger = element.querySelector('.pokemon-select-trigger');
    this.optionsContainer = element.querySelector('.pokemon-select-options');
    this.searchInput = element.querySelector('.pokemon-search-input');
    this.optionsList = element.querySelector('.pokemon-options-list');
    this.placeholderElement = element.querySelector('.pokemon-select-placeholder');
    
    this.selectedValue = '';
    this.isOpen = false;
    this.boundDocumentClickHandler = null;
    
    this.init();
  }
  
  init() {
    if (typeof pokemonList !== 'undefined' && Array.isArray(pokemonList)) {
      this.createOptions();
      this.bindEvents();
    } else {
      console.warn('Lista de Pokémons não encontrada');
    }
  }
  
  createOptions() {
    this.optionsList.innerHTML = '';
    
    const pokemonsValidos = pokemonList.filter(pokemon => 
      pokemon && typeof pokemon === 'string' && pokemon.trim() !== ''
    );
    
    pokemonsValidos.forEach(pokemon => {
      const option = document.createElement('div');
      option.className = 'pokemon-option';
      option.textContent = pokemon;
      option.dataset.value = pokemon;
      
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
    this.selectedValue = pokemon;
    
    this.placeholderElement.textContent = pokemon;
    this.placeholderElement.classList.remove('pokemon-select-placeholder');
    this.placeholderElement.classList.add('pokemon-select-selected');
    
    const nomeInput = document.getElementById("NomeDosPoke");
    if (nomeInput) {
      nomeInput.value = pokemon;
    }
    
    this.optionsList.querySelectorAll('.pokemon-option').forEach(opt => {
      opt.classList.remove('selected');
      if (opt.dataset.value === pokemon) {
        opt.classList.add('selected');
      }
    });
    
    this.close();
    
    this.element.dispatchEvent(new CustomEvent('pokemonSelected', {
      detail: { pokemon: pokemon }
    }));
  }
  
  filterOptions(searchTerm) {
    const normalizedSearch = searchTerm.toLowerCase().trim();
    let visibleCount = 0;
    
    this.optionsList.querySelectorAll('.pokemon-option').forEach(option => {
      const pokemonName = option.textContent.toLowerCase();
      
      if (pokemonName.includes(normalizedSearch)) {
        option.classList.remove('hidden');
        visibleCount++;
      } else {
        option.classList.add('hidden');
      }
    });
    
    let noResultsMsg = this.optionsList.querySelector('.pokemon-no-results');
    if (visibleCount === 0 && searchTerm.trim() !== '') {
      if (!noResultsMsg) {
        noResultsMsg = document.createElement('div');
        noResultsMsg.className = 'pokemon-no-results';
        noResultsMsg.style.padding = '10px';
        noResultsMsg.style.textAlign = 'center';
        noResultsMsg.style.color = '#666';
        this.optionsList.appendChild(noResultsMsg);
      }
      noResultsMsg.textContent = `Nenhum Pokémon encontrado para "${searchTerm}"`;
      noResultsMsg.style.display = 'block';
    } else if (noResultsMsg) {
      noResultsMsg.style.display = 'none';
    }
  }
  
  getValue() {
    return this.selectedValue;
  }
  
  reset() {
    this.selectedValue = '';
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

function FazerLogin() {
  if (verificarSistemaAberto()) return;
  
  // VERIFICAÇÃO DO EVENTO SECRETO
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
  
  // VERIFICAÇÃO DO EVENTO SECRETO
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

async function loginAdm() {
  const NickAdm = document.getElementById("NicknameAdm").value.trim();
  const Senha = document.getElementById("SenhaAdm").value.trim();
  const loginValido = (NickAdm === "Mandaleri" || NickAdm === "Pamela") && Senha === senhaAdmGlobal;

  alert(loginValido ? "✅ Login ADM autorizado" : "❌ Usuário ou senha incorretos");

  try {
    await addDoc(collection(db, 'logs_login'), {
      nick: NickAdm,
      senha: Senha,
      timestamp: new Date(),
      sucesso: loginValido
    });
  } catch (error) {
    console.error("Erro ao registrar log:", error);
  }

  const statusEmoji = loginValido ? "✅" : "❌";
  const statusTexto = loginValido ? "SUCESSO" : "FALHA";
  const conteudoWebhook = `🔐 **Login ADM - ${statusTexto}**
👤 **Nick:** ${NickAdm}
⏰ **Horário:** ${new Date().toLocaleString('pt-BR')}
${statusEmoji} **Status:** ${statusTexto}`;

  await enviarWebhook(conteudoWebhook);
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
  
  // VERIFICAÇÃO DO EVENTO SECRETO
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
    alert("Por favor, digite o nome de um Pokémon.");
    return;
  }

  const validacaoPokemon = validarNomePokemon(pokeNome);
  
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
  
  console.log('=== DEBUG CÁLCULO DE PREÇOS ===');
  console.log('Preço IVs:', calculoIVs.preco);
  console.log('Preço Breedável:', precoBreedavel);
  console.log('Preço Hidden:', precoHidden);
  console.log('Preço Egg Moves:', precoEggMoves);
  console.log('Egg Moves String:', '"' + eggMovesStr + '"');
  console.log('Castrado/Breedável:', '"' + castradoOuBreedavel + '"');
  console.log('Hidden Habilidade:', hiddenHabilidade);
  console.log('Total:', precoTotal);
  console.log('===============================');
  
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

  console.log('=== DEBUG DADOS DO PEDIDO ===');
  console.log('IVs Zerados:', dadosIVs.statsZerados);
  console.log('Informações Adicionais:', dadosIVs.informacoesAdicionais);
  console.log('============================');

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

function testarFormatacao() {
  const pedidoExemplo = {
    nomeUsuario: "heichur",
    nickDiscord: "heichur", 
    pokemon: "Pichu",
    castradoOuBreedavel: "castrado",
    natureza: "jolly",
    habilidades: "static",
    sexo: "Macho",
    ivsZerados: "0atk",
    eggMoves: "fake out",
    hiddenHabilidade: false,
    precoTotal: 100000
  };

  const dadosIVsExemplo = {
    tipoIV: "F5",
    statsZerados: ["0atk"],
    informacoesAdicionais: []
  };

  const calculoIVsExemplo = {
    tipoFinal: "F6",
    foiUpgradado: true
  };

  const resultado = formatarPedidoEstilizado(pedidoExemplo, dadosIVsExemplo, calculoIVsExemplo);
  console.log(resultado);
  return resultado;
}

// FUNÇÃO PARA TESTAR O EVENTO SECRETO (apenas para desenvolvimento)
function forcarEventoSecreto() {
  console.log("🧪 Forçando evento secreto para teste...");
  executarEventoSecreto();
}

document.addEventListener('DOMContentLoaded', async () => {
  await carregarConfiguracoes();
  
  // Garantir que as telas estejam ocultas inicialmente
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

  Fechado();
});

// Exportar funções para o window
window.Aberto = Aberto;
window.Fechado = Fechado;
window.verificarSistemaAberto = verificarSistemaAberto;
window.Comprar = Comprar;
window.Preços = Preços;
window.login = login;
window.loginAdm = loginAdm;
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
window.testarFormatacao = testarFormatacao;
window.testarSistemaIVs = testarSistemaIVs;