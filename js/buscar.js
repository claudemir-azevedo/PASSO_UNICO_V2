/* ==========================================
   BUSCAR.JS
   PASSO ÚNICO
   ========================================== */

const client = window.supabaseClient;

let calcados = [];
let calcadosFiltrados = [];

/* ==========================================
   SEGURANÇA
   (evita injeção de código por textos
   digitados pelos usuários)
========================================== */

function escaparTexto(valor) {

    return String(valor ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

}

function escaparUrlImagem(valor) {

    const url = String(valor ?? "").trim();

    return /^https?:\/\//i.test(url) ? escaparTexto(url) : "";

}

/* ==========================================
   ELEMENTOS
========================================== */

const listaCalcados =
    document.getElementById("lista-calcados");

const contadorResultados =
    document.getElementById("contadorResultados");

const formBusca =
    document.getElementById("formBusca");

const campoCategoria =
    document.getElementById("categoria");

const campoCidade =
    document.getElementById("cidade");

const campoNumero =
    document.getElementById("numero");

const grupoNumero =
    document.getElementById("grupoNumero");

const campoTipo =
    document.getElementById("tipo");


/* ==========================================
   CATEGORIAS E TIPOS
   (a lista vem de CATEGORIAS, em modal.js)
========================================== */

function montarSelectCategoria() {

    if (!campoCategoria) return;

    campoCategoria.innerHTML =
        `<option value="">Todas</option>` +
        Object.entries(CATEGORIAS)
            .map(([chave, cfg]) =>
                `<option value="${escaparTexto(chave)}">${escaparTexto(cfg.rotuloPlural)}</option>`
            )
            .join("");

}

/* refaz a lista de tipos conforme a categoria
   e esconde o "Número", que só vale para calçados */

function montarSelectTipo() {

    const categoria = campoCategoria?.value || "";

    if (campoTipo) {

        const chaves = categoria
            ? [categoria]
            : Object.keys(CATEGORIAS);

        const tipos = chaves.flatMap(chave => CATEGORIAS[chave].tipos);

        campoTipo.innerHTML =
            `<option value="">Todos</option>` +
            tipos
                .map(tipo =>
                    `<option value="${escaparTexto(tipo)}">${escaparTexto(tipo)}</option>`
                )
                .join("");

    }

    if (grupoNumero) {

        const mostrarNumero =
            !categoria || CATEGORIAS[categoria].usaNumero;

        grupoNumero.style.display = mostrarNumero ? "" : "none";

        if (!mostrarNumero && campoNumero) {
            campoNumero.value = "";
        }

    }

}


/* ==========================================
   INICIALIZAÇÃO
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    montarSelectCategoria();

    /* link vindo do carrossel/outras páginas: buscar.html?categoria=muleta */
    const catUrl = new URLSearchParams(window.location.search).get("categoria");
    if (campoCategoria && catUrl && Object.prototype.hasOwnProperty.call(CATEGORIAS, catUrl)) {
        campoCategoria.value = catUrl;
    }

    montarSelectTipo();

    carregarCalcados();

    if (formBusca) {

        formBusca.addEventListener(
            "submit",
            (event) => {

                event.preventDefault();

                aplicarFiltros();

            }
        );

    }

});


/* ==========================================
   CARREGAR ITENS
========================================== */

async function carregarCalcados() {

    try {

        if (!client) {
            throw new Error("Supabase não inicializado.");
        }

        listaCalcados.innerHTML = `
            <div class="loading">
                Carregando itens...
            </div>
        `;

        const {
            data,
            error
        } = await client
            .from("calcados")
            .select("*")
            .eq("status", "disponivel")
            .order("created_at", {
                ascending: false
            });

        if (error) throw error;

        calcados = data || [];
        calcadosFiltrados = [...calcados];

        atualizarContador();

        renderizarCalcados(calcadosFiltrados);

    } catch (erro) {

        console.error(
            "Erro ao carregar itens:",
            erro
        );

        listaCalcados.innerHTML = `
            <div class="sem-resultados">
                Não foi possível carregar os itens.
            </div>
        `;

        contadorResultados.textContent =
            "0 resultados encontrados";

    }

}


/* ==========================================
   FILTROS
========================================== */

function aplicarFiltros() {

    const categoria =
        campoCategoria?.value || "";

    const cidade =
        campoCidade.value
            .trim()
            .toLowerCase();

    const numero =
        campoNumero.value
            .trim();

    const tipo =
        campoTipo.value
            .trim()
            .toLowerCase();

    calcadosFiltrados = calcados.filter(item => {

        const categoriaOk =
            !categoria ||
            categoriaDe(item) === categoria;

        const cidadeOk =
            !cidade ||
            (item.cidade || "")
                .toLowerCase()
                .includes(cidade);

        const numeroOk =
            !numero ||
            String(item.numero) === numero;

        const tipoOk =
            !tipo ||
            (item.tipo || "")
                .toLowerCase() === tipo;

        return (
            categoriaOk &&
            cidadeOk &&
            numeroOk &&
            tipoOk
        );

    });

    atualizarContador();

    renderizarCalcados(
        calcadosFiltrados
    );

}


