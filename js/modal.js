/* ========================================
MODAL PASSO ÚNICO
VERSÃO PREMIUM
======================================== */


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

    console.log(
    "OVERLAY CRIADO",
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
DETALHES CALÇADO
======================================== */


function abrirDetalhesCalcado(item){

window.itemEdicao = item;

const telefone =
item.usuarios?.telefone || "";

const mensagem =
`Olá! Vi este calçado no PASSO ÚNICO:

${item.tipo} Nº ${item.numero}
${item.cidade} / ${item.estado}

Ele ainda está disponível?`;

const whatsappLink =
telefone
?
`https://wa.me/55${telefone}?text=${encodeURIComponent(mensagem)}`
:
"#";


abrirModal(`

<button
class="modal-fechar"
onclick="fecharModal()">

×

</button>

<div class="modal-grid">


<!-- IMAGEM -->

<div class="modal-imagem">

${

item.foto_url

?

`

<img
src="${item.foto_url}"
alt="${item.tipo}">

`

:

`

<div class="modal-sem-imagem">

Imagem não disponível

</div>

`

}

</div>


<!-- CONTEÚDO -->

<div class="modal-conteudo">

<h1 class="modal-titulo">

${item.tipo} Nº ${item.numero}

</h1>

<div class="modal-status">

${item.status || "disponivel"}

</div>


<!-- BADGES -->

<div class="modal-badges">

<div class="modal-badge pe">

${item.pe || "Não informado"}

</div>

<div class="modal-badge condicao">

${item.condicao || "Não informado"}

</div>

<div class="modal-badge objetivo">

${item.objetivo || "Não informado"}

</div>

</div>


<!-- INFO -->

<div class="modal-info">

<div class="modal-item">

<span>

Cidade

</span>

<p>

${item.cidade || "-"}

</p>

</div>


<div class="modal-item">

<span>

Estado

</span>

<p>

${item.estado || "-"}

</p>

</div>


<div class="modal-item">

<span>

Colaborador

</span>

<p>

${item.usuarios?.nome || "Usuário"}

</p>

</div>

<div class="modal-item">

<span>

E-mail

</span>

<p>

${item.usuarios?.email || "-"}

</p>

</div>

<div class="modal-item">

<span>

Telefone

</span>

<p>

${item.usuarios?.telefone || "-"}

</p>

</div>

</div>


<!-- DESCRIÇÃO -->

<div class="modal-descricao">

<h3>

Sobre o calçado

</h3>

<p>

${

item.descricao ||
"Nenhuma descrição informada."

}

</p>

</div>


<!-- BOTÕES -->

<div class="modal-acoes">

<a
href="${whatsappLink}"
target="_blank" rel="noopener noreferrer"
class="modal-whatsapp">

Entrar em contato

</a>

<button
class="btn-confirmar"
onclick='abrirEdicaoCalcado(${JSON.stringify(item)})'>

Editar informações

</button>

</div>

</div>

</div>

`);

}

function abrirDetalhesPublico(item){

abrirModal(`

<button
class="modal-fechar"
onclick="fecharModal()">

×

</button>

<div class="modal-grid">

<div class="modal-imagem">

${
item.foto_url

?

`

<img
src="${item.foto_url}"
alt="${item.tipo}">

`

:

`

<div class="modal-sem-imagem">

Imagem não disponível

</div>

`
}

</div>

<div class="modal-conteudo">

<h1 class="modal-titulo">

${item.tipo} Nº ${item.numero}

</h1>

<div class="modal-badges">

<div class="modal-badge pe">

${item.pe || "Não informado"}

</div>

<div class="modal-badge condicao">

${item.condicao || "Não informado"}

</div>

<div class="modal-badge objetivo">

${item.objetivo || "Não informado"}

</div>

</div>

<div class="modal-info">

<div class="modal-item">

<span>Cidade</span>

<p>${item.cidade || "-"}</p>

</div>

<div class="modal-item">

<span>Estado</span>

<p>${item.estado || "-"}</p>

</div>

<div class="modal-item">

<span>Colaborador</span>

<p>${item.usuarios?.nome || "Usuário"}</p>

</div>

</div>

<div class="modal-descricao">

<h3>Sobre o calçado</h3>

<p>

${item.descricao || "Nenhuma descrição informada."}

</p>

</div>

<div class="modal-acoes">

<button
type="button"
class="modal-whatsapp"
onclick="entrarEmContato('${item.id}')">
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

        const mensagem =
`Olá! Vi este calçado no PASSO ÚNICO:
${item.tipo} Nº ${item.numero}
${item.cidade || ""} / ${item.estado || ""}
Ele ainda está disponível?`;

        const link =
            `https://wa.me/${contato.telefone}?text=${encodeURIComponent(mensagem)}`;

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
======================================== */

function abrirEdicaoCalcado(item){
abrirModal(`

<button
class="modal-fechar"
onclick="fecharModal()">

×

</button>

<div class="modal-conteudo">

<h2 class="modal-titulo">

Editar calçado

</h2>
<div class="modal-item">

<span>Tipo</span>

<input
id="editTipo"
type="text"
value="${item.tipo || ''}">

</div>

<div class="modal-item">

<span>Número</span>

<input
id="editNumero"
type="number"
value="${item.numero || ''}">

</div>

<div class="modal-item">

<span>Pé</span>

<select id="editPe">

<option value="Direito"
${item.pe === "Direito" ? "selected" : ""}>

Direito

</option>

<option value="Esquerdo"
${item.pe === "Esquerdo" ? "selected" : ""}>

Esquerdo

</option>

<option value="Par"
${item.pe === "Par" ? "selected" : ""}>

Par

</option>

</select>

</div>

<div class="modal-item">

<span>Cidade</span>

<input
id="editCidade"
type="text"
value="${item.cidade || ''}">

</div>

<div class="modal-item">

<span>Estado</span>

<input
id="editEstado"
type="text"
value="${item.estado || ''}">

</div>

<div class="modal-item">

<span>Preço</span>

<input
id="editPreco"
type="number"
value="${item.preco || ''}">

</div>


<!-- FORM -->

<div class="modal-info">


<div class="modal-item">

<span>

Status

</span>

<select id="editStatus">

<option value="disponivel"
${item.status === "disponivel" ? "selected" : ""}>

Disponível

</option>

<option value="entregue"
${item.status === "entregue" ? "selected" : ""}>

Entregue

</option>

</select>

</div>


<div class="modal-item">

<span>

Condição

</span>

<select id="editCondicao">

<option value="Novo"
${item.condicao === "Novo" ? "selected" : ""}>

Novo

</option>

<option value="Seminovo"
${item.condicao === "Seminovo" ? "selected" : ""}>

Seminovo

</option>

<option value="Usado"
${item.condicao === "Usado" ? "selected" : ""}>

Usado

</option>

<option value="Precisa reparo"
${item.condicao === "Precisa reparo" ? "selected" : ""}>

Precisa reparo

</option>

</select>

</div>


<div class="modal-item">

<span>

Objetivo

</span>

<select id="editObjetivo">

<option value="Doação"
${item.objetivo === "Doação" ? "selected" : ""}>

Doação

</option>

<option value="Troca"
${item.objetivo === "Troca" ? "selected" : ""}>

Troca

</option>

<option value="Venda solidária"
${item.objetivo === "Venda solidária" ? "selected" : ""}>

Venda solidária

</option>

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
">

${item.descricao || ""}

</textarea>

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
onclick="salvarEdicaoCalcado('${item.id}')">

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

        const valor = (campo) =>
            (document.getElementById(campo)?.value || "").trim();

        /* campos numéricos: vazio vira null (o banco não aceita texto vazio) */

        const numeroTexto = valor("editNumero");
        const precoTexto = valor("editPreco").replace(",", ".");

        const numero = numeroTexto === "" ? null : Number(numeroTexto);
        const preco = precoTexto === "" ? null : Number(precoTexto);

        if (numero !== null && Number.isNaN(numero)) {
            mostrarToast("Número inválido.", "erro");
            return;
        }

        if (preco !== null && Number.isNaN(preco)) {
            mostrarToast("Preço inválido. Use apenas números (ex: 50 ou 49,90).", "erro");
            return;
        }

        const { data, error } = await client
            .from("calcados")
            .update({
                tipo: valor("editTipo"),
                numero,
                pe: valor("editPe"),
                cidade: valor("editCidade"),
                estado: valor("editEstado"),
                preco,
                status: valor("editStatus"),
                condicao: valor("editCondicao"),
                objetivo: valor("editObjetivo"),
                descricao: valor("editDescricao")
            })
            .eq("id", id)
            .select();

        if (error) {
            console.error("Erro ao salvar calçado:", error);
            mostrarToast("Não foi possível salvar as alterações.", "erro");
            return;
        }

        /* nenhuma linha alterada = sem permissão para editar este calçado */

        if (!data || data.length === 0) {
            mostrarToast("Você não tem permissão para editar este calçado.", "erro");
            return;
        }

        mostrarToast("Calçado atualizado com sucesso.", "sucesso");

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

Remover calçado?

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
onclick="removerCalcado('${id}')">

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
"Erro ao remover calçado.",
"erro"
);

return;

}


mostrarToast(
"Calçado removido com sucesso.",
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