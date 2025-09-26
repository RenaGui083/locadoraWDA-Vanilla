window.onload = function () {
    document.getElementById('check').checked = true;
    verificarPermissoes();
    getRegistros();
    getNome();
}
let idUsuarioSelecionado = null;
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

//token api

const token = localStorage.getItem('authToken');
var arrayUsuarios = [];

const apiClient = axios.create({
    baseURL: "https://locadora-ryan-back.altislabtech.com.br",
    headers: {
        'Authorization': `Bearer ${token}`,
        "Content-Type": "application/json"
    }
})

async function getRegistros() {
    apiClient.get('/user')
        .then(response => {
            console.log(response.data)
            let dadosUsuario = response.data

            if (Array.isArray(dadosUsuario)) {
                arrayUsuarios.length = 0;
                arrayUsuarios.push(...dadosUsuario);
            } else {
                arrayUsuarios.length = 0;
                arrayUsuarios.push(dadosUsuario);
            }
            listaTabela()
        })
        .catch(e => {
            console.error('Erro:', e.response?.data || e.message)
            const msg = error.response?.data?.error || error.message;
            showToast(msg, "error");
        })
}

function listaTabela() {
    let tbody = document.getElementById('tbody');
    tbody.innerText = '';
    const roleAtual = localStorage.getItem("roleUsuario");
    for (let i = 0; i < arrayUsuarios.length; i++) {
        let tr = tbody.insertRow();
        let td_id = tr.insertCell();
        let td_nome = tr.insertCell();
        let td_email = tr.insertCell();
        let td_nivelAcesso = tr.insertCell();
        let td_acoes = tr.insertCell();

        td_id.innerText = this.arrayUsuarios[i].id;
        td_nome.innerText = this.arrayUsuarios[i].name;
        td_email.innerText = this.arrayUsuarios[i].email;
        // td_nivelAcesso = this.arrayUsuarios[i].role;

        if (this.arrayUsuarios[i].role == "USER") {
            td_nivelAcesso.innerText = "Usuário";
        } else {
            td_nivelAcesso.innerText = "Administrador";
        }

        td_id.setAttribute('data-label', 'Id:');
        td_nome.setAttribute('data-label', 'Nome:');
        td_email.setAttribute('data-label', 'E-mail:');
        td_nivelAcesso.setAttribute('data-label', 'Nível de acesso:');
        td_acoes.setAttribute('data-label', 'Ações:');

        // let imgEdit = document.createElement('i');
        // imgEdit.className = 'fas fa-edit';
        // td_acoes.appendChild(imgEdit);
        // imgEdit.setAttribute("onclick", "preparaEditar(" + JSON.stringify(arrayUsuarios[i]) + ")");

        // let imgExcluir = document.createElement('i');
        // imgExcluir.className = 'fas fa-trash';
        // td_acoes.appendChild(imgExcluir);
        // imgExcluir.setAttribute("onclick", "apagarUsuario(" + arrayUsuarios[i].id + ")");

        if (roleAtual !== "USER") {
            let imgEdit = document.createElement('i');
            imgEdit.className = 'fas fa-edit';
            imgEdit.setAttribute("onclick", "preparaEditar(" + JSON.stringify(arrayUsuarios[i]) + ")");
            td_acoes.appendChild(imgEdit);

            let imgExcluir = document.createElement('i');
            imgExcluir.className = 'fas fa-trash';
            imgExcluir.setAttribute("onclick", "apagarUsuario(" + arrayUsuarios[i].id + ")");
            td_acoes.appendChild(imgExcluir);

        }

        let imgVisualizar = document.createElement('i');
        imgVisualizar.className = 'fas fa-eye';
        td_acoes.appendChild(imgVisualizar);
        imgVisualizar.setAttribute("onclick", "visualizar(" + i + ")")
    }
    atualizarPaginacao();
}

