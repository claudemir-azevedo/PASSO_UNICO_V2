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

    console.log(conteudoHTML);

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

console.log("ABRIU MODAL", item);

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
target="_blank"
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

console.log(item);
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

<a
href="${whatsappLink}"
target="_blank"
class="modal-whatsapp">

Entrar em contato

</a>

</div>

</div>

</div>

`);

}


/* ========================================
ABRIR EDIÇÃO
======================================== */

function abrirEdicaoCalcado(item){
console.log(item);
console.log("ID DO ITEM:", item.id);
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
onclick="alert('BOTÃO FUNCIONOU'); salvarEdicaoCalcado('${item.id}')">

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

console.log("FUNÇÃO SALVAR EXECUTADA");

const client =
window.supabaseClient;

const {
    data: { user }
} = await client.auth.getUser();

console.log("USUÁRIO LOGADO:", user);

console.log("ID RECEBIDO:", id);


/* CAMPOS */

console.log("MODAL:", document.querySelector(".modal-overlay"));
console.log("STATUS:", document.getElementById("editStatus"));

const status =
document.getElementById(
"editStatus"
).value;

const condicao =
document.getElementById(
"editCondicao"
).value;

const objetivo =
document.getElementById(
"editObjetivo"
).value;

const descricao =
document.getElementById(
"editDescricao"
).value;

const tipo =
document.getElementById(
"editTipo"
).value;

const numero =
document.getElementById(
"editNumero"
).value;

const pe =
document.getElementById(
"editPe"
).value;

const cidade =
document.getElementById(
"editCidade"
).value;

const estado =
document.getElementById(
"editEstado"
).value;

const preco =
document.getElementById(
"editPreco"
).value;


/* UPDATE */
console.log("DADOS ENVIADOS:", {

tipo,
numero,
pe,
cidade,
estado,
preco,

status,
condicao,
objetivo,
descricao

});

console.log("CLIENTE:", client);

alert("CHEGUEI NO UPDATE");

try {

    const {
        data,
        error
    } = await client
    .from("calcados")
    .update({

        tipo,
        numero,
        pe,
        cidade,
        estado,
        preco,

        status,
        condicao,
        objetivo,
        descricao

    })
    .eq("id", id)
    .select();

    alert("SAÍ DO UPDATE");

    alert("ERRO = " + JSON.stringify(error));
    alert("DATA = " + JSON.stringify(data));

    console.log("DATA:", data);
    console.log("ERROR:", error);

} catch (e) {

    console.error("EXCEÇÃO DO SUPABASE:", e);
    alert("EXCEÇÃO: " + e.message);

    return;

}

console.log("UPDATE REALIZADO COM SUCESSO");


mostrarToast(
"Calçado atualizado com sucesso.",
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

console.log("CLIENTE:", client);


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

window.salvarEdicaoCalcado = salvarEdicaoCalcado;
window.confirmarRemocaoCalcado = confirmarRemocaoCalcado;
window.removerCalcado = removerCalcado;