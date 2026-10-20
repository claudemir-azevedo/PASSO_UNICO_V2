/* ========================================
MODAL PASSO ÚNICO
VERSÃO PREMIUM
======================================== */


/* ========================================
FUNÇÕES DE SEGURANÇA
(evitam injeção de código por textos
digitados pelos usuários)
======================================== */

/* escapa texto para uso dentro de HTML */

function escaparHTML(valor){

    return String(valor ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

}

/* deixa passar só caracteres de um id (uuid) */

function idSeguro(valor){

    return String(valor ?? "").replace(/[^a-zA-Z0-9_-]/g, "");

}

/* aceita apenas endereços http(s) para imagens */

function urlSegura(valor){

    const url = String(valor ?? "").trim();

    return /^https?:\/\//i.test(url) ? escaparHTML(url) : "";

}

/* monta o link do WhatsApp:
   tira tudo que não é número e coloca 55 só quando faltar */

function montarLinkWhatsapp(telefone, mensagem){

    let numero = String(telefone ?? "").replace(/\D/g, "");

    numero = numero.replace(/^0+/, "");

    if(!numero){
        return "";
    }

    if(!(numero.startsWith("55") && numero.length >= 12)){
        numero = "55" + numero;
    }

    const texto = mensagem
        ? `?text=${encodeURIComponent(mensagem)}`
        : "";

    return `https://wa.me/${numero}${texto}`;

}


/* ========================================
CATEGORIAS DE ITENS
(calçados, muletas, cadeiras de rodas)

Para incluir uma categoria nova:
1) acrescente o bloco abaixo
2) libere o valor no banco (restrição
   calcados_categoria_check na tabela calcados)

  usaNumero  -> mostra o campo "Número" (só calçados)
  pe         -> campo extra por categoria
                (null = a categoria não usa)
  medidas    -> campo livre de medidas
                (null = a categoria não usa)
======================================== */

const CATEGORIAS = {

    calcado: {
        rotulo: "Calçado",
        rotuloPlural: "Calçados",
        tipos: ["Tênis", "Sapato", "Chinelo", "Sandália", "Bota"],
        usaNumero: true,
        pe: {
            rotulo: "Pé do calçado",
            rotuloCurto: "Pé",
            opcoes: ["Direito", "Esquerdo", "Par completo"]
        },
        medidas: null
    },

    muleta: {
        rotulo: "Muleta",
        rotuloPlural: "Muletas",
        tipos: ["Muleta axilar", "Muleta canadense"],
        usaNumero: false,
        pe: {
            rotulo: "Quantidade",
            rotuloCurto: "Quantidade",
            opcoes: ["Par completo", "Unidade"]
        },
        medidas: {
            rotulo: "Altura / tamanho",
            placeholder: "Ex: ajustável de 1,50 m a 1,80 m"
        }
    },

    cadeira_de_rodas: {
        rotulo: "Cadeira de rodas",
        rotuloPlural: "Cadeiras de rodas",
        tipos: [
            "Cadeira de rodas manual",
            "Cadeira de rodas motorizada",
            "Cadeira de banho"
        ],
        usaNumero: false,
        pe: null,
        medidas: {
            rotulo: "Medidas",
            placeholder: "Ex: assento de 40 cm, suporta até 100 kg"
        }
    }

};

/* itens antigos, sem categoria, contam como calçado */

function categoriaDe(item){

    return CATEGORIAS[item?.categoria] ? item.categoria : "calcado";

}

function configCategoria(item){

    return CATEGORIAS[categoriaDe(item)];

}

/* ex.: "Tênis Nº 38" ou "Muleta axilar" */

function tituloDoItem(item){

    const cfg = configCategoria(item);

    const tipo = item?.tipo || cfg.rotulo;

    return cfg.usaNumero && item?.numero
        ? `${tipo} Nº ${item.numero}`
        : tipo;

}

function mensagemWhatsapp(item){

    const local = [item?.cidade, item?.estado]
        .filter(Boolean)
        .join(" / ");

    return `Olá! Vi este item no PASSO ÚNICO:

${tituloDoItem(item)}${local ? "\n" + local : ""}

Ele ainda está disponível?`;

}

/* <option> de um select; mantém o valor atual
   mesmo que ele não esteja mais na lista */

function opcoesSelect(opcoes, atual){

    const lista = [...opcoes];

    if(atual && !lista.includes(atual)){
        lista.unshift(atual);
    }

    return lista
        .map(o =>
            `<option value="${escaparHTML(o)}" ${o === atual ? "selected" : ""}>${escaparHTML(o)}</option>`
        )
        .join("");

}


/* ========================================
ABRIR MODAL
======================================== */

function abrirModal(conteudoHTML){

    fecharModal();

    const overlay =
    document.createElement("div");

    overlay.className =
    "modal-overlay";

    overlay.innerHTML = `

    <div class="modal">

    ${conteudoHTML}

    </div>

    `;

    /* FECHAR FORA */

    overlay.addEventListener(
    "click",
    (event)=>{

        if(event.target === overlay){

            fecharModal();

        }

    });

    /* APPEND */

    document.body.appendChild(
    overlay
    );

    /* BLOQUEIA SCROLL */

    document.body.style.overflow =
    "hidden";

}

/* ========================================
FECHAR MODAL
======================================== */

function fecharModal(){

const modalExistente =
document.querySelector(
".modal-overlay"
);

if(modalExistente){

modalExistente.remove();

}

document.body.style.overflow =
"";

}


/* ========================================
ESC FECHA
======================================== */

document.addEventListener(
"keydown",
(event)=>{

if(event.key === "Escape"){

fecharModal();

}

}
);


/* ========================================
PEDAÇOS DE HTML DOS DETALHES
======================================== */

function htmlImagemItem(item){

    const fotoUrl = urlSegura(item.foto_url);

    return fotoUrl
        ? `<img src="${fotoUrl}" alt="${escaparHTML(item.tipo)}">`
        : `<div class="modal-sem-imagem">Imagem não disponível</div>`;

}

function htmlBadgesItem(item){

    const cfg = configCategoria(item);

    return `

<div class="modal-badges">

${
cfg.pe
? `<div class="modal-badge pe">${escaparHTML(item.pe || "Não informado")}</div>`
: ""
}

<div class="modal-badge condicao">${escaparHTML(item.condicao || "Não informado")}</div>

<div class="modal-badge objetivo">${escaparHTML(item.objetivo || "Não informado")}</div>

</div>

`;

}

function htmlInfoItem(rotulo, valor){

    return `

<div class="modal-item">

<span>${escaparHTML(rotulo)}</span>

<p>${escaparHTML(valor)}</p>

</div>

`;

}


/* ========================================
DETALHES (colaborador e administrador)
======================================== */

function abrirDetalhesCalcado(item){

window.itemEdicao = item;

const telefone =
item.usuarios?.telefone || "";

const whatsappLink =
montarLinkWhatsapp(telefone, mensagemWhatsapp(item)) || "#";


abrirModal(`

<button
class="modal-fechar"
onclick="fecharModal()">

×

</button>

<div class="modal-grid">


<!-- IMAGEM -->

<div class="modal-imagem">

${htmlImagemItem(item)}

</div>


<!-- CONTEÚDO -->

<div class="modal-conteudo">

<h1 class="modal-titulo">

${escaparHTML(tituloDoItem(item))}

</h1>

<div class="modal-status">

${escaparHTML(item.status || "disponivel")}

</div>


<!-- BADGES -->

${htmlBadgesItem(item)}


<!-- INFO -->

<div class="modal-info">

${htmlInfoItem("Categoria", configCategoria(item).rotulo)}

${htmlInfoItem("Cidade", item.cidade || "-")}

${htmlInfoItem("Estado", item.estado || "-")}

${item.medidas ? htmlInfoItem("Medidas", item.medidas) : ""}

${htmlInfoItem("Colaborador", item.usuarios?.nome || "Usuário")}

${htmlInfoItem("E-mail", item.usuarios?.email || "-")}

${htmlInfoItem("Telefone", item.usuarios?.telefone || "-")}

</div>


<!-- DESCRIÇÃO -->

<div class="modal-descricao">

<h3>

Sobre o item

</h3>

<p>

${escaparHTML(item.descricao || "Nenhuma descrição informada.")}

</p>

</div>


<!-- BOTÕES -->

<div class="modal-acoes">

<a
href="${escaparHTML(whatsappLink)}"
target="_blank" rel="noopener noreferrer"
class="modal-whatsapp">

Entrar em contato

</a>

<button
class="btn-confirmar"
onclick="abrirEdicaoCalcado(window.itemEdicao)">

Editar informações

</button>

</div>

</div>

</div>

`);

}


/* ========================================
DETALHES (visitantes)
======================================== */

function abrirDetalhesPublico(item){

abrirModal(`

<button
class="modal-fechar"
onclick="fecharModal()">

×

</button>

<div class="modal-grid">

<div class="modal-imagem">

${htmlImagemItem(item)}

</div>

<div class="modal-conteudo">

<h1 class="modal-titulo">

${escaparHTML(tituloDoItem(item))}

</h1>

${htmlBadgesItem(item)}

<div class="modal-info">

${htmlInfoItem("Categoria", configCategoria(item).rotulo)}

${htmlInfoItem("Cidade", item.cidade || "-")}

${htmlInfoItem("Estado", item.estado || "-")}

${item.medidas ? htmlInfoItem("Medidas", item.medidas) : ""}

${htmlInfoItem("Colaborador", item.usuarios?.nome || "Usuário")}

</div>

<div class="modal-descricao">

<h3>Sobre o item</h3>

<p>

${escaparHTML(item.descricao || "Nenhuma descrição informada.")}

</p>

</div>

<div class="modal-acoes">

<button
type="button"
class="modal-whatsapp"
onclick="entrarEmContato('${idSeguro(item.id)}')">
Entrar em contato
</button>

</div>

</div>

</div>

`);

}


/* ========================================
CONTATO VIA WHATSAPP (somente logado)
======================================== */

async function entrarEmContato(calcadoId){

    const item = (typeof calcados !== "undefined" && calcados.find(c => c.id === calcadoId)) || { id: calcadoId };

    const client = window.supabaseClient;

    // abre a aba já no clique para o navegador não bloquear o popup
    const aba = window.open("", "_blank");

    const avisar = (msg, tipo) => {
        if (typeof mostrarToast === "function") {
            mostrarToast(msg, tipo);
        } else {
            alert(msg);
        }
    };

    try {

        const { data: sessao } = await client.auth.getSession();

        if (!sessao.session) {

            if (aba) aba.close();

            avisar("Entre na sua conta para falar com quem está doando.", "erro");

            setTimeout(() => {
                window.location.href = "login.html";
            }, 1500);

            return;

        }

        const { data, error } = await client.rpc("contato_calcado", {
            p_calcado_id: item.id
        });

        if (error) throw error;

        const contato = Array.isArray(data) ? data[0] : data;

        if (!contato || !contato.telefone) {

            if (aba) aba.close();

            avisar("Este colaborador ainda não cadastrou um telefone de contato.", "erro");

            return;

        }

        const link = montarLinkWhatsapp(contato.telefone, mensagemWhatsapp(item));

        if (!link) {

            if (aba) aba.close();

            avisar("Este colaborador ainda não cadastrou um telefone de contato.", "erro");

            return;

        }

        if (aba) {
            aba.location.href = link;
        } else {
            window.location.href = link;
        }

    } catch (erro) {

        console.error(erro);

        if (aba) aba.close();

        avisar("Não foi possível abrir o contato. Tente novamente.", "erro");

    }

}

/* ========================================
ABRIR EDIÇÃO
(os campos mudam conforme a categoria)
======================================== */

function abrirEdicaoCalcado(item){

const cfg = configCategoria(item);

const statusLista = [
    ["disponivel", "Disponível"],
    ["entregue", "Entregue"]
];

/* mantém um status diferente (ex.: reservado) sem sobrescrevê-lo */

if(item.status && !statusLista.some(s => s[0] === item.status)){
    statusLista.push([item.status, item.status]);
}

const opcoesStatus = statusLista
    .map(([valor, rotulo]) =>
        `<option value="${escaparHTML(valor)}" ${item.status === valor ? "selected" : ""}>${escaparHTML(rotulo)}</option>`
    )
    .join("");

abrirModal(`

<button
class="modal-fechar"
onclick="fecharModal()">

×

</button>

<div class="modal-conteudo">

<h2 class="modal-titulo">

Editar ${escaparHTML(cfg.rotulo.toLowerCase())}

</h2>

<div class="modal-item">

<span>Tipo</span>

<select id="editTipo">

${opcoesSelect(cfg.tipos, item.tipo)}

</select>

</div>

${
cfg.usaNumero
? `
<div class="modal-item">

<span>Número</span>

<input
id="editNumero"
type="number"
value="${escaparHTML(item.numero)}">

</div>
`
: ""
}

${
cfg.pe
? `
<div class="modal-item">

<span>${escaparHTML(cfg.pe.rotuloCurto)}</span>

<select id="editPe">

${opcoesSelect(cfg.pe.opcoes, item.pe)}

</select>

</div>
`
: ""
}

${
cfg.medidas
? `
<div class="modal-item">

<span>${escaparHTML(cfg.medidas.rotulo)}</span>

<input
id="editMedidas"
type="text"
maxlength="200"
placeholder="${escaparHTML(cfg.medidas.placeholder)}"
value="${escaparHTML(item.medidas)}">

</div>
`
: ""
}

<div class="modal-item">

<span>Cidade</span>

<input
id="editCidade"
type="text"
value="${escaparHTML(item.cidade)}">

</div>

<div class="modal-item">

<span>Estado</span>

<input
id="editEstado"
type="text"
value="${escaparHTML(item.estado)}">

</div>

<div class="modal-item">

<span>Preço</span>

<input
id="editPreco"
type="number"
value="${escaparHTML(item.preco)}">

</div>


<!-- FORM -->

<div class="modal-info">


<div class="modal-item">

<span>

Status

</span>

<select id="editStatus">

${opcoesStatus}

</select>

</div>


<div class="modal-item">

<span>

Condição

</span>

<select id="editCondicao">

${opcoesSelect(["Novo", "Seminovo", "Usado", "Precisa reparo"], item.condicao)}

</select>

</div>


<div class="modal-item">

<span>

Objetivo

</span>

<select id="editObjetivo">

${opcoesSelect(["Doação", "Troca", "Venda solidária"], item.objetivo)}

</select>

</div>


<div class="modal-item">

<span>

Descrição

</span>

<textarea
id="editDescricao"
style="
min-height:140px;
padding:18px;
border-radius:18px;
border:1px solid #dbe3ec;
font-size:15px;
font-family:Inter,sans-serif;
resize:none;
">${escaparHTML(item.descricao || "")}</textarea>

</div>

</div>


<!-- BOTÕES -->

<div class="modal-acoes">

<button
class="btn-cancelar"
onclick="fecharModal()">

Cancelar

</button>

<button
class="btn-confirmar"
onclick="salvarEdicaoCalcado('${idSeguro(item.id)}')">

Salvar alterações

</button>

</div>

</div>

`);

}


/* ========================================
SALVAR EDIÇÃO
======================================== */

async function salvarEdicaoCalcado(id){

    try{

        const client = window.supabaseClient;

        const existe = (campo) =>
            document.getElementById(campo) !== null;

        const valor = (campo) =>
            (document.getElementById(campo)?.value || "").trim();

        /* campos numéricos: vazio vira null (o banco não aceita texto vazio) */

        const precoTexto = valor("editPreco").replace(",", ".");

        const preco = precoTexto === "" ? null : Number(precoTexto);

        if (preco !== null && Number.isNaN(preco)) {
            mostrarToast("Preço inválido. Use apenas números (ex: 50 ou 49,90).", "erro");
            return;
        }

        const dados = {
            tipo: valor("editTipo"),
            cidade: valor("editCidade"),
            estado: valor("editEstado"),
            preco,
            status: valor("editStatus"),
            condicao: valor("editCondicao"),
            objetivo: valor("editObjetivo"),
            descricao: valor("editDescricao")
        };

        /* só envia o que existe no formulário da categoria,
           para não apagar campos de outra categoria */

        if (existe("editNumero")) {

            const numeroTexto = valor("editNumero");

            const numero = numeroTexto === "" ? null : Number(numeroTexto);

            if (numero !== null && Number.isNaN(numero)) {
                mostrarToast("Número inválido.", "erro");
                return;
            }

            dados.numero = numero;

        }

        if (existe("editPe")) {
            dados.pe = valor("editPe");
        }

        if (existe("editMedidas")) {
            dados.medidas = valor("editMedidas") || null;
        }

        const { data, error } = await client
            .from("calcados")
            .update(dados)
            .eq("id", id)
            .select();

        if (error) {
            console.error("Erro ao salvar item:", error);
            mostrarToast("Não foi possível salvar as alterações.", "erro");
            return;
        }

        /* nenhuma linha alterada = sem permissão para editar este item */

        if (!data || data.length === 0) {
            mostrarToast("Você não tem permissão para editar este item.", "erro");
            return;
        }

        mostrarToast("Item atualizado com sucesso.", "sucesso");

        fecharModal();

        setTimeout(() => {
            window.location.reload();
        }, 600);

    }catch(erro){

        console.error(erro);

        mostrarToast("Erro inesperado.", "erro");

    }

}


/* ========================================
CONFIRMAR REMOÇÃO
======================================== */

function confirmarRemocaoCalcado(id){

abrirModal(`

<div class="modal-conteudo">

<h2 class="modal-titulo">

Remover item?

</h2>

<div class="modal-descricao">

<p>

Esta ação removerá o item
da plataforma PASSO ÚNICO.

Você poderá cadastrar novamente
caso necessário.

</p>

</div>

<div class="modal-acoes">

<button
class="btn-cancelar"
onclick="fecharModal()">

Cancelar

</button>

<button
class="btn-confirmar"
onclick="removerCalcado('${idSeguro(id)}')">

Remover

</button>

</div>

</div>

`);

}


/* ========================================
REMOVER
======================================== */

async function removerCalcado(id){

try{

const client =
window.supabaseClient;

const {
error
} =
await client
.from("calcados")
.delete()
.eq(
"id",
id
);


if(error){

console.error(error);

mostrarToast(
"Erro ao remover item.",
"erro"
);

return;

}


mostrarToast(
"Item removido com sucesso.",
"sucesso"
);


fecharModal();


/* RELOAD */

setTimeout(()=>{

window.location.reload();

},500);


}catch(error){

console.error(error);

mostrarToast(
"Erro inesperado.",
"erro"
);

}
}

window.abrirModal = abrirModal;
window.fecharModal = fecharModal;
window.abrirDetalhesCalcado = abrirDetalhesCalcado;
window.abrirEdicaoCalcado = abrirEdicaoCalcado;
window.abrirDetalhesPublico = abrirDetalhesPublico;
window.salvarEdicaoCalcado = salvarEdicaoCalcado;


window.confirmarRemocaoCalcado = confirmarRemocaoCalcado;
window.removerCalcado = removerCalcado;

/* funções de apoio disponíveis para os outros scripts */

window.escaparHTML = escaparHTML;
window.idSeguro = idSeguro;
window.urlSegura = urlSegura;
window.montarLinkWhatsapp = montarLinkWhatsapp;

window.CATEGORIAS = CATEGORIAS;
window.categoriaDe = categoriaDe;
window.configCategoria = configCategoria;
window.tituloDoItem = tituloDoItem;
window.mensagemWhatsapp = mensagemWhatsapp;
window.opcoesSelect = opcoesSelect;
