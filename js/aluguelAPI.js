window.onload = function () {
    document.getElementById('check').checked = true;
    getRegistros();
    getNome();
    verificarPermissoes();
}
let idAluguelSelecionado = null;
let idParaExcluir = null;

//modais
function abrirModalAtualizar() {
    document.getElementById("atualizar").style.display = "flex";
}
function abrirModalConfirmarEdicao() {
    document.getElementById("editar").style.display = "none";
    document.getElementById("confirmarEdicao").style.display = "flex";
}
function fecharModal() {
    const modais = ["visualizar", "criar", "editar", "atualizar", "confirmarEdicao"];
    modais.forEach(id => {
        const modal = document.getElementById(id);
        if (modal) modal.style.display = "none";
    });
}
function abrirModalEditar() {
    document.getElementById("editar").style.display = "flex";
}
function btnAdicionar() {
    const selectLivro = document.getElementById("livroId");

    apiClient.get('/book')
        .then(response => {
            const dados = response.data || [];
            console.log(response)
            dados.forEach((book) => {
                const option = document.createElement("option");
                option.value = book.id;       // valor do option
                option.textContent = book.name; // texto visível
                selectLivro.appendChild(option);
            });
        })
        .catch(error => {
            const msg = error.response?.data?.error || error.message;
            showToast(msg, "error");
        })

    const selectLocatario = document.getElementById("locatarioId");

    apiClient.get('/renter')
        .then(response => {
            const dados = response.data || [];
            console.log(response)
            dados.forEach((renter) => {
                const option = document.createElement("option");
                option.value = renter.id;       // valor do option
                option.textContent = renter.name; // texto visível
                selectLocatario.appendChild(option);
            });
        })
        .catch(error => {
            const msg = error.response?.data?.error || error.message;
            showToast(msg, "error");
        })

    document.getElementById("criar").style.display = "flex";
}

//token api

const token = localStorage.getItem('authToken');
var arrayAlugueis = [];

const apiClient = axios.create({
    baseURL: "https://locadora-ryan-back.altislabtech.com.br",
    headers: {
        'Authorization': `Bearer ${token}`,
        "Content-Type": "application/json"
    }
})

async function getRegistros() {
    apiClient.get('/rent')
        .then(response => {
            console.log(response.data)
            let dadosAluguel = response.data

            if (Array.isArray(dadosAluguel)) {
                arrayAlugueis.length = 0;
                arrayAlugueis.push(...dadosAluguel);
            } else {
                arrayAlugueis.length = 0;
                arrayAlugueis.push(dadosAluguel);
            }
            listaTabela()
        })
        .catch(error => {
            const msg = error.response?.data?.error || error.message;
            showToast(msg, "error");
        })
}

function listaTabela() {
    let tbody = document.getElementById('tbody');
    tbody.innerText = '';
    const roleAtual = localStorage.getItem("roleUsuario");
    for (let i = 0; i < arrayAlugueis.length; i++) {
        let tr = tbody.insertRow();
        let td_id = tr.insertCell();
        let td_livro = tr.insertCell();
        let td_locatario = tr.insertCell();
        let td_dataLocacao = tr.insertCell();
        let td_dataDevolucao = tr.insertCell();
        let td_status = tr.insertCell();
        let td_acoes = tr.insertCell();

        td_id.innerText = arrayAlugueis[i].id;
        td_livro.innerText = arrayAlugueis[i].book.name;
        td_locatario.innerText = arrayAlugueis[i].renter.name;
        td_dataLocacao.innerText = new Date(arrayAlugueis[i].rentDate).toLocaleDateString('pt-BR');
        td_dataDevolucao.innerText = new Date(arrayAlugueis[i].deadLine).toLocaleDateString('pt-BR');
        // td_dataLocacao.innerText = arrayAlugueis[i].rentDate;
        // td_dataDevolucao.innerText = arrayAlugueis[i].deadLine;
        // td_status.innerText = arrayAlugueis[i].status;

        if (this.arrayAlugueis[i].status == "RENTED") {
            td_status.innerText = "Pendente";
        } else if (this.arrayAlugueis[i].status == "IN_TIME") {
            td_status.innerText = "Entregue no prazo";
        } else {
            td_status.innerText = "Entregue com atraso";
        }


        td_id.setAttribute('data-label', 'Id:');
        td_livro.setAttribute('data-label', 'Livro:');
        td_locatario.setAttribute('data-label', 'Locatário:');
        td_dataLocacao.setAttribute('data-label', 'Data de locação:');
        td_dataDevolucao.setAttribute('data-label', 'Data de devolução:');
        td_status.setAttribute('data-label', 'Status:');
        td_acoes.setAttribute('data-label', 'Ações:');
        if (roleAtual !== "USER") {
            let imgCheck = document.createElement('i');
            imgCheck.className = 'fa-solid fa-check';
            td_acoes.appendChild(imgCheck);
            imgCheck.setAttribute("onclick", "atualizarAluguel(" + arrayAlugueis[i].id + ")");

            let imgEdit = document.createElement('i');
            imgEdit.className = 'fas fa-edit';
            td_acoes.appendChild(imgEdit);
            imgEdit.setAttribute("onclick", "preparaEditar(" + JSON.stringify(arrayAlugueis[i]) + ")");

            if (arrayAlugueis[i].status !== "RENTED") {
                imgCheck.style.display = "none";
                imgEdit.style.display = "none";
                td_acoes.setAttribute('data-label', '');
            }
        }
    }
    atualizarPaginacao();
}

