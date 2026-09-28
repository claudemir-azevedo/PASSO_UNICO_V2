/* ==========================================================
   PASSO ÚNICO
   redefinir-senha.js

   Dois modos na mesma página:
   1) Sem sessão de recuperação  -> pede o e-mail e envia o link
   2) Com sessão de recuperação  -> permite definir a nova senha
   (a sessão de recuperação chega pelo link enviado por e-mail)
========================================================== */

const blocoEmail = document.getElementById("blocoEmail");
const blocoSenha = document.getElementById("blocoSenha");

const formEmail = document.getElementById("formEmail");
const formSenha = document.getElementById("formSenha");

const emailRecuperar = document.getElementById("emailRecuperar");
const novaSenha = document.getElementById("novaSenha");
const confirmarSenha = document.getElementById("confirmarSenha");

function mostrarModo(modo) {
    blocoEmail.style.display = modo === "email" ? "block" : "none";
    blocoSenha.style.display = modo === "senha" ? "block" : "none";
}

/* ---------- DECIDE QUAL MODO MOSTRAR ---------- */

(async () => {

    if (!window.supabaseClient) {
        mostrarToast("Erro ao conectar ao servidor.", "erro");
        return;
    }

    const hash = window.location.hash || "";
    const veioDoEmail =
        hash.includes("type=recovery") ||
        window.location.search.includes("code=");

    // o Supabase troca o link do e-mail por uma sessão de recuperação
    window.supabaseClient.auth.onAuthStateChange((evento) => {
        if (evento === "PASSWORD_RECOVERY") {
            mostrarModo("senha");
        }
    });

    const { data } = await window.supabaseClient.auth.getSession();

    if (veioDoEmail && data.session) {
        mostrarModo("senha");
    } else if (veioDoEmail) {
        // aguarda o evento PASSWORD_RECOVERY; se não vier, cai para o e-mail
        mostrarModo("senha");
        setTimeout(async () => {
            const { data: d2 } = await window.supabaseClient.auth.getSession();
            if (!d2.session) {
                mostrarModo("email");
                mostrarToast("Link inválido ou expirado. Solicite um novo.", "erro");
            }
        }, 2500);
    } else {
        mostrarModo("email");
    }

})();

/* ---------- MODO 1: ENVIAR LINK ---------- */

formEmail?.addEventListener("submit", async (e) => {

    e.preventDefault();

    const email = emailRecuperar.value.trim().toLowerCase();
    if (!email) return;

    const btn = formEmail.querySelector("button[type=submit]");
    btn.disabled = true;

    try {

        const { error } = await window.supabaseClient.auth.resetPasswordForEmail(
            email,
            { redirectTo: window.location.origin + window.location.pathname }
        );

        if (error) throw error;

        mostrarToast(
            "Se o e-mail estiver cadastrado, você receberá o link em instantes.",
            "sucesso"
        );

    } catch (erro) {

        console.error(erro);
        mostrarToast("Não foi possível enviar o e-mail. Tente novamente.", "erro");

    } finally {

        btn.disabled = false;

    }

});

/* ---------- MODO 2: SALVAR NOVA SENHA ---------- */

formSenha?.addEventListener("submit", async (e) => {

    e.preventDefault();

    if (novaSenha.value.length < 6) {
        mostrarToast("A senha deve possuir pelo menos 6 caracteres.", "erro");
        return;
    }

    if (novaSenha.value !== confirmarSenha.value) {
        mostrarToast("As senhas não conferem.", "erro");
        return;
    }

    const btn = formSenha.querySelector("button[type=submit]");
    btn.disabled = true;

    try {

        const { error } = await window.supabaseClient.auth.updateUser({
            password: novaSenha.value
        });

        if (error) throw error;

        mostrarToast("Senha atualizada com sucesso.", "sucesso");

        await window.supabaseClient.auth.signOut();

        setTimeout(() => {
            window.location.href = "login.html";
        }, 1500);

    } catch (erro) {

        console.error(erro);
        mostrarToast("Não foi possível atualizar a senha. Solicite um novo link.", "erro");
        btn.disabled = false;

    }

});
