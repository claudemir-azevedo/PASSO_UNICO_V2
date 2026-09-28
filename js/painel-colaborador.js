/* ==========================================================
   PASSO ÚNICO
   PAINEL DO COLABORADOR
   Enterprise 3.0
========================================================== */

let usuarioAtual = null;
let colaborador = null;

let calcados = [];
let calcadosFiltrados = [];

let paginaAtualGrid = 1;
const itensPorPagina = 9;

let calcadoSelecionado = null;

/* ==========================================================
   INICIALIZAÇÃO
========================================================== */

document.addEventListener("DOMContentLoaded", iniciarPainel);

async function iniciarPainel() {

    try {

        mostrarLoader();

        await verificarSessao();

        await carregarUsuario();

        atualizarSaudacao();

        await carregarCalcados();

        atualizarDashboard();

        aplicarFiltros();

        registrarEventos();

    } catch (erro) {

        console.error(erro);

        toastErro(
            "Não foi possível carregar seu painel."
        );

    } finally {

        esconderLoader();

    }

}

/* ==========================================================
   AUTENTICAÇÃO
========================================================== */

async function verificarSessao() {

    const {

        data,
        error

    } = await supabase.auth.getUser();

    if (error || !data.user) {

        window.location.href = "login.html";

        return;

    }

    usuarioAtual = data.user;

}

/* ==========================================================
   DADOS DO USUÁRIO
========================================================== */

async function carregarUsuario() {

    const {

        data,
        error

    } = await supabase

        .from("usuarios")

        .select("*")

        .eq("id", usuarioAtual.id)

        .single();

    if (error) throw error;

    colaborador = data;

}

/* ==========================================================
   SAUDAÇÃO
========================================================== */

function atualizarSaudacao() {

    const titulo = document.getElementById(
        "saudacaoUsuario"
    );

    if (!titulo) return;

    const hora = new Date().getHours();

    let saudacao = "Olá";

    if (hora < 12)
        saudacao = "Bom dia";

    else if (hora < 18)
        saudacao = "Boa tarde";

    else
        saudacao = "Boa noite";

    titulo.textContent =
        `${saudacao}, ${colaborador.nome}!`;

}

/* ==========================================================
   CALÇADOS
========================================================== */

async function carregarCalcados() {

    const {

        data,
        error

    } = await supabase

        .from("calcados")

        .select("*")

        .eq("usuario_id", usuarioAtual.id)

        .order("created_at", {

            ascending: false

        });

    if (error) throw error;

    calcados = data || [];

}

/* ==========================================================
   DASHBOARD
========================================================== */

function atualizarDashboard() {

    const total = calcados.length;

    const disponiveis =
        calcados.filter(

            c => c.status === "disponivel"

        ).length;

    const entregues =
        calcados.filter(

            c => c.status === "entregue"

        ).length;

    const pendentes =
        calcados.filter(

            c => c.status === "reservado"

        ).length;

    atualizarNumero(
        "totalCalcados",
        total
    );

    atualizarNumero(
        "totalDisponiveis",
        disponiveis
    );

    atualizarNumero(
        "totalEntregues",
        entregues
    );

    atualizarNumero(
        "totalPendentes",
        pendentes
    );

    atualizarResumo();

}

/* ==========================================================
   RESUMO
========================================================== */

function atualizarResumo() {

    const texto =
        document.getElementById(
            "textoResumo"
        );

    if (!texto) return;

    texto.innerHTML =

        `${calcados.length}
         cadastro(s) encontrado(s).`;

}

/* ==========================================================
   AUXILIAR
========================================================== */

function atualizarNumero(id, valor) {

    const elemento =
        document.getElementById(id);

    if (!elemento) return;

    elemento.textContent = valor;

}

/* ==========================================================
   LOADER
========================================================== */

function mostrarLoader() {

    if (typeof mostrarLoaderGlobal === "function") {

        mostrarLoaderGlobal();

        return;

    }

    const loader =
        document.getElementById(
            "loaderGlobal"
        );

    if (loader)

        loader.classList.remove("oculto");

}

function esconderLoader() {

    if (typeof esconderLoaderGlobal === "function") {

        esconderLoaderGlobal();

        return;

    }

    const loader =
        document.getElementById(
            "loaderGlobal"
        );

    if (loader)

        loader.classList.add("oculto");

}

/* ==========================================================
   TOAST
========================================================== */

function toastSucesso(msg){

    if(typeof mostrarToast==="function"){

        mostrarToast(msg,"sucesso");

    }

}

function toastErro(msg){

    if(typeof mostrarToast==="function"){

        mostrarToast(msg,"erro");

    }

}

/* ==========================================================
   EVENTOS
========================================================== */

