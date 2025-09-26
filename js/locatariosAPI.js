window.onload = function () {
    document.getElementById('check').checked = true;
    getRegistros();
    getNome();
    verificarPermissoes();
}
let idLocatarioSelecionado = null;
let idParaExcluir = null;

//modais
function abrirModalExcluir() {
    document.getElementById("excluir").style.display = "flex";
}
function abrirModalConfirmarEdicao() {
    document.getElementById("editar").style.display = "none";
    document.getElementById("confirmarEdicao").style.display = "flex";
}
function fecharModal() {
    document.getElementById("visualizar").style.display = "none";
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

//Token API

const token = localStorage.getItem('authToken');
var arrayLocatarios = [];

const apiClient = axios.create({
    baseURL: "https://locadora-ryan-back.altislabtech.com.br",
    headers: {
        'Authorization': `Bearer ${token}`,
        "Content-Type": "application/json"
    }
})

async function getRegistros() {
    apiClient.get('/renter')
        .then(response => {
            console.log(response.data)
            let dadosLocatario = response.data

            if (Array.isArray(dadosLocatario)) {
                arrayLocatarios.length = 0
                arrayLocatarios.push(...dadosLocatario)
            } else {
                arrayLocatarios.length = 0
                arrayLocatarios.push(dadosLocatario)
            }
            listaTabela()
        })
        .catch(e => {
            const msg = error.response?.data?.error || error.message;
            showToast(msg, "error");
        })
}

function listaTabela() {
    let tbody = document.getElementById('tbody');
    tbody.innerText = '';
    const roleAtual = localStorage.getItem("roleUsuario");
    for (let i = 0; i < arrayLocatarios.length; i++) {
        let tr = tbody.insertRow();
        let td_id = tr.insertCell();
        let td_nome = tr.insertCell();
        let td_email = tr.insertCell();
        let td_telefone = tr.insertCell();
        let td_cpf = tr.insertCell();
        let td_acoes = tr.insertCell();

        td_id.innerText = this.arrayLocatarios[i].id;
        td_nome.innerText = this.arrayLocatarios[i].name;
        td_email.innerText = this.arrayLocatarios[i].email;
        td_telefone.innerText = this.arrayLocatarios[i].telephone;
        td_cpf.innerText = this.arrayLocatarios[i].cpf;

        td_id.setAttribute('data-label', 'Id:');
        td_nome.setAttribute('data-label', 'Nome:');
        td_email.setAttribute('data-label', 'E-mail:');
        td_telefone.setAttribute('data-label', 'Telefone:');
        td_cpf.setAttribute('data-label', 'CPF:');
        td_acoes.setAttribute('data-label', 'Ações:');
        if (roleAtual !== "USER") {
            let imgEdit = document.createElement('i');
            imgEdit.className = 'fas fa-edit';
            td_acoes.appendChild(imgEdit);
            imgEdit.setAttribute("onclick", "preparaEditar(" + JSON.stringify(this.arrayLocatarios[i]) + ")");

            let imgExcluir = document.createElement('i');
            imgExcluir.className = 'fas fa-trash';
            td_acoes.appendChild(imgExcluir);
            imgExcluir.setAttribute("onclick", "apagarLocatario(" + this.arrayLocatarios[i].id + ")");
        }
        let imgVisualizar = document.createElement('i');
        imgVisualizar.className = 'fas fa-eye';
        td_acoes.appendChild(imgVisualizar);
        imgVisualizar.setAttribute("onclick", "visualizar(" + i + ")")
    }
    atualizarPaginacao();
}

function adicionarDados() {
    const newRenter = {
        name: document.getElementById('nome').value,
        email: document.getElementById('email').value,
        telephone: document.getElementById('telefone').value,
        address: document.getElementById('endereco').value,
        cpf: document.getElementById('cpf').value
    }
    if (!validaCampos(newRenter)) {
        return
    }
    apiClient.post('/renter', newRenter)
        .then(response => {
            showToast('Locatário cadastrado com sucesso!', "success")
            getRegistros()
            fecharModal()
            document.getElementById('nome').value = "";
            document.getElementById('email').value = "";
            document.getElementById('telefone').value = "";
            document.getElementById('endereco').value = "";
            document.getElementById('cpf').value = "";
        })
        .catch(error => {
            const msg = error.response?.data?.error || error.message;
            showToast(msg, "error");
        })
}

function validaCampos(newRenter) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const telefoneRegex = /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/;
    const cpfRegex = /^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/;
    if (newRenter.name == "" || newRenter.email == "" || newRenter.telephone == "" || newRenter.address == "" || newRenter.cpf == "") {
        showToast("Os campos devem ser preenchidos!", "error");
        return false;
    } else if (!emailRegex.test(newRenter.email)) {
        showToast("Digite um e-mail válido!", "error");
        return false;
    } else if (newRenter.cpf && !cpfRegex.test(newRenter.cpf)) {
        showToast("Digite um CPF válido!", "error");
        return false;
    } else if (!telefoneRegex.test(newRenter.telephone)) {
        showToast("Digite um telefone válido!", "error");
        return false;
    }
    return true;
}