/* ==========================================
   CONTADOR
========================================== */

function atualizarContador() {

    const total =
        calcadosFiltrados.length;

    contadorResultados.textContent =
        total === 1
            ? "1 item encontrado"
            : `${total} itens encontrados`;

}

/* ==========================================
   RENDERIZAÇÃO
========================================== */

function renderizarCalcados(lista) {

    if (!lista || lista.length === 0) {

        listaCalcados.innerHTML = `
            <div class="sem-resultados">
                <h3>Nenhum item encontrado</h3>
                <p>Tente alterar os filtros da pesquisa.</p>
            </div>
        `;

        return;

    }

    listaCalcados.innerHTML = "";

    lista.forEach(item => {

        const cfg = configCategoria(item);

        const card = document.createElement("article");
        card.className = "calcado-card";

        const fotoUrl = escaparUrlImagem(item.foto_url);

        const imagem = fotoUrl
            ? `
                <img
                    src="${fotoUrl}"
                    alt="${escaparTexto(item.tipo)}"
                    loading="lazy"
                >
            `
            : `
                <div class="calcado-sem-imagem">
                    Sem imagem
                </div>
            `;

        const objetivo = escaparTexto(item.objetivo || "Não informado");
        const condicao = escaparTexto(item.condicao || "Não informado");
        const pe = escaparTexto(item.pe || "Não informado");

        /* só calçados têm número */

        const numero = cfg.usaNumero
            ? `
                    <span class="numero">
                        Nº ${escaparTexto(item.numero)}
                    </span>
              `
            : "";

        /* "Pé" (calçado) ou "Quantidade" (muleta); cadeira não usa */

        const badgePe = cfg.pe
            ? `
                    <span class="badge">
                        ${pe}
                    </span>
              `
            : "";

        /* corta a descrição ANTES de escapar, para não partir um código como &amp; */

        const descricaoBruta = item.descricao || "";

        const descricao = descricaoBruta
            ? escaparTexto(
                descricaoBruta.length > 120
                    ? descricaoBruta.substring(0, 120) + "..."
                    : descricaoBruta
            )
            : "Nenhuma descrição cadastrada.";

        const medidas = item.medidas
            ? `
                <p class="card-descricao">
                    <strong>Medidas:</strong> ${escaparTexto(item.medidas)}
                </p>
              `
            : "";

        card.innerHTML = `

            <div class="card-imagem">
                ${imagem}
            </div>

            <div class="card-conteudo">

                <div class="card-topo">

                    <h3>
                        ${escaparTexto(item.tipo)}
                    </h3>

                    ${numero}

                </div>

                <div class="card-badges">

                    ${badgePe}

                    <span class="badge">
                        ${condicao}
                    </span>

                    <span class="badge">
                        ${objetivo}
                    </span>

                </div>

                <div class="card-local">

                    <strong>
                        ${escaparTexto(item.cidade || "-")}
                    </strong>

                    <span>
                        ${escaparTexto(item.estado || "-")}
                    </span>

                </div>

                ${medidas}

                <p class="card-descricao">

                    ${descricao}

                </p>

                <div class="card-rodape">

                    <button
                        class="btn-primary"
                        type="button">

                        Ver detalhes

                    </button>

                </div>

            </div>

        `;

        card
            .querySelector(".btn-primary")
            .addEventListener("click", () => {

                abrirDetalhesPublico(item);

            });

        listaCalcados.appendChild(card);

    });

}

/* ==========================================
   FILTROS EM TEMPO REAL
========================================== */

if (campoCategoria) {
    campoCategoria.addEventListener("change", () => {

        montarSelectTipo();

        aplicarFiltros();

    });
}

if (campoCidade) {
    campoCidade.addEventListener("input", aplicarFiltros);
}

if (campoNumero) {
    campoNumero.addEventListener("input", aplicarFiltros);
}

if (campoTipo) {
    campoTipo.addEventListener("change", aplicarFiltros);
}


/* ==========================================
   ATALHOS
========================================== */

function limparFiltros() {

    if (campoCategoria) campoCategoria.value = "";
    if (campoCidade) campoCidade.value = "";
    if (campoNumero) campoNumero.value = "";

    montarSelectTipo();

    calcadosFiltrados = [...calcados];

    atualizarContador();

    renderizarCalcados(calcadosFiltrados);

}


/* ==========================================
   RECARREGAR
========================================== */

async function atualizarLista() {

    await carregarCalcados();

}


/* ==========================================
   EXPORTAÇÃO GLOBAL
========================================== */

window.aplicarFiltros = aplicarFiltros;
window.limparFiltros = limparFiltros;
window.atualizarLista = atualizarLista;
window.carregarCalcados = carregarCalcados;


/* ==========================================
   FIM DO ARQUIVO
========================================== */
