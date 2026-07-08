/* ========================================
CLIENT
======================================== */

const client = window.supabaseClient;


/* ========================================
ELEMENTOS
======================================== */

const btnCadastrar =
document.getElementById(
"btnCadastrar"
);

const statusCadastro =
document.getElementById(
"statusCadastro"
);


/* ========================================
STATUS
======================================== */

function mostrarStatus(
mensagem,
tipo
){

if(!statusCadastro) return;

statusCadastro.innerText =
mensagem;

statusCadastro.className =
`status-box ${tipo}`;

}


/* ========================================
CADASTRAR
======================================== */

btnCadastrar?.addEventListener(
"click",
async ()=>{

/* CAMPOS */

const tipo =
document
.getElementById("tipo")
?.value
.trim();

const numero =
document
.getElementById("numero")
?.value
.trim();

const cidade =
document
.getElementById("cidade")
?.value
.trim();

const estado =
document
.getElementById("estado")
?.value
.trim();

const pe =
document
.getElementById("pe")
?.value
.trim();

const condicao =
document
.getElementById("condicao")
?.value
.trim();

const objetivo =
document
.getElementById("objetivo")
?.value
.trim();

const descricao =
document
.getElementById("descricao")
?.value
.trim();

const foto =
document
.getElementById("fotoCalcado")
?.files[0];


/* VALIDAÇÃO */

if(
!tipo ||
!numero ||
!cidade ||
!estado ||
!pe ||
!condicao ||
!objetivo
){

mostrarStatus(
"Preencha todos os campos obrigatórios.",
"erro"
);

return;

}


/* LOADING */

btnCadastrar.disabled = true;

btnCadastrar.innerText =
"Cadastrando...";


try{


/* SESSION */

const {
data: { session }
} =
await client
.auth
.getSession();


if(!session){

mostrarStatus(
"Faça login para continuar.",
"erro"
);

btnCadastrar.disabled = false;

btnCadastrar.innerText =
"Cadastrar Calçado";

return;

}


/* ========================================
UPLOAD FOTO
======================================== */

let fotoUrl = null;

if(foto){

const nomeArquivo =
`${Date.now()}-${foto.name}`;

const {
error: uploadError
} =
await client
.storage
.from("calcados")
.upload(
nomeArquivo,
foto
);


if(uploadError){

console.error(uploadError);

mostrarStatus(
"Erro ao enviar imagem.",
"erro"
);

btnCadastrar.disabled = false;

btnCadastrar.innerText =
"Cadastrar Calçado";

return;

}


/* URL PÚBLICA */

const {
data: publicUrlData
} =
client
.storage
.from("calcados")
.getPublicUrl(
nomeArquivo
);

fotoUrl =
publicUrlData.publicUrl;

}


/* ========================================
INSERT
======================================== */

const {
error
} =
await client
.from("calcados")
.insert([{

usuario_id:
session.user.id,

tipo,
numero,
cidade,
estado,
pe,
condicao,
objetivo,
descricao,

foto_url:
fotoUrl,

status:
"disponivel"

}]);


if(error){

console.error(error);

mostrarStatus(
"Erro ao cadastrar calçado.",
"erro"
);

btnCadastrar.disabled = false;

btnCadastrar.innerText =
"Cadastrar Calçado";

return;

}


/* ========================================
SUCESSO
======================================== */

mostrarStatus(
"Calçado cadastrado com sucesso.",
"sucesso"
);

mostrarToast(
"Cadastro realizado com sucesso.",
"sucesso"
);


/* ========================================
LIMPAR CAMPOS
======================================== */

document.getElementById(
"tipo"
).value = "";

document.getElementById(
"numero"
).value = "";

document.getElementById(
"cidade"
).value = "";

document.getElementById(
"estado"
).value = "";

document.getElementById(
"pe"
).value = "";

document.getElementById(
"condicao"
).value = "";

document.getElementById(
"objetivo"
).value = "";

document.getElementById(
"descricao"
).value = "";

document.getElementById(
"fotoCalcado"
).value = "";


/* ========================================
REDIRECIONA
======================================== */

setTimeout(()=>{

window.location.href =
"painel-colaborador.html";

},1200);


}catch(error){

console.error(error);

mostrarStatus(
"Erro inesperado.",
"erro"
);

}


/* ========================================
RESET
======================================== */

btnCadastrar.disabled = false;

btnCadastrar.innerText =
"Cadastrar Calçado";

}
);