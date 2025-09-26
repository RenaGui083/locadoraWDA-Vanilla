<<<<<<< HEAD
window.onload = function () {
  document.getElementById('check').checked = true;
  atualizarGrafico();
  atualizarGraficoBarra();
  atualizarGraficoLine();
  listaTabela();
  getNome();
}

const token = localStorage.getItem('authToken');
let graficoPizza2Instance

const apiClient = axios.create({
  baseURL: "https://locadora-ryan-back.altislabtech.com.br",
  headers: {
    'Authorization': `Bearer ${token}`,
    "Content-Type": "application/json"
  }
})

//grafico pizza
const inputMesesTop3 = document.getElementById('mesesTop3');
inputMesesTop3.addEventListener('input', function () {
  atualizarGrafico()
});

async function atualizarGrafico() {
  var inputTop3 = Number(document.getElementById('mesesTop3').value);

  apiClient.get('/dashboard/bookMoreRented', {
    params: { numberOfMonths: inputTop3 }
  })
    .then(response => {
      console.log(response.data)
      dados = response.data
      const labels = dados.map(item => item.name);
      const values = dados.map(item => item.totalRents);
      const ctx2 = document.getElementById('graficoPizza2').getContext('2d');

      if (graficoPizza2Instance) {
        graficoPizza2Instance.destroy();
      }

      graficoPizza2Instance = new Chart(ctx2, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: 'Distribuição',
            data: values,
            backgroundColor: [
              '#88B6EE',
              '#4B6B92',
              '#404668'
            ],
          }]
        },
        options: {
          indexAxis: 'x',
          responsive: false,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } }
        }
      })
    })
    .catch(e => {
      console.error('Erro:', e.response?.data || e.message)
      console.log(e)
      showToast("Erro ao coletar os dados.", "error");
    })
}

//grafico barra
var dados = 0;
var atrasados = 0;
var entreguesComDemora = 0;
var entreguesNoPrazo = 0;
var totalAlugueis = 0;
var editoras = 0;
var livros = 0;
var locatarios = 0;
let graficoBarraInstance;
const inputAlugueis = document.getElementById('mesesAlugueis');
inputAlugueis.addEventListener('input', function () {
  atualizarGraficoBarra()
});

async function atualizarGraficoBarra() {
  var inputRelacaoAlugueis = Number(document.getElementById('mesesAlugueis').value)

  try {
    const [resAtrasados, resComDemora, resNoPrazo, resTotal] = await Promise.all([
      apiClient.get('/dashboard/rentsLateQuantity', { params: { numberOfMonths: inputRelacaoAlugueis } }),
      apiClient.get('/dashboard/deliveredWithDelayQuantity', { params: { numberOfMonths: inputRelacaoAlugueis } }),
      apiClient.get('/dashboard/deliveredInTimeQuantity', { params: { numberOfMonths: inputRelacaoAlugueis } }),
      apiClient.get('/dashboard/rentsQuantity', { params: { numberOfMonths: inputRelacaoAlugueis } })
    ]);

    atrasados = resAtrasados.data;
    entreguesComDemora = resComDemora.data;
    entreguesNoPrazo = resNoPrazo.data;
    totalAlugueis = resTotal.data;

    const ctx = document.getElementById('graficoPizza').getContext('2d');
    if (graficoBarraInstance) graficoBarraInstance.destroy();
    graficoBarraInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Alugados', 'Atrasados', 'Devolvidos no prazo', 'Devolvidos com demora'],
        datasets: [{
          label: 'Distribuição',
          data: [totalAlugueis, atrasados, entreguesNoPrazo, entreguesComDemora],
          backgroundColor: ['#404668', '#121F2F', '#f5d274ff', '#FFC697'],
        }]
      },
      options: {
        responsive: false,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } }
      }
    });

  } catch (e) {
    console.error('Erro ao atualizar gráfico de barras:', e.response?.data || e.message);
    showToast("Erro ao coletar os dados.", "error");
  }
}
const inputPagina = document.getElementById('paginaAlugueis');
inputPagina.addEventListener('input', function () {
  listaTabela();
});
function listaTabela() {
  let tbody = document.getElementById('tbody');
  tbody.innerHTML = '';
  let pagina = Number(document.getElementById('paginaAlugueis').value);
  apiClient.get('/dashboard/rentsPerRenter', {
    params: { page: pagina - 1 }
  })
    .then(response => {
      console.log(response.data)
      let dados = response.data.content || [];
      for (let i = 0; i < dados.length; i++) {
        let tr = tbody.insertRow();
        let td_locatario = tr.insertCell();
        let td_totalAlugueis = tr.insertCell();
        let td_alugueisAtivos = tr.insertCell();

        td_locatario.innerText = dados[i].name;
        td_totalAlugueis.innerText = dados[i].rentsQuantity;
        td_alugueisAtivos.innerText = dados[i].rentsActive;
      }
    })
    .catch(e => {
      console.error('Erro ao carregar tabela:', e.response?.data || e.message);
      showToast("Erro ao coletar os dados.", "error");
    });
}

