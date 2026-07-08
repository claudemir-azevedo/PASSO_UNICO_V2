/* ========================================
PASSO ÚNICO
PAINEL PREMIUM
======================================== */


/* ========================================
CLIENT
======================================== */

const client =
window.supabaseClient;


/* ========================================
ELEMENTOS
======================================== */

const totalCalcados =
document.getElementById(
"totalCalcados"
);

const totalDisponiveis =
document.getElementById(
"totalDisponiveis"
);

const totalEntregues =
document.getElementById(
"totalEntregues"
);

const listaCalcados =
document.getElementById(
"listaCalcados"
);


/* ========================================
CARREGAR PAINEL
======================================== */

async function carregarPainel(){

try{


/* ========================================
SESSION
======================================== */

const {
data: { session }
} =
await client.auth.getSession();


if(!session){

window.location.href =
"colaborar.html";

return;

}


const userId =
session.user.id;


/* ========================================
BUSCA
======================================== */

const {
data: calcados,
error
} =
await client
.from("calcados")
.select("*")
.eq(
"usuario_id",
userId
)
.order(
"created_at",
{
ascending:false
}
);


if(error){

console.error(error);

return;

}


/* ========================================
CONTADORES
======================================== */

const total =
calcados.length;

const disponiveis =
calcados.filter(
item =>
item.status === "disponivel"
).length;

const entregues =
calcados.filter(
item =>
item.status === "entregue"
).length;


/* ========================================
INJECT MÉTRICAS
======================================== */

if(totalCalcados){

totalCalcados.innerText =
total;

}

if(totalDisponiveis){

totalDisponiveis.innerText =
disponiveis;

}

if(totalEntregues){

totalEntregues.innerText =
entregues;

}


/* ========================================
SEM ITENS
======================================== */

if(
!calcados ||
calcados.length === 0
){

listaCalcados.innerHTML = `

<div class="sem-itens">

<h3>

Seu impacto começa agora.

</h3>

<p>

Cadastre o primeiro calçado
e comece a conectar pessoas
através da plataforma PASSO ÚNICO.

</p>

</div>

`;

return;

}


/* ========================================
RENDER
======================================== */

listaCalcados.innerHTML = "";


/* LOOP */

calcados.forEach(item=>{


const statusClasse =
item.status === "entregue"
?
"status entregue"
:
"status";


listaCalcados.innerHTML += `

<div class="calcado-card">


<!-- IMAGEM -->

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

<div class="painel-sem-imagem">

Imagem não disponível

</div>

`

}


<div class="calcado-conteudo">


<!-- STATUS -->

<div class="${statusClasse}">

${

item.status === "entregue"

?

"Entregue"

:

"Disponível"

}

</div>


<!-- TÍTULO -->

<h3>

${item.tipo || "Calçado"}
Nº ${item.numero || "-"}

</h3>


<!-- BADGES -->

<div class="calcado-badges">

<div class="badge pe">

${item.pe || "Não informado"}

</div>

<div class="badge">

${item.condicao || "Não informado"}

</div>

<div class="badge objetivo">

${item.objetivo || "Não informado"}

</div>

</div>


<!-- INFO -->

<div class="calcado-info">

<p>

<strong>Cidade:</strong>

${item.cidade || "-"}

</p>

<p>

<strong>Estado:</strong>

${item.estado || "-"}

</p>

</div>


<!-- DESCRIÇÃO -->

<p>

${

item.descricao

?

item.descricao.substring(0,120)

:

"Nenhuma descrição disponível."

}

...

</p>


<!-- AÇÕES -->

<div class="card-acoes">

<button
class="btn-card btn-editar"
onclick='abrirDetalhesCalcado(${JSON.stringify(item)})'>

Ver detalhes

</button>

<button
class="btn-card btn-remover"
onclick="confirmarRemocaoCalcado('${item.id}')">

Remover

</button>

</div>

</div>

</div>

`;

});


}catch(error){

console.error(error);

}

}


/* ========================================
INIT
======================================== */

document.addEventListener(
"DOMContentLoaded",
()=>{

carregarPainel();

}
);