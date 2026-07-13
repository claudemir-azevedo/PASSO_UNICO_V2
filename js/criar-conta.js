const btnCriar = document.getElementById("btnCriar");
const mensagem = document.getElementById("mensagem");

function mostrarMensagem(texto, tipo) {
  if (!mensagem) return;
  mensagem.innerText = texto;
  mensagem.className = `status ${tipo}`;
  mensagem.style.display = "block";
}

function setLoading(loading) {
  if (!btnCriar) return;
  btnCriar.disabled = loading;
  btnCriar.innerText = loading ? "Criando conta..." : "Criar Conta";
}

btnCriar?.addEventListener("click", async () => {
  const nome = document.getElementById("nome")?.value.trim();
  const email = document.getElementById("email")?.value.trim();
  const telefone = document.getElementById("telefone")?.value.trim();
  const cidade = document.getElementById("cidade")?.value.trim();
  const estado = document.getElementById("estado")?.value.trim().toUpperCase();
  const senha = document.getElementById("senha")?.value || "";

  if (!nome || nome.length < 3 || !email || !telefone || !cidade || !/^[A-Za-z]{2}$/.test(estado)) {
    mostrarMensagem("Preencha todos os campos com dados válidos.", "erro");
    return;
  }

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    mostrarMensagem("Informe um e-mail válido.", "erro");
    return;
  }

  if (telefone.replace(/\D/g, "").length < 10) {
    mostrarMensagem("Informe um telefone válido com DDD.", "erro");
    return;
  }

  if (senha.length < 8 || !/[A-Za-z]/.test(senha) || !/\d/.test(senha)) {
    mostrarMensagem("A senha deve ter ao menos 8 caracteres, incluindo letras e números.", "erro");
    return;
  }

  setLoading(true);

  try {
    const { data, error } = await window.supabaseClient.auth.signUp({
      email,
      password: senha,
      options: { data: { nome, telefone, cidade, estado } }
    });

    if (error || !data.user) {
      mostrarMensagem(error?.message || "Não foi possível criar a conta.", "erro");
      return;
    }

    if (data.session) {
      const { error: perfilError } = await window.supabaseClient.from("usuarios").upsert({
        id: data.user.id,
        nome,
        telefone,
        cidade,
        estado,
        tipo_usuario: "colaborador"
      });

      if (perfilError) {
        console.error(perfilError);
        mostrarMensagem("Conta criada, mas o perfil não pôde ser finalizado. Entre em contato com o suporte.", "erro");
        return;
      }

      mostrarMensagem("Conta criada com sucesso. Você já pode entrar.", "sucesso");
      window.setTimeout(() => { window.location.href = "login.html"; }, 900);
      return;
    }

    mostrarMensagem("Conta criada. Verifique seu e-mail para confirmar o cadastro antes de entrar.", "sucesso");
  } catch (error) {
    console.error(error);
    mostrarMensagem("Ocorreu um erro inesperado. Tente novamente.", "erro");
  } finally {
    setLoading(false);
  }
});