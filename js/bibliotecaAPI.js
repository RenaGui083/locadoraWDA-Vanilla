window.onload = function () {
    document.getElementById('check').checked = true;
    getRegistros();
    getNome();
    verificarPermissoes();
}
let idLivroSelecionado = null;

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
    const select = document.getElementById("editoraId");

    apiClient.get('/publisher')
        .then(response => {
            const dados = response.data || [];
            console.log(response)
            dados.forEach((publisher) => {
                const option = document.createElement("option");
                option.value = publisher.id;       // valor do option
                option.textContent = publisher.name; // texto visível
                select.appendChild(option);
            });
        })
        .catch(error => {
            const msg = error.response?.data?.error || error.message;
            showToast(msg, "error");
        })

    document.getElementById("criar").style.display = "flex";
}

//Token API

const token = localStorage.getItem('authToken')
var arrayLivros = [];

const apiClient = axios.create({
    baseURL: "https://locadora-ryan-back.altislabtech.com.br",
    headers: {
        'Authorization': `Bearer ${token}`,
        "Content-Type": "application/json"
    }
})

async function getRegistros() {
    apiClient.get('/book')
        .then(response => {
            console.log(response.data)
            let dadosLivro = response.data
            // arrayLivros.push(dadosLivro)

            if (Array.isArray(dadosLivro)) {
                arrayLivros.length = 0
                arrayLivros.push(...dadosLivro)
            } else {
                arrayLivros.length = 0
                arrayLivros.push(dadosLivro)
            }

            listaTabela()
        })
        .catch(e => {
            const msg = error.response?.data?.error || error.message;
            showToast(msg, "error");
        })
}

function adicionarDados() {
    const newBook = {
        name: document.getElementById('nome').value,
        author: document.getElementById('autor').value,
        launchDate: document.getElementById('dataLancamento').value,
        totalQuantity: document.getElementById('estoque').value,
        publisherId: document.getElementById('editoraId').value
    }
    if (!validaCampos(newBook)) {
        return
    }
    apiClient.post('/book', newBook)
        .then(response => {
            showToast(`Livro cadastrado com sucesso!`, "success")
            getRegistros()
            fecharModal()
            document.getElementById('nome').value = "";
            document.getElementById('autor').value = "";
            document.getElementById('dataLancamento').value = "";
            document.getElementById('estoque').value = "";
            document.getElementById('editoraId').value = "";
        })
        .catch(error => {
            const msg = error.response?.data?.error || error.message;
            showToast(msg, "error");
        })
}

function validaCampos(newBook) {
    if (newBook.name == "" || newBook.author == "" || newBook.launchDate == "" || newBook.totalQuantity == "" || newBook.publisherId == "") {
        showToast("Os campos devem ser preenchidos!", "error");
        return false;
    }
    return true;
}

