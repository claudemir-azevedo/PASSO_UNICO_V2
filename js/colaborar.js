/* ========================================
CLIENT
======================================== */

const client = window.supabaseClient;

if (!client) {

    console.error("Supabase não inicializado.");

    window.location.href = "login.html";

    throw new Error("Supabase não inicializado.");

}

if (!client) {

    console.error("Supabase não inicializado.");

    window.location.href = "login.html";

    throw new Error("Supabase não inicializado.");

}


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


/* SESSION */

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
BUSCA CALÇADOS
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


if (error) {

    console.error(error);

    if (listaCalcados) {

        listaCalcados.innerHTML = `
            <div class="sem-calcados">
                Erro ao carregar seus calçados.
            </div>
        `;

    }

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
INJECT
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
LISTA
======================================== */

if(listaCalcados){

listaCalcados.innerHTML = "";


/* SEM ITENS */

if(calcados.length === 0){

listaCalcados.innerHTML = `

<div class="sem-calcados">

Nenhum calçado cadastrado ainda.

</div>

`;

return;

}


/* ========================================
CARDS
======================================== */
let html = "";

calcados.forEach(item=>{

html += `

<div class="painel-card">

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

<div class="painel-card-conteudo">

<h3>

${item.tipo || "Calçado"}
Nº ${item.numero || "-"}

</h3>

<p>

<strong>Pé:</strong>
${item.pe || "Não informado"}

</p>

<p>

<strong>Condição:</strong>
${item.condicao || "Não informado"}

</p>

<p>

<strong>Status:</strong>
${item.status || "-"}

</p>

</div>

</div>

`;

});
listaCalcados.innerHTML = html;

}


}catch(error){

console.error(error);

if(listaCalcados){

listaCalcados.innerHTML = `
<div class="sem-calcados">

Ocorreu um erro ao carregar o painel.

</div>
`;

}

}

// Fecha a função carregarPainel()
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