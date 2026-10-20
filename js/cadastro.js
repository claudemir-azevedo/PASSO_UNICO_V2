/* ========================================
CLIENT
======================================== */

const client = window.supabaseClient;

if (!client) {
    console.error("Supabase não inicializado.");
}

const TEXTO_BOTAO = "Cadastrar item";


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

const campoCategoria = document.getElementById("categoria");
const campoTipo      = document.getElementById("tipo");
const campoPe        = document.getElementById("pe");
const campoMedidas   = document.getElementById("medidas");
const campoNumero    = document.getElementById("numero");

const grupoNumero    = document.getElementById("grupoNumero");
const grupoPe        = document.getElementById("grupoPe");
const grupoMedidas   = document.getElementById("grupoMedidas");

const lblTipo        = document.getElementById("lblTipo");
const lblPe          = document.getElementById("lblPe");
const lblMedidas     = document.getElementById("lblMedidas");


/* ========================================
CATEGORIAS
(a lista vem de CATEGORIAS, em modal.js)
======================================== */

function categoriaSelecionada(){

    return CATEGORIAS[campoCategoria?.value]
        ? campoCategoria.value
        : "calcado";

}

function montarCategorias(){

    campoCategoria.innerHTML =
        Object.entries(CATEGORIAS)
            .map(([chave, cfg]) =>
                `<option value="${escaparHTML(chave)}">${escaparHTML(cfg.rotulo)}</option>`
            )
            .join("");

    /* permite abrir já numa categoria: cadastro.html?categoria=muleta */

    const pedida =
        new URLSearchParams(window.location.search).get("categoria");

    if(pedida && CATEGORIAS[pedida]){
        campoCategoria.value = pedida;
    }

}

/* mostra só os campos que a categoria usa */

function atualizarFormulario(){

    const cfg = CATEGORIAS[categoriaSelecionada()];

    /* tipo */

    campoTipo.innerHTML =
        `<option value="">Selecione</option>` +
        cfg.tipos
            .map(t => `<option value="${escaparHTML(t)}">${escaparHTML(t)}</option>`)
            .join("");

    lblTipo.textContent = `Tipo de ${cfg.rotulo.toLowerCase()}`;

    /* número (só calçados) */

    grupoNumero.style.display = cfg.usaNumero ? "" : "none";

    if(!cfg.usaNumero){
        campoNumero.value = "";
    }

    /* pé (calçados) ou quantidade (muletas) */

    if(cfg.pe){

        grupoPe.style.display = "";

        lblPe.textContent = cfg.pe.rotulo;

        campoPe.innerHTML =
            `<option value="">Selecione</option>` +
            cfg.pe.opcoes
                .map(o => `<option value="${escaparHTML(o)}">${escaparHTML(o)}</option>`)
                .join("");

    }else{

        grupoPe.style.display = "none";

        campoPe.innerHTML = "";

    }

    /* medidas */

    if(cfg.medidas){

        grupoMedidas.style.display = "";

        lblMedidas.textContent = cfg.medidas.rotulo;

        campoMedidas.placeholder = cfg.medidas.placeholder;

    }else{

        grupoMedidas.style.display = "none";

        campoMedidas.value = "";

    }

}

montarCategorias();

atualizarFormulario();

campoCategoria.addEventListener("change", atualizarFormulario);


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

const categoria = categoriaSelecionada();

const cfg = CATEGORIAS[categoria];

const lerCampo = (id) =>
    document.getElementById(id)?.value.trim() || "";

const tipo      = lerCampo("tipo");
const numero    = lerCampo("numero");
const cidade    = lerCampo("cidade");
const estado    = lerCampo("estado");
const pe        = lerCampo("pe");
const condicao  = lerCampo("condicao");
const objetivo  = lerCampo("objetivo");
const descricao = lerCampo("descricao");
const medidas   = lerCampo("medidas");

const foto =
document
.getElementById("fotoCalcado")
?.files[0];


/* VALIDAÇÃO */

if(
!tipo ||
!cidade ||
!estado ||
!condicao ||
!objetivo ||
(cfg.usaNumero && !numero) ||
(cfg.pe && !pe)
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
    data,
    error: sessionError
} = await client.auth.getSession();

if (sessionError) {

    mostrarStatus(
        "Erro ao verificar login.",
        "erro"
    );

    return;

}

const session = data.session;


if(!session){

mostrarStatus(
"Faça login para continuar.",
"erro"
);

btnCadastrar.disabled = false;

btnCadastrar.innerText =
TEXTO_BOTAO;

return;

}


/* ========================================
UPLOAD FOTO
======================================== */

let fotoUrl = null;

if(foto){

/* tira espaços e acentos do nome do arquivo,
   que o armazenamento do Supabase pode recusar */

const nomeSeguro =
foto.name
.normalize("NFD")
.replace(/[̀-ͯ]/g, "")
.replace(/[^a-zA-Z0-9._-]/g, "-");

const nomeArquivo =
`${Date.now()}-${nomeSeguro}`;

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
TEXTO_BOTAO;

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

categoria,

tipo,

numero:
cfg.usaNumero ? Number(numero) : null,

cidade,
estado,

pe:
cfg.pe ? pe : null,

condicao,
objetivo,
descricao,

medidas:
cfg.medidas && medidas ? medidas : null,

foto_url:
fotoUrl,

status:
"disponivel"

}]);


if(error){

console.error(error);

mostrarStatus(
"Erro ao cadastrar item.",
"erro"
);

btnCadastrar.disabled = false;

btnCadastrar.innerText =
TEXTO_BOTAO;

return;

}


/* ========================================
SUCESSO
======================================== */

mostrarStatus(
"Item cadastrado com sucesso.",
"sucesso"
);

mostrarToast(
"Cadastro realizado com sucesso.",
"sucesso"
);

console.log("Item cadastrado:", {
    usuario: session.user.id,
    categoria,
    tipo
});

/* ========================================
LIMPAR CAMPOS
======================================== */

[
"tipo",
"numero",
"cidade",
"estado",
"pe",
"condicao",
"objetivo",
"descricao",
"medidas",
"fotoCalcado"
].forEach(id => {

    const campo = document.getElementById(id);

    if(campo) campo.value = "";

});


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
TEXTO_BOTAO;

}
);