// get nome do rodapé ;-;

function getNome() {
  let nome = localStorage.getItem('nomeUsuario');
  let rodape = document.getElementById('rodape');

  rodape.innerHTML += (nome ? nome : "Usuário não encontrado") + " ";
}

//logout do sistema
function logout() {
  localStorage.removeItem("nomeUsuario");
  localStorage.removeItem("authToken");
}

// relatório de editoras e livros cadastrados

let graficoDonut;

async function atualizarGraficoLine() {
  var inputLivros = Number(document.getElementById('mesesTop3').value);

  try {
    const [resLivros, resEditoras, resLocatarios] = await Promise.all([
      apiClient.get('/book'),
      apiClient.get('/publisher'),
      apiClient.get('/renter')
    ]);

    editoras = resEditoras.data;
    livros = resLivros.data;
    locatarios = resLocatarios.data;

    const qtdLivros = livros.length;
    const qtdEditoras = editoras.length;
    const qtdLocatarios = locatarios.length;

    if (graficoDonut) {
      graficoDonut.destroy();
    }
    const ctx22 = document.getElementById('graficoDonut');

    graficoDonut = new Chart(ctx22, {
      type: 'doughnut',
      data: {
        labels: ['Livros', 'Editoras', 'Locatários'],
        datasets: [{
          data: [qtdEditoras, qtdLivros, qtdLocatarios], 
          backgroundColor: ['#404668', '#F7B176', '#121F2F']
        }]
      },
      options: {
        responsive: false,
        maintainAspectRatio: false,
      }
    });
  } catch (e) {
    console.error('Erro ao atualizar gráfico de barras:', e.response?.data || e.message);
    showToast("Erro ao coletar os dados.", "error");
  }
}

function showToast(message, type = "success") {
    const toastContainer = document.getElementById("toast-container");
    const toast = document.createElement("div");
    toast.classList.add("toast", type);
    toast.innerText = message;

    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 5000);
}
=======
window.onload = function () {
  document.getElementById('check').checked = true;
  atualizarGrafico();
  atualizarGraficoBarra();
  atualizarGraficoLine();
  listaTabela();
  getNome();
}

const token = localStorage.getItem('authToken');
let graficoPizza2Instance

const apiClient = axios.create({
  baseURL: "https://locadora-ryan-back.altislabtech.com.br",
  headers: {
    'Authorization': `Bearer ${token}`,
    "Content-Type": "application/json"
  }
})

//grafico pizza
const inputMesesTop3 = document.getElementById('mesesTop3');
inputMesesTop3.addEventListener('input', function () {
  atualizarGrafico()
});

async function atualizarGrafico() {
  var inputTop3 = Number(document.getElementById('mesesTop3').value);

  apiClient.get('/dashboard/bookMoreRented', {
    params: { numberOfMonths: inputTop3 }
  })
    .then(response => {
      console.log(response.data)
      dados = response.data
      const labels = dados.map(item => item.name);
      const values = dados.map(item => item.totalRents);
      const ctx2 = document.getElementById('graficoPizza2').getContext('2d');

      if (graficoPizza2Instance) {
        graficoPizza2Instance.destroy();
      }

      graficoPizza2Instance = new Chart(ctx2, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: 'Distribuição',
            data: values,
            backgroundColor: [
              '#88B6EE',
              '#4B6B92',
              '#404668'
            ],
          }]
        },
        options: {
          indexAxis: 'x',
          responsive: false,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } }
        }
      })
    })
    .catch(e => {
      console.error('Erro:', e.response?.data || e.message)
      console.log(e)
      showToast("Erro ao coletar os dados.", "error");
    })
}

//grafico barra
var dados = 0;
var atrasados = 0;
var entreguesComDemora = 0;
var entreguesNoPrazo = 0;
var totalAlugueis = 0;
var editoras = 0;
var livros = 0;
var locatarios = 0;
let graficoBarraInstance;
const inputAlugueis = document.getElementById('mesesAlugueis');
inputAlugueis.addEventListener('input', function () {
  atualizarGraficoBarra()
});

