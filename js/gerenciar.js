/* ========================================
AGUARDAR SUPABASE
======================================== */

async function iniciarPainel(){

/* ESPERA SUPABASE */

while(!window.supabaseClient){

await new Promise(resolve=>
setTimeout(resolve,100)
);

}
const supabase =
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

const totalUsuarios =
document.getElementById(
"totalUsuarios"
);

const tabelaCalcados =
document.getElementById(
"tabelaCalcados"
);


/* ========================================
BUSCAR CALÇADOS
======================================== */

const {
data: calcados,
error: erroCalcados
} =
await supabase
.from("calcados")
.select(`
*,
usuarios(*)
`);

console.log("CALCADOS:", calcados);

console.log("CALCADOS JSON:",
JSON.stringify(calcados,null,2)
);


/* ========================================
BUSCAR USUÁRIOS
======================================== */

const {
data: usuarios,
error: erroUsuarios
} =
await supabase
.from("usuarios")
.select("*");

console.log(
"USUÁRIOS:",
usuarios
);

console.log(
"USUARIOS JSON:",
JSON.stringify(
usuarios,
null,
2
)
);

console.log(
"TOTAL USUARIOS:",
usuarios?.length
);

console.log(
"ERRO USUÁRIOS:",
erroUsuarios
);


/* ========================================
VALIDA ERROS
======================================== */

if(erroCalcados){

console.error(
erroCalcados
);

return;

}

if(erroUsuarios){

console.error(
erroUsuarios
);

return;

}


/* ========================================
MÉTRICAS
======================================== */

const total =
calcados?.length || 0;

const disponiveis =
calcados?.filter(item=>
item.status === "disponivel"
).length || 0;

const entregues =
calcados?.filter(item=>
item.status === "entregue"
).length || 0;

const usuariosTotal =
usuarios?.length || 0;


/* ========================================
ATUALIZA CARDS
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

if(totalUsuarios){

totalUsuarios.innerText =
usuariosTotal;

}


/* ========================================
VALIDA TABELA
======================================== */

if(!tabelaCalcados){

return;

}


/* ========================================
LIMPA TABELA
======================================== */

tabelaCalcados.innerHTML = "";


/* ========================================
SEM CALÇADOS
======================================== */

if(total === 0){

tabelaCalcados.innerHTML = `

<tr>

<td colspan="7">

Nenhum calçado cadastrado.

</td>

</tr>

`;

return;

}


/* ========================================
MONTA TABELA
======================================== */

const mapaUsuarios = {};

usuarios.forEach(usuario => {

    mapaUsuarios[usuario.id] =
    usuario.nome;

});

/* DISPONIBILIZA OS CALÇADOS GLOBALMENTE */
window.calcadosPainel = calcados;

calcados.forEach((item,index)=>{

tabelaCalcados.innerHTML += `

<tr>

<td>

${item.tipo || "-"}

</td>

<td>

${item.numero || "-"}

</td>

<td>

${item.cidade || "-"}

</td>

<td>

${item.estado || "-"}

</td>

<td>

${item.status || "-"}

</td>

<td>

<strong>

${mapaUsuarios[item.usuario_id] || "-"}

</strong>

</td>

<td>

<button
class="btn-tabela"
onclick="abrirDetalhesCalcado(window.calcadosPainel[${index}])">

Ver

</button>

</td>

</tr>

`;

});


}


/* ========================================
INIT
======================================== */

document.addEventListener(
"DOMContentLoaded",
()=>{

iniciarPainel();

}
);