function adicionarDados() {
    const selectLivro = document.getElementById("livroId");
    const selectLocatario = document.getElementById("locatarioId");
    const inputData = document.getElementById("dataDevolucao");

    [selectLivro, selectLocatario, inputData].forEach(el => {
        el.style.border = "";
        el.style.boxShadow = "";
        el.style.color = "white"
    });
    const newRent = {
        bookId: document.getElementById('livroId').value,
        renterId: document.getElementById('locatarioId').value,
        deadLine: document.getElementById('dataDevolucao').value
    }
    if (!validaCampos(newRent)) {
        return
    }
    apiClient.post('/rent', newRent)
        .then(response => {
            showToast('Usuário cadastrado com sucesso!', "success")
            getRegistros();
            fecharModal();
            document.getElementById('livroId').value = "";
            document.getElementById('locatarioId').value = "";
            document.getElementById('dataDevolucao').value = "";
        })
        .catch(error => {
            const msg = error.response?.data?.error || error.message;
            showToast(msg, "error");
        })
}
// //  ||  || 
// function validaCampos(newRent) {
//     const inputs = document.getElementsByClassName("formInput");
//     const selectLivro = document.getElementById("livroId");
//     const selectLocatario = document.getElementById("locatarioId");
//     // const opcaoLivro = selectLivro.querySelector('option[value="livro"]');
//     // const opcaoLocatario = selectLocatario.querySelector('option[value="locatario"]');
//     if (newRent.bookId == "") {
//         showToast("Os campos devem ser preenchidos!", "error");
//         selectLivro.style.border = "2px solid red";
// selectLivro.style.backgroundColor = "red";
//         return false;
//     } else if (newRent.renterId == "") {
//         showToast("Os campos devem ser preenchidos!", "error");
//         opcaoLocatario.style.color = "red"
//         return false;
//     } else if (newRent.deadLine == "") {
//         showToast("Os campos devem ser preenchidos!", "error");
//         inputs.style.boxShadow = "  0px 2px 0px #FF6347";
//         return false;
//     }
//     return true
// }

function validaCampos(newRent) {
    const selectLivro = document.getElementById("livroId");
    const selectLocatario = document.getElementById("locatarioId");
    const inputData = document.getElementById("dataDevolucao");

    let valido = true;

    [selectLivro, selectLocatario, inputData].forEach(el => {
        el.style.border = "";
        el.style.boxShadow = "";
        el.style.color = "white"
    });

    if (newRent.bookId == "" || newRent.bookId == "livro") {
        showToast("Selecione um livro!", "error");
        selectLivro.style.border = "2px solid red";
        selectLivro.style.color = "red"
        valido = false;
    }

    if (newRent.renterId == "" || newRent.renterId == "locatario") {
        showToast("Selecione um locatário!", "error");
        selectLocatario.style.border = "2px solid red";
        selectLocatario.style.color = "red"
        valido = false;
    }

    if (newRent.deadLine == "") {
        showToast("Preencha a data de devolução!", "error");
        inputData.style.border = "2px solid red";
        inputData.style.color = "red"
        valido = false;
    }

    return valido;
}

function preparaEditar(newRent) {
    idAluguelSelecionado = newRent.id;
    // document.getElementById('dataLocacaoE').value = newRent.rentDate;
    document.getElementById('dataDevolucaoE').value = newRent.deadLine;

    const selectLivro = document.getElementById("livroIdE");

    apiClient.get('/book')
        .then(response => {
            const dados = response.data || [];
            console.log(response)
            dados.forEach((book) => {
                const option = document.createElement("option");
                option.value = book.id;       // valor do option
                option.textContent = book.name; // texto visível
                selectLivro.value = newRent.book.id
                selectLivro.appendChild(option);
            });
        })
        .catch(e => console.error('Erro ao carregar select:', e));

    const selectLocatario = document.getElementById("locatarioIdE");

    apiClient.get('/renter')
        .then(response => {
            const dados = response.data || [];
            console.log(response)
            dados.forEach((renter) => {
                const option = document.createElement("option");
                option.value = renter.id;       // valor do option
                option.textContent = renter.name; // texto visível
                selectLocatario.value = newRent.renter.id
                selectLocatario.appendChild(option);
            });
        })
        .catch(error => {
            const msg = error.response?.data?.error || error.message;
            showToast(msg, "error");
        })
    document.getElementById("editar").style.display = "flex";
}

