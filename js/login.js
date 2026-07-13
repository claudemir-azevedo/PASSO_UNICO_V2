const form = document.getElementById("form-login");
const btnLogin = document.querySelector(".btn-login-form");

function setLoading(loading) {
  if (!btnLogin) return;
  btnLogin.disabled = loading;
  btnLogin.innerText = loading ? "Entrando..." : "Entrar";
}

form?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.getElementById("email")?.value.trim();
  const senha = document.getElementById("senha")?.value;

  if (!email || !senha) {
    mostrarToast("Preencha e-mail e senha.", "erro");
    return;
  }

  setLoading(true);

  try {
    const { data, error } = await window.supabaseClient.auth.signInWithPassword({
      email,
      password: senha
    });

    if (error || !data.user) {
      mostrarToast("E-mail ou senha inválidos.", "erro");
      return;
    }

    const { data: usuario, error: usuarioError } = await window.supabaseClient
      .from("usuarios")
      .select("tipo_usuario")
      .eq("id", data.user.id)
      .maybeSingle();

    if (usuarioError) {
      console.error(usuarioError);
      mostrarToast("Não foi possível carregar o seu perfil. Tente novamente.", "erro");
      return;
    }

    if (!usuario?.tipo_usuario) {
      mostrarToast("Perfil não encontrado. Entre em contato com o suporte.", "erro");
      return;
    }

    mostrarToast("Login realizado com sucesso.", "sucesso");

    window.setTimeout(() => {
      if (usuario.tipo_usuario === "admin") {
        window.location.href = "gerenciar.html";
      } else if (usuario.tipo_usuario === "colaborador") {
        window.location.href = "painel-colaborador.html";
      } else {
        window.location.href = "menu.html";
      }
    }, 500);
  } catch (error) {
    console.error(error);
    mostrarToast("Não foi possível entrar agora. Tente novamente.", "erro");
  } finally {
    setLoading(false);
  }
});