function adicionarDados() {
    const newUser = {
        name: document.getElementById('nome').value,
        email: document.getElementById('email').value,
        password: document.getElementById('senha').value,
        role: document.getElementById('nivelAcesso').value
    }
    if (!validaCampos(newUser)) {
        return
    }
    apiClient.post('/user', newUser)
        .then(response => {
            showToast('Usuário cadastrado com sucesso!', "success")
            getRegistros();
            fecharModal();
            document.getElementById('nome').value = "";
            document.getElementById('email').value = "";
            document.getElementById('senha').value = "";
        })
        .catch(error => {
            const msg = error.response?.data?.error || error.message;
            showToast(msg, "error");
        })
}

function validaCampos(newUser) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (newUser.name == "" || newUser.email == "" || newUser.password == "" || newUser.role == "") {
        showToast("Os campos devem ser preenchidos!", "error");
        return false;
    } else if (newUser.password.length < 7) {
        showToast("A senha deve ter pelo menos 8 dígitos!", "error");
        return false
    } else if (newUser.password.length > 12) {
        showToast("A senha deve ter no máximo 12 dígitos!", "error");
        return false
    } else if (!emailRegex.test(newUser.email)) {
        showToast("Escreva um email válido!", "error ");
        return false
    }
    return true;
}

function cancelar() {
    document.getElementById('nome').value = "";
    document.getElementById('email').value = "";
    document.getElementById('senha').value = "";
    fecharModal();
}

function visualizar(newUser) {
    const dados = this.arrayUsuarios[newUser];
    idParaEditar = dados.id;
    document.getElementById("visualizar").style.display = "flex";
    document.getElementById('nomeView').innerText = dados.name;
    document.getElementById('emailView').innerText = dados.email;
    // document.getElementById('senhaView').innerText = dados.password;
    document.getElementById('senhaView').innerText = '••••••••';
    document.getElementById('nivelAcessoView').innerText = dados.role;
}

function apagarUsuario(id) {
    let nomeUser = localStorage.getItem("nomeUsuario");
    idParaExcluir = id;
    abrirModalExcluir();
    const btn = document.getElementById("excluirbtn");
    btn.onclick = () => {
        let tbody = document.getElementById("tbody");

        for (let i = 0; i < arrayUsuarios.length; i++) {
            if (arrayUsuarios[i].id == idParaExcluir) {

                if (arrayUsuarios[i].name == nomeUser) {
                    showToast("Você não pode excluir o usuário que está logado!", "error");
                    fecharModal();
                    return; // sai da função sem chamar a API
                }

                apiClient.delete(`/user/${idParaExcluir}`)
                    .then(response => {
                        showToast("Exclusão realizada com sucesso!", "success");
                        console.log(response.data)
                        arrayUsuarios.splice(i, 1);
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

function preparaEditar(newUser) {
    idUsuarioSelecionado = newUser.id;
    document.getElementById("editar").style.display = "flex";
    document.getElementById('nomeE').value = newUser.name;
    document.getElementById('emailE').value = newUser.email;
    document.getElementById('senhaE').value = newUser.password;
    document.getElementById('nivelAcessoE').value = newUser.role;
}

function confirmarEdicao() {
    let idParaEditar = idUsuarioSelecionado
    const usuarioEditado = {
        name: document.getElementById('nomeE').value,
        email: document.getElementById('emailE').value,
        password: document.getElementById('senhaE').value,
        role: document.getElementById('nivelAcessoE').value,
    };

    if (!validaCampos(usuarioEditado)) {
        document.getElementById("modalConfirmarEdicao").style.display = "none";
        abrirModalEditar();
        return;
    }
    for (let i = 0; i < arrayUsuarios.length; i++) {
        if (arrayUsuarios[i].id === idParaEditar) {
            arrayUsuarios[i] = { ...usuarioEditado, id: idParaEditar };
            apiClient.put(`/user/${idUsuarioSelecionado}`, usuarioEditado)
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
    let tabela = document.getElementById('tabelaUsuarios')
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

        // // Esconde ícones de edição/exclusão
        // document.querySelectorAll(".fa-edit, .fa-trash").forEach(icon => {
        //     icon.style.display = "none";
        // });
    }
}

//ordenar

const celulasTopo = document.querySelectorAll("#tabelaUsuarios thead td");
const tbody = document.querySelector("#tabelaUsuarios tbody");

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