function cancelar() {
    document.getElementById('dataDevolucao').value = "";
    document.getElementById('livroId').value = "livro";
    document.getElementById('locatarioId').value = "locatario";
    const selectLivro = document.getElementById("livroId");
    const selectLocatario = document.getElementById("locatarioId");
    const inputData = document.getElementById("dataDevolucao");


    [selectLivro, selectLocatario, inputData].forEach(el => {
        el.style.border = "";
        el.style.boxShadow = "";
        el.style.color = "white"
    });
    fecharModal();
}



function confirmarEdicao() {
    let idParaEditar = idAluguelSelecionado
    const aluguelEditado = {
        renterId: document.getElementById('locatarioIdE').value,
        bookId: document.getElementById('livroIdE').value,
        deadLine: document.getElementById('dataDevolucaoE').value,
        // devolutionDate: document.getElementById('dataLocacaoE').value
    };
    // if (!aluguelEditado.renterId || !aluguelEditado.bookId || !aluguelEditado.deadLine) {
    //     showToast("Os campos devem ser preenchidos!", "error");
    //     document.getElementById("confirmarEdicao").style.display = "none";
    //     document.getElementById("editar").style.display = "flex";
    //     return;
    // }
    const selectLivro = document.getElementById("livroIdE");
    const selectLocatario = document.getElementById("locatarioIdE");
    const inputData = document.getElementById("dataDevolucaoE");

    [selectLivro, selectLocatario, inputData].forEach(el => {
        el.style.border = "";
        el.style.boxShadow = "";
        el.style.color = "white"
    });

    if (aluguelEditado.bookId == "" || aluguelEditado.bookId == "livro") {
        showToast("Selecione um livro!", "error");
        selectLivro.style.border = "2px solid red";
        selectLivro.style.color = "red"
        document.getElementById("confirmarEdicao").style.display = "none";
        document.getElementById("editar").style.display = "flex";
        return
    }  if(aluguelEditado.renterId == "" || aluguelEditado.renterId == "locatario") {
        showToast("Selecione um locatário!", "error");
        selectLocatario.style.border = "2px solid red";
        selectLocatario.style.color = "red"
        document.getElementById("confirmarEdicao").style.display = "none";
        document.getElementById("editar").style.display = "flex";
        return
    } if(aluguelEditado.deadLine == "") {
        showToast("Preencha a data de devolução!", "error");
        inputData.style.border = "2px solid red";
        inputData.style.color = "red"
        document.getElementById("confirmarEdicao").style.display = "none";
        document.getElementById("editar").style.display = "flex";
        return
    }


    for (let i = 0; i < arrayAlugueis.length; i++) {
        if (arrayAlugueis[i].id === idParaEditar) {
            arrayAlugueis[i] = { ...aluguelEditado, id: idParaEditar };
            apiClient.put(`/rent/update/${idAluguelSelecionado}`, aluguelEditado)
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



function atualizarAluguel(id) {
    abrirModalAtualizar();
    const btn = document.getElementById("excluirbtn");
    btn.onclick = () => {
        idAluguelSelecionado = id;
        apiClient.put(`/rent/${idAluguelSelecionado}`)
            .then(response => {
                showToast("Devolução realizada com sucesso!", "success");
                console.log(response.data);
                fecharModal();
                getRegistros();
            })
            .catch(error => {
                const msg = error.response?.data?.error || error.message;
                showToast(msg, "error");
            })
    }
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
    let tabela = document.getElementById('tabelaAlugueis')
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

    }
}

//organizar
const celulasTopo = document.querySelectorAll("#tabelaAlugueis thead td");
const tbody = document.querySelector("#tabelaAlugueis tbody");

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

//escutas para erro criar e editar

//criar

document.getElementById("livroId").addEventListener("change", function() {
    if (this.value !== "livro" && this.value !== "") {
        this.style.border = "";
        this.style.color = "white";
    }
});

document.getElementById("locatarioId").addEventListener("change", function() {
    if (this.value !== "locatario" && this.value !== "") {
        this.style.border = "";
        this.style.color = "white";
    }
});

document.getElementById("dataDevolucao").addEventListener("input", function() {
    if (this.value !== "") {
        this.style.border = "";
        this.style.color = "white";
    }
});

//editar

document.getElementById("livroIdE").addEventListener("change", function() {
    if (this.value !== "livro" && this.value !== "") {
        this.style.border = "";
        this.style.color = "white";
    }
});

document.getElementById("locatarioIdE").addEventListener("change", function() {
    if (this.value !== "locatario" && this.value !== "") {
        this.style.border = "";
        this.style.color = "white";
    }
});

document.getElementById("dataDevolucaoE").addEventListener("input", function() {
    if (this.value !== "") {
        this.style.border = "";
        this.style.color = "white";
    }
});