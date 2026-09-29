/* ========================================
CLIENT
======================================== */

const client = window.supabaseClient;

if (!client) {
    console.error("Supabase não inicializado.");
    throw new Error("Supabase não inicializado.");
}


/* ========================================
ELEMENTOS
======================================== */

const campoNome     = document.getElementById("cad_nome");
const campoTelefone = document.getElementById("cad_telefone");
const campoCidade   = document.getElementById("cad_cidade");
const campoEstado   = document.getElementById("cad_estado");
const campoEmail    = document.getElementById("cad_email");
const campoSenha    = document.getElementById("cad_senha");
const btnCadastrar  = document.getElementById("btnCadastrar");
const msgCadastro   = document.getElementById("msgCadastro");


/* ========================================
STATUS
======================================== */

function mostrarStatus(mensagem, tipo) {

    if (!msgCadastro) return;

    msgCadastro.innerText = mensagem;
    msgCadastro.className = `status-box ${tipo}`;

}


/* ========================================
CRIAR CONTA
======================================== */

btnCadastrar?.addEventListener("click", async (evento) => {

    evento.preventDefault();

    const nome     = campoNome?.value.trim();
    const telefone = campoTelefone?.value.trim();
    const cidade   = campoCidade?.value.trim();
    const estado   = campoEstado?.value;
    const email    = campoEmail?.value.trim().toLowerCase();
    const senha    = campoSenha?.value;

    if (!nome || !cidade || !estado || !email || !senha) {
        mostrarStatus("Preencha nome, cidade, estado, e-mail e senha para continuar.", "erro");
        return;
    }

    if (senha.length < 6) {
        mostrarStatus("A senha deve ter pelo menos 6 caracteres.", "erro");
        return;
    }

    btnCadastrar.disabled = true;
    mostrarStatus("Criando sua conta...", "carregando");

    try {

        const { data: authData, error: authError } = await client.auth.signUp({

            email,
            password: senha,

            options: {
                data: {
                    nome,
                    telefone: telefone || null,
                    cidade,
                    estado
                }
            }

        });

        if (authError) throw authError;

        if (!authData.user)
            throw new Error("Usuário não criado.");

        if (authData.user.identities && authData.user.identities.length === 0) {
            mostrarStatus("Este e-mail já está cadastrado. Faça login.", "erro");
            btnCadastrar.disabled = false;
            return;
        }

        if (authData.session) {
            mostrarStatus("Conta criada com sucesso! Redirecionando...", "sucesso");
        } else {
            mostrarStatus("Conta criada! Confirme seu e-mail para entrar.", "sucesso");
        }

        setTimeout(() => {
            window.location.href = "login.html";
        }, 2000);

    } catch (erro) {

        console.error(erro);

        const mensagem =
            erro.message?.includes("already registered") ||
            erro.message?.includes("já está cadastrado")
                ? "Este e-mail já está cadastrado. Faça login."
                : "Não foi possível criar a conta. Tente novamente.";

        mostrarStatus(mensagem, "erro");
        btnCadastrar.disabled = false;

    }

});