function registrarEventos() {

    const busca = document.getElementById("campoBusca");
    const filtro = document.getElementById("filtroStatus");
    const ordem = document.getElementById("ordenacao");

    if (busca)
        busca.addEventListener("input", aplicarFiltros);

    if (filtro)
        filtro.addEventListener("change", aplicarFiltros);

    if (ordem)
        ordem.addEventListener("change", aplicarFiltros);

    const atualizar = document.getElementById("btnAtualizarPainel");

    if (atualizar) {

        atualizar.addEventListener("click", async () => {

            mostrarLoader();

            await carregarCalcados();

            atualizarDashboard();

            aplicarFiltros();

            esconderLoader();

            toastSucesso("Painel atualizado.");

        });

    }

}

/* ==========================================================
   FILTROS
========================================================== */

function aplicarFiltros() {

    const texto =
        document.getElementById("campoBusca")
            ?.value
            ?.toLowerCase()
            ?.trim() || "";

    const status =
        document.getElementById("filtroStatus")
            ?.value || "";

    const ordem =
        document.getElementById("ordenacao")
            ?.value || "recentes";

    calcadosFiltrados = calcados.filter(calcado => {

        const pesquisa = [

            calcado.marca,
            calcado.modelo,
            calcado.numero,
            calcado.cidade,
            calcado.estado

        ]

        .join(" ")

        .toLowerCase();

        const okTexto =
            pesquisa.includes(texto);

        const okStatus =
            !status ||
            calcado.status === status;

        return okTexto && okStatus;

    });

    ordenarCalcados(ordem);

    paginaAtualGrid = 1;

    renderizarLista();

}

/* ==========================================================
   ORDENAÇÃO
========================================================== */

function ordenarCalcados(tipo) {

    switch (tipo) {

        case "antigos":

            calcadosFiltrados.sort((a, b) =>
                new Date(a.created_at) -
                new Date(b.created_at)
            );

            break;

        case "numero":

            calcadosFiltrados.sort((a, b) =>
                Number(a.numero) -
                Number(b.numero)
            );

            break;

        case "marca":

            calcadosFiltrados.sort((a, b) =>
                (a.marca || "")
                    .localeCompare(
                        b.marca || "",
                        "pt-BR"
                    )
            );

            break;

        default:

            calcadosFiltrados.sort((a, b) =>
                new Date(b.created_at) -
                new Date(a.created_at)
            );

    }

}

/* ==========================================================
   LISTA
========================================================== */

function renderizarLista() {

    const lista =
        document.getElementById("listaCalcados");

    const vazio =
        document.getElementById("estadoVazio");

    lista.innerHTML = "";

    if (!calcadosFiltrados.length) {

        vazio.classList.remove("oculto");

        document
            .getElementById("paginacao")
            ?.classList.add("oculto");

        return;

    }

    vazio.classList.add("oculto");

    const inicio =
        (paginaAtualGrid - 1) *
        itensPorPagina;

    const pagina = calcadosFiltrados.slice(

        inicio,

        inicio + itensPorPagina

    );

    pagina.forEach(calcado => {

        lista.insertAdjacentHTML(

            "beforeend",

            criarCard(calcado)

        );

    });

    registrarEventosCards();

    renderizarPaginacao();

}

/* ==========================================================
   CARD
========================================================== */

function criarCard(calcado) {

    const imagem =

        calcado.imagem ||

        "img/sem-imagem.jpg";

    const statusClasse =

        `badge-${calcado.status}`;

    return `

<article
class="calcado-card"
data-id="${calcado.id}">

<div class="calcado-imagem">

<img
src="${imagem}"
alt="${calcado.modelo}">

<span
class="badge-status ${statusClasse}">

${formatarStatus(calcado.status)}

</span>

</div>

<div class="calcado-body">

<div class="calcado-header">

<div>

<h3>

${calcado.marca || "-"}

${calcado.modelo || ""}

</h3>

</div>

<div class="calcado-numero">

Nº ${calcado.numero}

</div>

</div>

<div class="calcado-info">

<div class="info-item">

<span>Cidade</span>

<strong>

${calcado.cidade || "-"}

</strong>

</div>

<div class="info-item">

<span>Estado</span>

<strong>

${calcado.estado || "-"}

</strong>

</div>

<div class="info-item">

<span>Pé</span>

<strong>

${calcado.pe || "-"}

</strong>

</div>

<div class="info-item">

<span>Status</span>

<strong>

${formatarStatus(calcado.status)}

</strong>

</div>

</div>

<p class="calcado-descricao">

${

(calcado.observacoes || "")

.substring(0,120)

}

</p>

<div class="calcado-acoes">

<button
class="btn-ver"
data-id="${calcado.id}">

Ver

</button>

<button
class="btn-editar"
data-id="${calcado.id}">

Editar

</button>

<button
class="btn-excluir"
data-id="${calcado.id}">

Excluir

</button>

</div>

</div>

</article>

`;

}

