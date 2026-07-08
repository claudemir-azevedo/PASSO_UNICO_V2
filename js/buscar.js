console.log("SUPABASE:", window.supabaseClient);

const client = window.supabaseClient;

const listaCalcados =
document.getElementById("lista-calcados");

const contadorResultados =
document.getElementById("contadorResultados");

const formBusca =
document.getElementById("formBusca");

let todosCalcados = [];


/* ========================================
CARREGAR CALÇADOS
======================================== */

async function carregarCalcados(){

try{

const { data, error } =
await client
.from("calcados")
.select(`
*,
usuarios (
nome,
telefone,
email
)
`)
.eq("status","disponivel")
.order("created_at",{ ascending:false });

if(error){

console.error(error);
return;

}

todosCalcados = data || [];

renderizarCalcados(todosCalcados);

}catch(error){

console.error(error);

}

}


/* ========================================
RENDERIZAR
======================================== */

function renderizarCalcados(lista){

contadorResultados.innerHTML =
`${lista.length} pares encontrados`;

if(lista.length === 0){

listaCalcados.innerHTML = `

<div class="sem-calcados">

Nenhum calçado encontrado.

</div>

`;

return;

}

listaCalcados.innerHTML = "";

lista.forEach(item=>{

const telefone =
item.usuarios?.telefone || "";

const mensagem =
encodeURIComponent(
`Olá! Vi este calçado no PASSO ÚNICO:

${item.tipo} Nº ${item.numero}

Ele ainda está disponível?`
);

const whatsapp =
telefone
? `https://wa.me/55${telefone}?text=${mensagem}`
: "#";

listaCalcados.innerHTML += `

<div class="calcado-card">

<div class="calcado-imagem">

${

item.foto_url

?

`<img src="${item.foto_url}" alt="${item.tipo}">`

:

`<div class="sem-imagem">Sem imagem</div>`

}

<div class="status-badge">

Disponível

</div>

</div>

<div class="calcado-info">

<div class="tipo-badge">

${item.tipo}

</div>

<h3>

${item.tipo} • Nº ${item.numero}

</h3>

<div class="card-local">

📍 ${item.cidade} - ${item.estado}

</div>

<div class="card-detalhes">

<span>
👣 ${item.pe || "Não informado"}
</span>

<span>
⭐ ${item.condicao || "Não informado"}
</span>

<span>
🎯 ${item.objetivo || "Não informado"}
</span>

</div>

<button
class="btn-detalhes"
onclick='abrirDetalhesPublico(${JSON.stringify(item)})'>

Ver detalhes

</button>

</div>

</div>

`;

});

}


/* ========================================
FILTRO
======================================== */

formBusca.addEventListener(
"submit",
function(e){

e.preventDefault();

const cidade =
document
.getElementById("cidade")
.value
.toLowerCase()
.trim();

const numero =
document
.getElementById("numero")
.value
.trim();

const tipo =
document
.getElementById("tipo")
.value;

const filtrados =
todosCalcados.filter(item=>{

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
item.tipo === tipo;

return (
cidadeOk &&
numeroOk &&
tipoOk
);

});

renderizarCalcados(filtrados);

});



/* ========================================
INICIAR
======================================== */

carregarCalcados();
