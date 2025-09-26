window.onload = function () {
  document.getElementById('check').checked = true;
  getEditoras();
  getNome();
  verificarPermissoes();
}
let idEditoraSelecionada = null;
//modais
function abrirModalExcluir() {
  document.getElementById("excluir").style.display = "flex";
}
function abrirModalConfirmarEdicao() {
  document.getElementById("editar").style.display = "none";
  document.getElementById("confirmarEdicao").style.display = "flex";
}
function fecharModal() {
  document.getElementById("criar").style.display = "none";
  document.getElementById("editar").style.display = "none";
  document.getElementById("excluir").style.display = "none";
  document.getElementById("confirmarEdicao").style.display = "none";
}
function abrirModalEditar() {
  document.getElementById("editar").style.display = "flex";
}
function btnAdicionar() {
  document.getElementById("criar").style.display = "flex";
}

//API TOKEN

const token = localStorage.getItem('authToken')
var arrayEditoras = []

const apiClient = axios.create({
  baseURL: "https://locadora-ryan-back.altislabtech.com.br",
  headers: {
    'Authorization': `Bearer ${token}`,
    "Content-Type": "application/json"
  }
});

function getEditoras() {
  apiClient.get('/publisher')
    .then(response => {
      console.log(response.data);
      let dadosEditora = response.data
      arrayEditoras.push(dadosEditora)

      if (Array.isArray(dadosEditora)) {
        arrayEditoras.length = 0;
        arrayEditoras.push(...dadosEditora);
      } else {
        arrayEditoras.length = 0;
        arrayEditoras.push(dadosEditora);
      }

      listaTabela()
    })
    .catch(e => {
      console.error('Erro:', e.response?.data || e.message);
      showToast("Erro ao coletar os dados.", "error");
    })
}


function adicionarDados() {

  const newPublisher = {
    name: document.getElementById('nome').value,
    email: document.getElementById('email').value,
    telephone: document.getElementById('telefone').value,
    site: document.getElementById('site').value
  };
  if (!validaCampos(newPublisher)) {
    return
  }
  apiClient.post('/publisher', newPublisher)
    .then(response => {
      showToast(`Editora cadastrada com sucesso!`, "success");
      getEditoras()
      fecharModal();
      document.getElementById('nome').value = "";
      document.getElementById('email').value = "";
      document.getElementById('telefone').value = "";
      document.getElementById('site').value = "";
    })
    .catch(error => {
      const msg = error.response?.data?.error || error.message;
      showToast(msg, "error");
      console.error('Erro:', error.response?.data || error.message);
    })
}

function apagarEditora(id) {
  idParaExcluir = id;
  abrirModalExcluir();
  const btn = document.getElementById("excluirbtn");
  btn.onclick = () => {
    let tbody = document.getElementById("tbody");

    for (let i = 0; i < this.arrayEditoras.length; i++) {
      if (this.arrayEditoras[i].id == idParaExcluir) {


        apiClient.delete(`/publisher/${id}`)
          .then(response => {
            showToast("Exclusão realizada com sucesso!", "success");
            console.log(response.data)
            this.arrayEditoras.splice(i, 1);
            tbody.deleteRow(i);
            listaTabela()
          })
          .catch(error => {
            const msg = error.response?.data?.error || error.message;
            showToast(msg, "error");
          })
        break;
      }
    }
    fecharModal()
  };
}

function preparaEditar(newPublisher) {
  idEditoraSelecionada = newPublisher.id;
  document.getElementById("editar").style.display = "flex";
  document.getElementById('nomeE').value = newPublisher.name;
  document.getElementById('emailE').value = newPublisher.email;
  document.getElementById('telefoneE').value = newPublisher.telephone;
  document.getElementById('siteE').value = newPublisher.site;
  document.getElementById('representanteE').value = newPublisher.representante;
}

function confirmarEdicao() {
  let idParaEditar = idEditoraSelecionada
  const editoraEditada = {
    name: document.getElementById('nomeE').value,
    email: document.getElementById('emailE').value,
    telephone: document.getElementById('telefoneE').value,
    site: document.getElementById('siteE').value,
  };

  if (!validaCampos(editoraEditada)) {
    document.getElementById("confirmarEdicao").style.display = "none";
    abrirModalEditar();
    return;
  }
  for (let i = 0; i < arrayEditoras.length; i++) {
    if (arrayEditoras[i].id === idParaEditar) {
      arrayEditoras[i] = { ...editoraEditada, id: idParaEditar };
      apiClient.put(`/publisher/${idEditoraSelecionada}`, editoraEditada)
        .then(response => {
          showToast("Edição realizada com sucesso!", "success");
          console.log(response.data)
          listaTabela();
        })
        .catch(error => {
          const msg = error.response?.data?.error || error.message;
          showToast(msg, "error");
        })
      break
    }
  }
  fecharModal(); // fecha tudo ;-;
}