function apagarLivro(id) {
    idParaExcluir = id;
    abrirModalExcluir();
    const btn = document.getElementById("excluirLivro");
    btn.onclick = () => {
        let tbody = document.getElementById("tbody");

        for (let i = 0; i < arrayLivros.length; i++) {
            if (arrayLivros[i].id == idParaExcluir) {
                apiClient.delete(`/book/${id}`)
                    .then(response => {
                        showToast("Exclusão realizada com sucesso!", "success");
                        console.log(response.data)
                        arrayLivros.splice(i, 1);
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

function preparaEditar(newBook) {
    idLivroSelecionado = newBook.id
    document.getElementById('nomeE').value = newBook.name;
    document.getElementById('autorE').value = newBook.author;
    document.getElementById('dataLancamentoE').value = newBook.launchDate;
    document.getElementById('estoqueE').value = newBook.totalQuantity;
    document.getElementById('editoraIdE').value = newBook.publisher?.id || "";

    const select = document.getElementById("editoraIdE");

    apiClient.get('/publisher')
        .then(response => {
            const dados = response.data || [];
            console.log(response)
            dados.forEach((publisher) => {
                const option = document.createElement("option");
                option.value = publisher.id;       // valor do option
                option.textContent = publisher.name; // texto visível
                select.appendChild(option);
                select.value = newBook.publisher?.id
            });
        })
        .catch(error => {
            const msg = error.response?.data?.error || error.message;
            showToast(msg, "error");
        })
    document.getElementById("editar").style.display = "flex";
}

function confirmarEdicao() {
    let idParaEditar = idLivroSelecionado
    const livroEditado = {
        name: document.getElementById('nomeE').value,
        author: document.getElementById('autorE').value,
        launchDate: document.getElementById('dataLancamentoE').value,
        totalQuantity: document.getElementById('estoqueE').value,
        publisherId: document.getElementById('editoraIdE').value
    };

    if (!validaCampos(livroEditado)) {
        document.getElementById("confirmarEdicao").style.display = "none";
        abrirModalEditar();
        return;
    }
    for (let i = 0; i < arrayLivros.length; i++) {
        if (arrayLivros[i].id === idParaEditar) {
            arrayLivros[i] = { ...livroEditado, id: idParaEditar };
            apiClient.put(`/book/${idLivroSelecionado}`, livroEditado)
                .then(response => {
                    showToast("Edição realizada com sucesso!", "success");
                    console.log(response.data)
                    getRegistros()
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
    for (let i = 0; i < arrayLivros.length; i++) {
        let tr = tbody.insertRow();
        let td_id = tr.insertCell();
        let td_nome = tr.insertCell();
        let td_autor = tr.insertCell();
        let td_dataLancamento = tr.insertCell();
        let td_estoque = tr.insertCell();
        let td_alugados = tr.insertCell();
        let td_editora = tr.insertCell();
        let td_acoes = tr.insertCell();

        td_id.innerText = arrayLivros[i].id;
        td_nome.innerText = arrayLivros[i].name;
        td_autor.innerText = arrayLivros[i].author;
        td_dataLancamento.innerText = new Date(arrayLivros[i].launchDate).toLocaleDateString('pt-BR');
        td_estoque.innerText = arrayLivros[i].totalQuantity;
        td_alugados.innerText = arrayLivros[i].totalInUse;
        td_editora.innerText = arrayLivros[i].publisher.name;

        td_id.setAttribute('data-label', 'Id:');
        td_nome.setAttribute('data-label', 'Nome:');
        td_autor.setAttribute('data-label', 'Autor:');
        td_dataLancamento.setAttribute('data-label', 'Data de Lançamento:');
        td_estoque.setAttribute('data-label', 'Estoque:');
        td_alugados.setAttribute('data-label', 'Alugados:');
        td_acoes.setAttribute('data-label', 'Ações:');
        td_editora.setAttribute('data-label', 'Editora:');

        if (roleAtual !== "USER") {

            let imgEdit = document.createElement('i');
            imgEdit.className = 'fas fa-edit';
            td_acoes.appendChild(imgEdit);
            imgEdit.addEventListener("click", () => preparaEditar(arrayLivros[i]));

            let imgExcluir = document.createElement('i');
            imgExcluir.className = 'fas fa-trash';
            td_acoes.appendChild(imgExcluir);
            imgExcluir.setAttribute("onclick", "apagarLivro(" + arrayLivros[i].id + ")");

        }
    }
    atualizarPaginacao();
}

function cancelar() {
    document.getElementById('nome').value = "";
    document.getElementById('autor').value = "";
    document.getElementById('dataLancamento').value = "";
    document.getElementById('estoque').value = "";
    document.getElementById('editoraId').value = "";
    fecharModal();
}


// Paginação

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
    let tabela = document.getElementById('tabelaBiblioteca')
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
        // Se o campo de pesquisa estiver vazio, volta à paginação normal com aquelas 5 linhas
        atualizarPaginacao();
        paginacaoDiv.style.display = 'block';
    } else {
        // Issp vai esconde a paginação durante busca
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

//organizar
const celulasTopo = document.querySelectorAll("#tabelaBiblioteca thead td");
const tbody = document.querySelector("#tabelaBiblioteca tbody");

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