function cancelar() {
    document.getElementById('nome').value = "";
    document.getElementById('email').value = "";
    document.getElementById('telefone').value = "";
    document.getElementById('endereco').value = "";
    document.getElementById('cpf').value = "";
    fecharModal();
}

function apagarLocatario(id) {
    idParaExcluir = id;
    abrirModalExcluir();
    const btn = document.getElementById("excluirbtn");
    btn.onclick = () => {
        let tbody = document.getElementById("tbody");

        for (let i = 0; i < arrayLocatarios.length; i++) {
            if (arrayLocatarios[i].id == idParaExcluir) {


                apiClient.delete(`/renter/${idParaExcluir}`)
                    .then(response => {
                        showToast("Exclusão realizada com sucesso!", "success");
                        console.log(response.data)
                        arrayLocatarios.splice(i, 1);
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

function preparaEditar(newRenter) {
    idLocatarioSelecionado = newRenter.id;
    document.getElementById("editar").style.display = "flex";
    document.getElementById('nomeE').value = newRenter.name;
    document.getElementById('emailE').value = newRenter.email;
    document.getElementById('telefoneE').value = newRenter.telephone;
    document.getElementById('enderecoE').value = newRenter.address;
    document.getElementById('cpfE').value = newRenter.cpf;
}

function confirmarEdicao() {
    let idParaEditar = idLocatarioSelecionado
    const locatarioEditado = {
        name: document.getElementById('nomeE').value,
        email: document.getElementById('emailE').value,
        telephone: document.getElementById('telefoneE').value,
        address: document.getElementById('enderecoE').value,
        cpf: document.getElementById('cpfE').value
    };

    if (!validaCampos(locatarioEditado)) {
        document.getElementById("confirmarEdicao").style.display = "none";
        abrirModalEditar();
        return;
    }
    for (let i = 0; i < arrayLocatarios.length; i++) {
        if (arrayLocatarios[i].id === idParaEditar) {
            arrayLocatarios[i] = { ...locatarioEditado, id: idParaEditar };
            apiClient.put(`/renter/${idLocatarioSelecionado}`, locatarioEditado)
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

function visualizar(newRenter) {
    const dados = this.arrayLocatarios[newRenter];
    idParaEditar = dados.id;
    document.getElementById("visualizar").style.display = "flex";
    document.getElementById('nomeView').innerText = dados.name;
    document.getElementById('emailView').innerText = dados.email;
    document.getElementById('telefoneView').innerText = dados.telephone;
    document.getElementById('cpfView').innerText = dados.cpf;
    document.getElementById('enderecoView').innerText = dados.address;
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
    let tabela = document.getElementById('tabelaLocatarios')
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

//organizar
const celulasTopo = document.querySelectorAll("#tabelaLocatarios thead td");
const tbody = document.querySelector("#tabelaLocatarios tbody");

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