/* ==========================================================
   PAGINAÇÃO
========================================================== */

function renderizarPaginacao() {

    const container =
        document.getElementById("paginas");

    const paginacao =
        document.getElementById("paginacao");

    if (!container || !paginacao) return;

    container.innerHTML = "";

    const totalPaginas = Math.ceil(
        calcadosFiltrados.length / itensPorPagina
    );

    if (totalPaginas <= 1) {

        paginacao.classList.add("oculto");
        return;

    }

    paginacao.classList.remove("oculto");

    for (let i = 1; i <= totalPaginas; i++) {

        const botao = document.createElement("button");

        botao.textContent = i;

        if (i === paginaAtualGrid)
            botao.classList.add("ativa");

        botao.addEventListener("click", () => {

            paginaAtualGrid = i;

            renderizarLista();

        });

        container.appendChild(botao);

    }

    document.getElementById("paginaAnterior")
        ?.onclick = () => {

        if (paginaAtualGrid > 1) {

            paginaAtualGrid--;

            renderizarLista();

        }

    };

    document.getElementById("proximaPagina")
        ?.onclick = () => {

        if (paginaAtualGrid < totalPaginas) {

            paginaAtualGrid++;

            renderizarLista();

        }

    };

}

/* ==========================================================
   EVENTOS DOS CARDS
========================================================== */

function registrarEventosCards() {

    document
        .querySelectorAll(".btn-ver")
        .forEach(botao => {

            botao.onclick = () => {

                abrirDetalhes(
                    botao.dataset.id
                );

            };

        });

    document
        .querySelectorAll(".btn-editar")
        .forEach(botao => {

            botao.onclick = () => {

                abrirEdicao(
                    botao.dataset.id
                );

            };

        });

    document
        .querySelectorAll(".btn-excluir")
        .forEach(botao => {

            botao.onclick = () => {

                abrirExcluir(
                    botao.dataset.id
                );

            };

        });

}

/* ==========================================================
   MODAL DETALHES
========================================================== */

function abrirDetalhes(id) {

    calcadoSelecionado =
        calcados.find(c => c.id == id);

    if (!calcadoSelecionado) return;

    const corpo =
        document.getElementById(
            "conteudoDetalhes"
        );

    corpo.innerHTML = `

<div class="detalhes-grid">

<div>

<strong>Marca</strong>

<p>${calcadoSelecionado.marca || "-"}</p>

</div>

<div>

<strong>Modelo</strong>

<p>${calcadoSelecionado.modelo || "-"}</p>

</div>

<div>

<strong>Número</strong>

<p>${calcadoSelecionado.numero || "-"}</p>

</div>

<div>

<strong>Pé</strong>

<p>${calcadoSelecionado.pe || "-"}</p>

</div>

<div>

<strong>Cidade</strong>

<p>${calcadoSelecionado.cidade || "-"}</p>

</div>

<div>

<strong>Estado</strong>

<p>${calcadoSelecionado.estado || "-"}</p>

</div>

<div>

<strong>Status</strong>

<p>${formatarStatus(calcadoSelecionado.status)}</p>

</div>

<div>

<strong>Cadastrado em</strong>

<p>${formatarData(calcadoSelecionado.created_at)}</p>

</div>

</div>

<div class="mt-20">

<strong>Observações</strong>

<p>

${calcadoSelecionado.observacoes || "-"}

</p>

</div>

`;

    document
        .getElementById("modalDetalhes")
        .classList.remove("oculto");

}

/* ==========================================================
   MODAL EDIÇÃO
========================================================== */

function abrirEdicao(id) {

    calcadoSelecionado =
        calcados.find(c => c.id == id);

    if (!calcadoSelecionado) return;

    editarMarca.value =
        calcadoSelecionado.marca || "";

    editarModelo.value =
        calcadoSelecionado.modelo || "";

    editarNumero.value =
        calcadoSelecionado.numero || "";

    editarCidade.value =
        calcadoSelecionado.cidade || "";

    editarEstado.value =
        calcadoSelecionado.estado || "";

    editarPe.value =
        calcadoSelecionado.pe || "";

    editarObservacoes.value =
        calcadoSelecionado.observacoes || "";

    document
        .getElementById("modalEdicao")
        .classList.remove("oculto");

}

/* ==========================================================
   EXCLUSÃO
========================================================== */

function abrirExcluir(id) {

    calcadoSelecionado =
        calcados.find(c => c.id == id);

    document
        .getElementById("modalExcluir")
        .classList.remove("oculto");

}

document
.getElementById("confirmarExclusao")
?.addEventListener("click", excluirCalcado);

