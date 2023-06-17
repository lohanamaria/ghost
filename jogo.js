const TEMPO_INICIAL = 15;
let pontos = 0;
let tempo = 0;
let timer = null;
let nomeJogador;


function criarElemento(nome, pontuacao) {
  const placarTable = document.querySelector('.placar table');
  if (placarTable) {
    const itemPlacar = document.createElement('tr');
    const colunaNome = document.createElement('td');
    const colunaPontuacao = document.createElement('td');

    colunaNome.textContent = nome;
    colunaPontuacao.textContent = pontuacao;

    itemPlacar.appendChild(colunaNome);
    itemPlacar.appendChild(colunaPontuacao);
    placarTable.appendChild(itemPlacar);
  }
}
function atualizaPlacar() {
  const placarTableBody = document.getElementById('placar-table-body');
  placarTableBody.innerHTML = ''; // Limpa o conteúdo do placar

  fetch('http://localhost:27017/score')
    .then(response => {
      if (!response.ok) {
        throw new Error('Erro na requisição');
      }
      return response.json();
    })
    .then(data => {
      const jogadores = data;
      jogadores.forEach(jogador => {
        const itemPlacar = document.createElement('tr');
        const colunaNome = document.createElement('td');
        const colunaPontuacao = document.createElement('td');

        colunaNome.textContent = jogador.nome;
        colunaPontuacao.textContent = jogador.pontuacao;

        itemPlacar.appendChild(colunaNome);
        itemPlacar.appendChild(colunaPontuacao);
        placarTableBody.appendChild(itemPlacar);
      });
    })
    .catch(error => {
      console.error(error);
    });
}



function iniciaJogo() {
  if (!nomeJogador) {
    nomeJogador = prompt('Enter your name:');  
    if (!nomeJogador) {
      alert('Player name not provided. The game will not start.');
      return;
    }
    timer = setInterval(contaTempo, 1000); 
  }
}
  
  const tituloJogo = document.querySelector('.titulo'); 
  const nomeJogadorSpan = document.createElement('span'); 
  nomeJogadorSpan.textContent = nomeJogador; 
  tituloJogo.appendChild(nomeJogadorSpan); 

  
  const resetButton = document.getElementById('reset-button');
  resetButton.style.borderRadius = '8px';
  resetButton.style.backgroundColor = 'black'; 
  resetButton.style.color = 'white'; 
  
  pontos = sessionStorage.getItem('pontuacao') || 0;
  
  const NUM_GHOSTFACE = 42;
  tempo = TEMPO_INICIAL;
  const tela = document.getElementById('tela');
  tela.innerHTML = '';

  for (let i = 0; i < NUM_GHOSTFACE; ++i) {
    const ghostface = document.createElement('img');
    ghostface.src = 'gt3.png';
    ghostface.id = 'm' + i;
    ghostface.onclick = function () {
      pegaGhost(this);
      
      const resetButton = document.getElementById('reset-button');
      resetButton.addEventListener('click', resetarPontuacao);
    }
    tela.appendChild(ghostface);
  }

function resetarPontuacao() {
  fetch('http://localhost:27017/score', {
    method: 'DELETE'
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Erro ao resetar a pontuação');
      }
      return response.json();
    })
    .then(data => {
      console.log(data); 
      atualizaPlacar();
    })
    .catch(error => {
      console.error(error);
    });
}


function pegaGhost(ghostface) {
  if (tempo <= 0) return; 

  ghostface.onclick = null;
  ghostface.src = 'gt4.png';

  ++pontos;
  const contadorPontos = document.getElementById('pontos');
  contadorPontos.textContent = pontos;

  sessionStorage.setItem('pontuacao', pontos);

  const pontuacoes = JSON.parse(localStorage.getItem('pontuacoes')) || [];

  pontuacoes.push(pontos);

  localStorage.setItem('pontuacoes', JSON.stringify(pontuacoes));

  atualizaPlacar(); 
}

function contaTempo() {
  --tempo;
  const contadorTempo = document.getElementById('tempo');
  contadorTempo.textContent = tempo;

  if (tempo <= 0) {
    clearInterval(timer);
    sessionStorage.removeItem('pontuacao');

    const pontuacao = {
      pontuacao: pontos,
      nome: nomeJogador
    };

    fetch('http://localhost:27017/score', {
      method: 'POST',
      body: JSON.stringify(pontuacao),
      headers: { 'Content-type': 'application/json; charset=UTF-8' }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Erro ao enviar a pontuação');
        }
        return response.json();
      })
      .then(json => console.log(json))
      .catch(err => console.log(err));

    alert(`Congratulations, ${nomeJogador}! You've been tricked by Ghostface ${pontos} times! Points for him.`);
    atualizaPlacar();
    iniciaJogo();
  }
}