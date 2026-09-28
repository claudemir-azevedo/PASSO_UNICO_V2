/* ==========================================================
   PASSO ÚNICO
   criar-conta.js
========================================================== */

(async () => {

    if (!window.supabaseClient) return;

    const {
        data
    } = await window.supabaseClient.auth.getSession();

    if (data.session) {

        window.location.href = "painel-colaborador.html";

    }

})();

const btnCriar = document.getElementById("btnCriar");

const nome = document.getElementById("nome");
const email = document.getElementById("email");
const telefone = document.getElementById("telefone");
const cidade = document.getElementById("cidade");
const estado = document.getElementById("estado");
const senha = document.getElementById("senha");
const tipoUsuario = document.getElementById("tipo_usuario");

btnCriar?.addEventListener("click", criarConta);

async function criarConta() {

    const dados = {
        nome: nome.value.trim(),
        email: email.value.trim().toLowerCase(),
        telefone: telefone.value.trim(),
        cidade: cidade.value.trim(),
        estado: estado.value.trim(),
        senha: senha.value,
        tipo_usuario: tipoUsuario.value
    };

    if (
        !dados.nome ||
        !dados.email ||
        !dados.senha
    ) {

        mostrarToast(
            "Preencha os campos obrigatórios.",
            "erro"
        );

        return;

    }

    if (dados.senha.length < 6) {

        mostrarToast(
            "A senha deve possuir pelo menos 6 caracteres.",
            "erro"
        );

        return;

    }

    if (!window.supabaseClient) {

        mostrarToast(
            "Erro ao conectar ao servidor.",
            "erro"
        );

        return;

    }

    btnCriar.disabled = true;
    btnCriar.innerText = "Criando conta...";

    try {

        /* =====================================
           AUTH
           O perfil na tabela "usuarios" é criado
           automaticamente no banco (trigger), a partir
           dos dados enviados em options.data.
        ===================================== */

        const {
            data: authData,
            error: authError
        } =
        await window.supabaseClient.auth.signUp({

            email: dados.email,

            password: dados.senha,

            options: {
                data: {
                    nome: dados.nome,
                    telefone: dados.telefone,
                    cidade: dados.cidade,
                    estado: dados.estado
                }
            }

        });

        if (authError)
            throw authError;

        if (!authData.user)
            throw new Error("Usuário não criado.");

        // e-mail já cadastrado (o Supabase não devolve erro nesse caso)
        if (authData.user.identities && authData.user.identities.length === 0)
            throw new Error("already registered");

        if (authData.session) {

            // confirmação de e-mail desligada: já está logado
            mostrarToast(
                "Conta criada com sucesso.",
                "sucesso"
            );

        } else {

            // confirmação de e-mail ligada: precisa clicar no link
            mostrarToast(
                "Conta criada! Confirme seu e-mail para entrar.",
                "sucesso"
            );

        }

        setTimeout(() => {

            window.location.href =
                "login.html";

        }, 2000);

    }

    catch (erro) {

        console.error(erro);

        let mensagem =
            "Erro ao criar conta.";

        if (
            erro.message?.toLowerCase().includes("already") ||
            erro.message?.toLowerCase().includes("registered")
        ) {

            mensagem =
                "Este e-mail já está cadastrado.";

        }

        mostrarToast(
            mensagem,
            "erro"
        );

    }

    finally {

        btnCriar.disabled = false;

        btnCriar.innerText =
            "Criar Conta";

    }

}