function listaTabela() {
  let tbody = document.getElementById('tbody');
  tbody.innerText = '';
  const roleAtual = localStorage.getItem("roleUsuario");
  for (let i = 0; i < arrayEditoras.length; i++) {
    let tr = tbody.insertRow();
    let td_id = tr.insertCell();
    let td_nome = tr.insertCell();
    let td_email = tr.insertCell();
    let td_telefone = tr.insertCell();
    let td_site = tr.insertCell();
    let td_acoes = tr.insertCell();

    td_id.innerText = arrayEditoras[i].id;
    td_nome.innerText = arrayEditoras[i].name;
    td_email.innerText = arrayEditoras[i].email;
    td_telefone.innerText = arrayEditoras[i].telephone;
    td_site.innerText = arrayEditoras[i].site;

    td_id.setAttribute('data-label', 'Id:');
    td_nome.setAttribute('data-label', 'Nome:');
    td_email.setAttribute('data-label', 'E-mail:');
    td_telefone.setAttribute('data-label', 'Telefone:');
    td_site.setAttribute('data-label', 'Site:');
    td_acoes.setAttribute('data-label', 'Ações:');

    if (roleAtual !== "USER") {
      let imgEdit = document.createElement('i');
      imgEdit.className = 'fas fa-edit';
      td_acoes.appendChild(imgEdit);
      imgEdit.setAttribute("onclick", "preparaEditar(" + JSON.stringify(arrayEditoras[i]) + ")");

      let imgExcluir = document.createElement('i');
      imgExcluir.className = 'fas fa-trash';
      td_acoes.appendChild(imgExcluir);
      imgExcluir.setAttribute("onclick", "apagarEditora(" + arrayEditoras[i].id + ")");
    }
  }
  atualizarPaginacao();
}


function validaCampos(newPublisher) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const telefoneRegex = /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/;
  const siteRegex = /^https:\/\/www\.[a-zA-Z0-9-]+\.[a-z]{2,}$/;
  if (newPublisher.name == "" || newPublisher.email == "" || newPublisher.telephone == "") {
    showToast("Os campos devem ser preenchidos!", "error");
    return false;
  } else if (!emailRegex.test(newPublisher.email)) {
    showToast("Digite um e-mail válido!", "error");
    return false;
  } else if (!telefoneRegex.test(newPublisher.telephone)) {
    showToast("Digite um telefone válido!", "error");
    return false;
  } else if (newPublisher.site && !siteRegex.test(newPublisher.site)) {
    showToast("Digite um site válido! (Ex: https://www.exemplo.com)", "error");
    return false;
  }
  return true;
}

function cancelar() {
  document.getElementById('nome').value = "";
  document.getElementById('email').value = "";
  document.getElementById('telefone').value = "";
  document.getElementById('site').value = "";
  fecharModal();
}


//paginação

let paginaAtual = 1;
let linhasPorPagina = window.innerWidth <= 600 ? 2 : 5; // 2 para celular, 5 padrão

window.addEventListener('resize', () => {
  const novaQuantidade = window.innerWidth <= 600 ? 2 : 5;
  if (linhasPorPagina !== novaQuantidade) {
    linhasPorPagina = novaQuantidade;
    paginar(); // ou sua função de renderização da tabela
  }
});

function obterLinhas() {
  const fixos = Array.from(document.querySelectorAll('#tbodyPrincipal tr'));
  const dinamicos = Array.from(document.querySelectorAll('#tbody tr'));
  return [...fixos, ...dinamicos];
}

function mostrarPagina(pagina) {
  const todasLinhas = obterLinhas();

  if (window.innerWidth <= 600) {
    todasLinhas.forEach(linha => linha.style.display = '');
    document.getElementById('paginacao').style.display = 'none';
    return;
  }

  const totalPaginas = Math.ceil(todasLinhas.length / linhasPorPagina);
  paginaAtual = Math.min(Math.max(pagina, 1), totalPaginas);

  const inicio = (paginaAtual - 1) * linhasPorPagina;
  const fim = inicio + linhasPorPagina;

  todasLinhas.forEach((linha, index) => {
    linha.style.display = (index >= inicio && index < fim) ? '' : 'none';
  });

  const paginacaoDiv = document.getElementById('paginacao');
  paginacaoDiv.innerHTML = `
            <button class="paginacao-btn" ${paginaAtual === 1 ? 'disabled' : ''} onclick="mostrarPagina(${paginaAtual - 1})">Anterior</button>
            <span style="margin: 0 10px;">Página ${paginaAtual} de ${totalPaginas}</span>
            <button class="paginacao-btn" ${paginaAtual === totalPaginas ? 'disabled' : ''} onclick="mostrarPagina(${paginaAtual + 1})">Próxima</button>
    `;

}

