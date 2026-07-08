const form =
document.getElementById(
"form-login"
);

const btnLogin =
document.querySelector(
".btn-login"
);


/* ========================================
SUBMIT
======================================== */

form?.addEventListener(
"submit",
async (event)=>{

event.preventDefault();


/* CAMPOS */

const email =
document
.getElementById("email")
?.value
.trim();

const senha =
document
.getElementById("senha")
?.value
.trim();


/* VALIDAÇÃO */

if(!email || !senha){

mostrarToast(
"Preencha todos os campos.",
"erro"
);

return;

}


/* LOADING */

btnLogin.disabled = true;

btnLogin.innerText =
"Entrando...";


try{


/* LOGIN */

const {
data,
error
} =
await window.supabaseClient.auth.signInWithPassword({

email,
password: senha

});


if(error){

console.error(error);

mostrarToast(
"Email ou senha inválidos.",
"erro"
);

btnLogin.disabled = false;

btnLogin.innerText =
"Entrar";

return;

}


/* BUSCA USUÁRIO */

const {
data: usuario,
error: usuarioError
} =
await window.supabaseClient
.from("usuarios")
.select("tipo_usuario")
.eq(
"id",
data.user.id
)
.single();


console.log(
"USUARIO:",
usuario
);

console.log(
"ERRO USUARIO:",
usuarioError
);


/* ERRO PERFIL */

if(usuarioError){

console.error(usuarioError);

mostrarToast(
"Erro ao carregar perfil.",
"erro"
);

btnLogin.disabled = false;

btnLogin.innerText =
"Entrar";

return;

}


/* PERFIL NÃO ENCONTRADO */

if(!usuario){

mostrarToast(
"Usuário não encontrado.",
"erro"
);

btnLogin.disabled = false;

btnLogin.innerText =
"Entrar";

return;

}


/* SUCESSO */

mostrarToast(
"Login realizado com sucesso.",
"sucesso"
);


/* REDIRECIONAMENTO */

setTimeout(()=>{

if(
usuario.tipo_usuario === "admin"
){

window.location.href =
"gerenciar.html";

return;

}


if(
usuario.tipo_usuario === "colaborador"
){

window.location.href =
"painel-colaborador.html";

return;

}


/* FALLBACK */

window.location.href =
"menu.html";

},800);


}catch(error){

console.error(error);

mostrarToast(
"Erro inesperado ao entrar.",
"erro"
);

btnLogin.disabled = false;

btnLogin.innerText =
"Entrar";

}

}
);