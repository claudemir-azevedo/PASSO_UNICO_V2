/* ========================================
TOAST
======================================== */

window.mostrarToast = function(
mensagem,
tipo = "sucesso"
){

const toast =
document.createElement("div");

toast.className =
`toast ${tipo}`;

toast.innerText =
mensagem;

document.body.appendChild(toast);


/* ENTRADA */

setTimeout(()=>{

toast.classList.add("show");

},100);


/* SAÍDA */

setTimeout(()=>{

toast.classList.remove("show");

setTimeout(()=>{

toast.remove();

},300);

},3000);

};