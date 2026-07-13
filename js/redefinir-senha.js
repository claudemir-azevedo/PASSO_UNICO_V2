const formSenha = document.getElementById("formSenha");
const emailInput = document.getElementById("emailRecuperacao");
const novaSenha = document.getElementById("novaSenha");
const confirmarSenha = document.getElementById("confirmarSenha");
const grupoEmail = document.getElementById("grupoEmailRecuperacao");
const statusSenha = document.getElementById("statusSenha");
const botao = formSenha?.querySelector("button[type='submit']");
let recoverySession = false;

function mostrarStatus(texto, tipo) {
  if (!statusSenha) return;
  statusSenha.innerText = texto;
  statusSenha.className = `status-box ${tipo}`;
}

function setLoading(loading, texto) {
  if (!botao) return;
  botao.disabled = loading;
  botao.innerText = loading ? texto : (recoverySession ? "Salvar nova senha" : "Enviar link de recuperação");
}

function atualizarModo() {
  if (grupoEmail) grupoEmail.hidden = recoverySession;
  if (novaSenha?.parentElement) novaSenha.parentElement.hidden = !recoverySession;
  if (confirmarSenha?.parentElement) confirmarSenha.parentElement.hidden = !recoverySession;
  if (novaSenha) novaSenha.required = recoverySession;
  if (confirmarSenha) confirmarSenha.required = recoverySession;
  setLoading(false);
}

async function detectarSessaoDeRecuperacao() {
  const { data } = await window.supabaseClient.auth.getSession();
  recoverySession = Boolean(data.session);
  atualizarModo();
}

window.supabaseClient.auth.onAuthStateChange((event, session) => {
  if (event === "PASSWORD_RECOVERY" || session) {
    recoverySession = Boolean(session);
    atualizarModo();
  }
});

formSenha?.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!recoverySession) {
    const email = emailInput?.value.trim();
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      mostrarStatus("Informe um e-mail válido.", "erro");
      return;
    }

    setLoading(true, "Enviando link...");
    try {
      const { error } = await window.supabaseClient.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}${window.location.pathname}`
      });
      if (error) {
        mostrarStatus("Não foi possível enviar o link. Tente novamente.", "erro");
        return;
      }
      mostrarStatus("Enviamos um link de recuperação para o seu e-mail.", "sucesso");
    } catch (error) {
      console.error(error);
      mostrarStatus("Ocorreu um erro inesperado. Tente novamente.", "erro");
    } finally {
      setLoading(false);
    }
    return;
  }

  const senha = novaSenha?.value || "";
  const confirmacao = confirmarSenha?.value || "";

  if (senha.length < 8 || !/[A-Za-z]/.test(senha) || !/\d/.test(senha)) {
    mostrarStatus("A senha deve ter ao menos 8 caracteres, incluindo letras e números.", "erro");
    return;
  }
  if (senha !== confirmacao) {
    mostrarStatus("As senhas não coincidem.", "erro");
    return;
  }

  setLoading(true, "Salvando...");
  try {
    const { error } = await window.supabaseClient.auth.updateUser({ password: senha });
    if (error) {
      mostrarStatus("O link de recuperação expirou ou é inválido. Solicite um novo.", "erro");
      return;
    }
    mostrarStatus("Senha atualizada com sucesso. Você já pode entrar.", "sucesso");
    window.setTimeout(() => { window.location.href = "login.html"; }, 1000);
  } catch (error) {
    console.error(error);
    mostrarStatus("Ocorreu um erro inesperado. Tente novamente.", "erro");
  } finally {
    setLoading(false);
  }
});

detectarSessaoDeRecuperacao();