function atualizarPaginacao() {
  mostrarPagina(paginaAtual);
}

window.addEventListener('DOMContentLoaded', () => {
  const paginacaoDiv = document.createElement('div');
  paginacaoDiv.id = 'paginacao';
  paginacaoDiv.style.textAlign = 'center';
  paginacaoDiv.style.marginTop = '10px';
  document.querySelector('.tabela').appendChild(paginacaoDiv);

  mostrarPagina(1);
});

//Pesquisa

function pesquisarTabela() {
  let barraPesquisa = document.getElementById('searchInput')
  let filtro = barraPesquisa.value.toLowerCase()
  let tabela = document.getElementById('tabelaEditoras')
  let linhas = tabela.getElementsByTagName('tr')

  for (let i = 1; i < linhas.length; i++) {
    let colunas = linhas[i].getElementsByTagName('td')
    let encontrou = false

    for (let j = 0; j < colunas.length; j++) {
      let texto = colunas[j].textContent.toLowerCase()
      if (texto.indexOf(filtro) > -1) {
        encontrou = true
        break
      }
    }
    linhas[i].style.display = encontrou ? "" : "none"
  }
  if (filtro.trim() === '') {
    // Se o campo de pesquisa estiver vazio, volta à paginação normal
    atualizarPaginacao();
    paginacaoDiv.style.display = 'block';
  } else {
    // Esconde a paginação durante busca
    paginacaoDiv.style.display = 'none';
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

function getNome() {
  let nome = localStorage.getItem('nomeUsuario');
  let rodape = document.getElementById('rodape');

  rodape.innerHTML += (nome ? nome : "Usuário não encontrado") + " ";
}

function logout() {
  localStorage.removeItem("nomeUsuario");
  localStorage.removeItem("authToken");
}

function verificarPermissoes() {
  const role = localStorage.getItem("roleUsuario"); // salve o role no login

  if (role === "USER") {
    // Esconde botões de adicionar
    const btnAdd = document.getElementById("btnAdicionar");
    if (btnAdd) btnAdd.style.display = "none";
    document.getElementById('search').style.width = '100%'

    // Esconde ícones de edição/exclusão
    document.querySelectorAll(".fa-edit, .fa-trash").forEach(icon => {
      icon.style.display = "none";
    });
  }
}

//ordenar

const celulasTopo = document.querySelectorAll("#tabelaEditoras thead td");
const tbody = document.querySelector("#tabelaEditoras tbody");

celulasTopo.forEach((cell, colIndex) => {
  cell.addEventListener("click", () => {
    if (colIndex === 0) return;
    const rows = [...tbody.rows];
    const asc = cell.dataset.asc !== "1";
    cell.dataset.asc ? "1" : "0";


    rows.sort((a, b) =>
      asc
        ? a.cells[colIndex].textContent.localeCompare(b.cells[colIndex].textContent)
        : b.cells[colIndex].textContent.localeCompare(a.cells[colIndex].textContent)
    );

    tbody.append(...rows);
    atualizarPaginacao();
  });
})

// function ordenar(coluna) {
//   const tbody = document.getElementById("tbody");
//   const linhas = Array.from(tbody.rows);
//   let trocou;

//   do {
//     trocou = false;
//     for(let i = 0; i<linhas.length -1; i++) {
//       let nomeA = linhas[i].cells[coluna].textContent.toLowerCase();
//       let nomeB = linhas[i + 1].cells[coluna].textContent.toLowerCase();

//       if(nomeA > nomeB) {
//         tbody.insertBefore(linhas[i + 1], linhas[i]);
//         [linhas[i], linhas[i + 1]] = [linhas[i + 1], linhas[i]];
//         trocou = true;
//           atualizarPaginacao();
//       }
//     }
//   } while (trocou)
// }
// document.getElementById("idTd").addEventListener("click",()=> ordenar(0));
// document.getElementById("nomeTd").addEventListener("click",()=> ordenar(1));
// document.getElementById("emailTd").addEventListener("click", () => ordenar(2));
// document.getElementById("telefoneTd").addEventListener("click",()=> ordenar(3));
// document.getElementById("siteTd").addEventListener("click",()=> ordenar(4));