async function atualizarGraficoBarra() {
  var inputRelacaoAlugueis = Number(document.getElementById('mesesAlugueis').value)

  try {
    const [resAtrasados, resComDemora, resNoPrazo, resTotal] = await Promise.all([
      apiClient.get('/dashboard/rentsLateQuantity', { params: { numberOfMonths: inputRelacaoAlugueis } }),
      apiClient.get('/dashboard/deliveredWithDelayQuantity', { params: { numberOfMonths: inputRelacaoAlugueis } }),
      apiClient.get('/dashboard/deliveredInTimeQuantity', { params: { numberOfMonths: inputRelacaoAlugueis } }),
      apiClient.get('/dashboard/rentsQuantity', { params: { numberOfMonths: inputRelacaoAlugueis } })
    ]);

    atrasados = resAtrasados.data;
    entreguesComDemora = resComDemora.data;
    entreguesNoPrazo = resNoPrazo.data;
    totalAlugueis = resTotal.data;

    const ctx = document.getElementById('graficoPizza').getContext('2d');
    if (graficoBarraInstance) graficoBarraInstance.destroy();
    graficoBarraInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Alugados', 'Atrasados', 'Devolvidos no prazo', 'Devolvidos com demora'],
        datasets: [{
          label: 'Distribuição',
          data: [totalAlugueis, atrasados, entreguesNoPrazo, entreguesComDemora],
          backgroundColor: ['#404668', '#121F2F', '#f5d274ff', '#FFC697'],
        }]
      },
      options: {
        responsive: false,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } }
      }
    });

  } catch (e) {
    console.error('Erro ao atualizar gráfico de barras:', e.response?.data || e.message);
    showToast("Erro ao coletar os dados.", "error");
  }
}
const inputPagina = document.getElementById('paginaAlugueis');
inputPagina.addEventListener('input', function () {
  listaTabela();
});
function listaTabela() {
  let tbody = document.getElementById('tbody');
  tbody.innerHTML = '';
  let pagina = Number(document.getElementById('paginaAlugueis').value);
  apiClient.get('/dashboard/rentsPerRenter', {
    params: { page: pagina - 1 }
  })
    .then(response => {
      console.log(response.data)
      let dados = response.data.content || [];
      for (let i = 0; i < dados.length; i++) {
        let tr = tbody.insertRow();
        let td_locatario = tr.insertCell();
        let td_totalAlugueis = tr.insertCell();
        let td_alugueisAtivos = tr.insertCell();

        td_locatario.innerText = dados[i].name;
        td_totalAlugueis.innerText = dados[i].rentsQuantity;
        td_alugueisAtivos.innerText = dados[i].rentsActive;
      }
    })
    .catch(e => {
      console.error('Erro ao carregar tabela:', e.response?.data || e.message);
      showToast("Erro ao coletar os dados.", "error");
    });
}

// get nome do rodapé ;-;

function getNome() {
  let nome = localStorage.getItem('nomeUsuario');
  let rodape = document.getElementById('rodape');

  rodape.innerHTML += (nome ? nome : "Usuário não encontrado") + " ";
}

//logout do sistema
function logout() {
  localStorage.removeItem("nomeUsuario");
  localStorage.removeItem("authToken");
}

// relatório de editoras e livros cadastrados

let graficoDonut;

async function atualizarGraficoLine() {
  var inputLivros = Number(document.getElementById('mesesTop3').value);

  try {
    const [resLivros, resEditoras, resLocatarios] = await Promise.all([
      apiClient.get('/book'),
      apiClient.get('/publisher'),
      apiClient.get('/renter')
    ]);

    editoras = resEditoras.data;
    livros = resLivros.data;
    locatarios = resLocatarios.data;

    const qtdLivros = livros.length;
    const qtdEditoras = editoras.length;
    const qtdLocatarios = locatarios.length;

    if (graficoDonut) {
      graficoDonut.destroy();
    }
    const ctx22 = document.getElementById('graficoDonut');

    graficoDonut = new Chart(ctx22, {
      type: 'doughnut',
      data: {
        labels: ['Livros', 'Editoras', 'Locatários'],
        datasets: [{
          data: [qtdEditoras, qtdLivros, qtdLocatarios], 
          backgroundColor: ['#404668', '#F7B176', '#121F2F']
        }]
      },
      options: {
        responsive: false,
        maintainAspectRatio: false,
      }
    });
  } catch (e) {
    console.error('Erro ao atualizar gráfico de barras:', e.response?.data || e.message);
    showToast("Erro ao coletar os dados.", "error");
  }
}

function showToast(message, type = "success") {
    const toastContainer = document.getElementById("toast-container");
    const toast = document.createElement("div");
    toast.classList.add("toast", type);
    toast.innerText = message;

    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 5000);
}
>>>>>>> 5e12ec0bce699582774515eea963001c9ba75c2c
