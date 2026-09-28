/* ==========================================
   BUSCAR.JS
   PASSO ÚNICO
   ========================================== */

const client = window.supabaseClient;

let calcados = [];
let calcadosFiltrados = [];

/* ==========================================
   ELEMENTOS
========================================== */

const listaCalcados =
    document.getElementById("lista-calcados");

const contadorResultados =
    document.getElementById("contadorResultados");

const formBusca =
    document.getElementById("formBusca");

const campoCidade =
    document.getElementById("cidade");

const campoNumero =
    document.getElementById("numero");

const campoTipo =
    document.getElementById("tipo");


/* ==========================================
   INICIALIZAÇÃO
========================================== */

document.addEventListener("DOMContentLoaded", () => {

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
   CARREGAR CALÇADOS
========================================== */

async function carregarCalcados() {

    try {

        if (!client) {
            throw new Error("Supabase não inicializado.");
        }

        listaCalcados.innerHTML = `
            <div class="loading">
                Carregando calçados...
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
            "Erro ao carregar calçados:",
            erro
        );

        listaCalcados.innerHTML = `
            <div class="sem-resultados">
                Não foi possível carregar os calçados.
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
        `${total} calçado${total !== 1 ? "s" : ""} encontrado${total !== 1 ? "s" : ""}`;

}

/* ==========================================
   RENDERIZAÇÃO
========================================== */

function renderizarCalcados(lista) {

    if (!lista || lista.length === 0) {

        listaCalcados.innerHTML = `
            <div class="sem-resultados">
                <h3>Nenhum calçado encontrado</h3>
                <p>Tente alterar os filtros da pesquisa.</p>
            </div>
        `;

        return;

    }

    listaCalcados.innerHTML = "";

    lista.forEach(item => {

        const card = document.createElement("article");
        card.className = "calcado-card";

        const imagem = item.foto_url
            ? `
                <img
                    src="${item.foto_url}"
                    alt="${item.tipo}"
                    loading="lazy"
                >
            `
            : `
                <div class="calcado-sem-imagem">
                    Sem imagem
                </div>
            `;

        const objetivo = item.objetivo || "Não informado";
        const condicao = item.condicao || "Não informado";
        const pe = item.pe || "Não informado";

        card.innerHTML = `

            <div class="card-imagem">
                ${imagem}
            </div>

            <div class="card-conteudo">

                <div class="card-topo">

                    <h3>
                        ${item.tipo}
                    </h3>

                    <span class="numero">
                        Nº ${item.numero}
                    </span>

                </div>

                <div class="card-badges">

                    <span class="badge">
                        ${pe}
                    </span>

                    <span class="badge">
                        ${condicao}
                    </span>

                    <span class="badge">
                        ${objetivo}
                    </span>

                </div>

                <div class="card-local">

                    <strong>
                        ${item.cidade || "-"}
                    </strong>

                    <span>
                        ${item.estado || "-"}
                    </span>

                </div>

                <p class="card-descricao">

                    ${
                        item.descricao
                            ? item.descricao.length > 120
                                ? item.descricao.substring(0,120) + "..."
                                : item.descricao
                            : "Nenhuma descrição cadastrada."
                    }

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

    if (campoCidade) campoCidade.value = "";
    if (campoNumero) campoNumero.value = "";
    if (campoTipo) campoTipo.value = "";

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