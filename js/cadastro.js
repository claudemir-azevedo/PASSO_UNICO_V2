const client = window.supabaseClient;
const btnCadastrar = document.getElementById("btnCadastrar");
const statusCadastro = document.getElementById("statusCadastro");
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function mostrarStatus(mensagem, tipo) {
  if (!statusCadastro) return;
  statusCadastro.innerText = mensagem;
  statusCadastro.className = `status-box ${tipo}`;
}

function setLoading(loading) {
  if (!btnCadastrar) return;
  btnCadastrar.disabled = loading;
  btnCadastrar.innerText = loading ? "Cadastrando..." : "Cadastrar Calçado";
}

function validarDados(dados, foto) {
  if (Object.values(dados).some((valor) => !valor && valor !== "descricao")) {
    return "Preencha todos os campos obrigatórios.";
  }

  const numero = Number(dados.numero);
  if (!Number.isInteger(numero) || numero < 1 || numero > 60) {
    return "Informe um número de calçado válido.";
  }

  if (!/^[A-Za-z]{2}$/.test(dados.estado)) {
    return "Informe a UF com duas letras.";
  }

  if (foto) {
    if (!IMAGE_TYPES.has(foto.type)) {
      return "Envie uma imagem em JPG, PNG ou WebP.";
    }
    if (foto.size > MAX_IMAGE_SIZE) {
      return "A imagem deve ter no máximo 5 MB.";
    }
  }

  return null;
}

btnCadastrar?.addEventListener("click", async () => {
  const dados = {
    tipo: document.getElementById("tipo")?.value.trim(),
    numero: document.getElementById("numero")?.value.trim(),
    cidade: document.getElementById("cidade")?.value.trim(),
    estado: document.getElementById("estado")?.value.trim().toUpperCase(),
    pe: document.getElementById("pe")?.value.trim(),
    condicao: document.getElementById("condicao")?.value.trim(),
    objetivo: document.getElementById("objetivo")?.value.trim(),
    descricao: document.getElementById("descricao")?.value.trim() || ""
  };
  const foto = document.getElementById("fotoCalcado")?.files[0];
  const erroValidacao = validarDados(dados, foto);

  if (erroValidacao) {
    mostrarStatus(erroValidacao, "erro");
    return;
  }

  setLoading(true);

  try {
    const { data: { session }, error: sessionError } = await client.auth.getSession();

    if (sessionError || !session) {
      mostrarStatus("Faça login para cadastrar um calçado.", "erro");
      return;
    }

    let fotoUrl = null;

    if (foto) {
      const extensao = foto.name.split(".").pop().toLowerCase();
      const identificador = window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const nomeArquivo = `${session.user.id}/${identificador}.${extensao}`;

      const { error: uploadError } = await client.storage
        .from("calcados")
        .upload(nomeArquivo, foto, { contentType: foto.type, upsert: false });

      if (uploadError) {
        console.error(uploadError);
        mostrarStatus("Não foi possível enviar a imagem. Tente novamente.", "erro");
        return;
      }

      const { data: publicUrlData } = client.storage
        .from("calcados")
        .getPublicUrl(nomeArquivo);

      fotoUrl = publicUrlData?.publicUrl || null;
    }

    const { error } = await client.from("calcados").insert([{
      usuario_id: session.user.id,
      ...dados,
      numero: Number(dados.numero),
      foto_url: fotoUrl,
      status: "disponivel"
    }]);

    if (error) {
      console.error(error);
      mostrarStatus("Não foi possível cadastrar o calçado. Tente novamente.", "erro");
      return;
    }

    mostrarStatus("Calçado cadastrado com sucesso.", "sucesso");
    mostrarToast("Cadastro realizado com sucesso.", "sucesso");
    window.setTimeout(() => { window.location.href = "painel-colaborador.html"; }, 900);
  } catch (error) {
    console.error(error);
    mostrarStatus("Ocorreu um erro inesperado. Tente novamente.", "erro");
  } finally {
    setLoading(false);
  }
});