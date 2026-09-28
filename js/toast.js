/* ========================================
TOAST
======================================== */

window.mostrarToast = function (
    mensagem,
    tipo = "sucesso"
) {

    if (!mensagem) return;

    const toastAnterior =
    document.querySelector(".toast.show");

    if (toastAnterior) {

        toastAnterior.remove();

    }

    const toast =
    document.createElement("div");

    toast.className =
    `toast ${tipo}`;

    toast.innerText =
    mensagem;

    document.body.appendChild(toast);

    requestAnimationFrame(() => {

        toast.classList.add("show");

    });

    const tempoExibicao = 3000;
    const tempoAnimacao = 300;

    setTimeout(() => {

        toast.classList.remove("show");

        setTimeout(() => {

            if (toast.parentNode) {

                toast.remove();

            }

        }, tempoAnimacao);

    }, tempoExibicao);

};