async function excluirCalcado() {

    try {

        mostrarLoader();

        const { error } = await supabase

            .from("calcados")

            .delete()

            .eq("id", calcadoSelecionado.id);

        if (error) throw error;

        toastSucesso(
            "Cadastro excluído."
        );

        document
            .getElementById("modalExcluir")
            .classList.add("oculto");

        await carregarCalcados();

        atualizarDashboard();

        aplicarFiltros();

    }

    catch (erro) {

        console.error(erro);

        toastErro(
            "Erro ao excluir."
        );

    }

    finally {

        esconderLoader();

    }

}

/* ==========================================================
   SALVAR EDIÇÃO
========================================================== */

document
.getElementById("formEditarCalcado")
?.addEventListener("submit", salvarEdicao);

async function salvarEdicao(e){

    e.preventDefault();

    try{

        mostrarLoader();

        const dados={

            marca:editarMarca.value,

            modelo:editarModelo.value,

            numero:editarNumero.value,

            cidade:editarCidade.value,

            estado:editarEstado.value,

            pe:editarPe.value,

            observacoes:editarObservacoes.value

        };

        const {error}=await supabase

        .from("calcados")

        .update(dados)

        .eq("id",calcadoSelecionado.id);

        if(error) throw error;

        toastSucesso(
            "Cadastro atualizado."
        );

        document
        .getElementById("modalEdicao")
        .classList.add("oculto");

        await carregarCalcados();

        atualizarDashboard();

        aplicarFiltros();

    }

    catch(erro){

        console.error(erro);

        toastErro(
            "Erro ao atualizar cadastro."
        );

    }

    finally{

        esconderLoader();

    }

}/* ==========================================================
   FECHAR MODAIS
========================================================== */

document
.getElementById("fecharModalDetalhes")
?.addEventListener("click", fecharModais);

document
.getElementById("btnFecharDetalhes")
?.addEventListener("click", fecharModais);

document
.getElementById("fecharModalEdicao")
?.addEventListener("click", fecharModais);

document
.getElementById("cancelarEdicao")
?.addEventListener("click", fecharModais);

document
.getElementById("cancelarExclusao")
?.addEventListener("click", fecharModais);

document
.getElementById("fecharImagem")
?.addEventListener("click", fecharImagem);

function fecharModais(){

    document
    .querySelectorAll(".modal-custom")
    .forEach(modal=>{

        modal.classList.add("oculto");

    });

}

/* ==========================================================
   IMAGEM AMPLIADA
========================================================== */

document.addEventListener("click",(e)=>{

    const imagem=e.target.closest(".calcado-imagem img");

    if(!imagem) return;

    abrirImagem(imagem.src);

});

function abrirImagem(src){

    const modal=
    document.getElementById("modalImagem");

    const foto=
    document.getElementById("imagemExpandida");

    if(!modal || !foto) return;

    foto.src=src;

    modal.classList.remove("oculto");

}

function fecharImagem(){

    document
    .getElementById("modalImagem")
    ?.classList.add("oculto");

}

/* ==========================================================
   FECHAR COM ESC
========================================================== */

document.addEventListener("keydown",(e)=>{

    if(e.key==="Escape"){

        fecharModais();

    }

});

/* ==========================================================
   FECHAR CLICANDO NO FUNDO
========================================================== */

document
.querySelectorAll(".modal-custom")
.forEach(modal=>{

    modal.addEventListener("click",(e)=>{

        if(e.target===modal){

            fecharModais();

        }

    });

});

/* ==========================================================
   FORMATAÇÕES
========================================================== */

function formatarStatus(status){

    switch(status){

        case "disponivel":
            return "Disponível";

        case "reservado":
            return "Reservado";

        case "entregue":
            return "Entregue";

        case "indisponivel":
            return "Indisponível";

        default:
            return "-";

    }

}

function formatarData(data){

    if(!data) return "-";

    return new Date(data)

    .toLocaleDateString(

        "pt-BR",

        {

            day:"2-digit",

            month:"2-digit",

            year:"numeric"

        }

    );

}

/* ==========================================================
   ATUALIZAÇÃO RÁPIDA
========================================================== */

async function atualizarPainel(){

    mostrarLoader();

    try{

        await carregarCalcados();

        atualizarDashboard();

        aplicarFiltros();

    }

    finally{

        esconderLoader();

    }

}

/* ==========================================================
   RECARREGAR APÓS ALTERAÇÃO
========================================================== */

window.addEventListener("focus",()=>{

    atualizarPainel();

});

/* ==========================================================
   OBSERVAÇÃO IMPORTANTE
========================================================== */

/*
Toda a renderização do painel
passa por aplicarFiltros().

Sempre que houver qualquer alteração
nos dados basta executar:

await carregarCalcados();
atualizarDashboard();
aplicarFiltros();

para que toda a interface seja
reconstruída automaticamente.
*/

/* ==========================================================
   FIM DO ARQUIVO
========================================================== */