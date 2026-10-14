/* ==========================================================
   PASSO ÚNICO
   parceria.js

   Formulário de proposta de parceria (sem login).
   Grava em public.solicitacoes_parceria; o admin acompanha
   as propostas no painel administrativo.
========================================================== */

(function () {

    const client = window.supabaseClient;

    const form = document.getElementById("formParceria");
    const cardFormulario = document.getElementById("cardFormulario");
    const cardSucesso = document.getElementById("cardSucesso");
    const erroForm = document.getElementById("erroForm");
    const btnEnviar = document.getElementById("btnEnviar");

    if (!form) return;

    const $ = (id) => document.getElementById(id);

    /* ---------- máscaras ---------- */

    $("cnpj").addEventListener("input", (e) => {

        let d = e.target.value.replace(/\D/g, "").slice(0, 14);

        d = d.replace(/^(\d{2})(\d)/, "$1.$2")
             .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
             .replace(/\.(\d{3})(\d)/, ".$1/$2")
             .replace(/(\d{4})(\d)/, "$1-$2");

        e.target.value = d;

    });

    $("telefone").addEventListener("input", (e) => {

        let d = e.target.value.replace(/\D/g, "").slice(0, 11);

        if (d.length > 10) {
            d = d.replace(/^(\d{2})(\d{5})(\d{0,4}).*/, "($1) $2-$3");
        } else if (d.length > 6) {
            d = d.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, "($1) $2-$3");
        } else if (d.length > 2) {
            d = d.replace(/^(\d{2})(\d{0,5})/, "($1) $2");
        }

        e.target.value = d;

    });

    $("mensagem").addEventListener("input", (e) => {

        $("contador").textContent = `${e.target.value.length} / 1500`;

    });

    /* ---------- validações ---------- */

    function cnpjValido(cnpj) {

        if (!/^\d{14}$/.test(cnpj) || /^(\d)\1{13}$/.test(cnpj)) return false;

        const calc = (base) => {

            let soma = 0;
            let peso = base.length - 7;

            for (let i = 0; i < base.length; i++) {
                soma += Number(base[i]) * peso--;
                if (peso < 2) peso = 9;
            }

            const resto = soma % 11;

            return resto < 2 ? 0 : 11 - resto;

        };

        return calc(cnpj.slice(0, 12)) === Number(cnpj[12]) &&
               calc(cnpj.slice(0, 13)) === Number(cnpj[13]);

    }

    function emailValido(email) {

        return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);

    }

    function marcar(id, mensagem) {

        const campo = $(id).closest(".campo");

        campo.classList.add("invalido");

        let aviso = campo.querySelector(".msg-campo");

        if (!aviso) {
            aviso = document.createElement("span");
            aviso.className = "msg-campo";
            campo.appendChild(aviso);
        }

        aviso.textContent = mensagem;

    }

    function limparErros() {

        form.querySelectorAll(".campo.invalido").forEach((c) => c.classList.remove("invalido"));
        form.querySelectorAll(".msg-campo").forEach((m) => m.remove());
        $("opcoesParceria").classList.remove("invalido");

        erroForm.hidden = true;
        erroForm.textContent = "";

    }

    function mostrarErro(texto) {

        erroForm.textContent = texto;
        erroForm.hidden = false;

        erroForm.scrollIntoView({ behavior: "smooth", block: "center" });

    }

    /* ---------- envio ---------- */

    form.addEventListener("submit", async (evento) => {

        evento.preventDefault();

        limparErros();

        /* robôs preenchem o campo isca: finge sucesso e não grava nada */

        if ($("site_confirmacao").value.trim() !== "") {
            cardFormulario.hidden = true;
            cardSucesso.hidden = false;
            return;
        }

        const dados = {
            organizacao: $("organizacao").value.trim(),
            tipo_organizacao: $("tipo_organizacao").value,
            cnpj: $("cnpj").value.replace(/\D/g, ""),
            cidade: $("cidade").value.trim(),
            estado: $("estado").value,
            site: $("site").value.trim(),
            responsavel: $("responsavel").value.trim(),
            cargo: $("cargo").value.trim(),
            email: $("email").value.trim().toLowerCase(),
            telefone: $("telefone").value.trim(),
            tipos_parceria: Array.from(
                form.querySelectorAll('input[name="tipos_parceria"]:checked')
            ).map((c) => c.value),
            mensagem: $("mensagem").value.trim(),
            como_conheceu: $("como_conheceu").value
        };

        let primeiroErro = null;

        const falha = (id, msg) => {
            marcar(id, msg);
            if (!primeiroErro) primeiroErro = id;
        };

        if (dados.organizacao.length < 2) falha("organizacao", "Informe o nome da instituição.");
        if (!dados.tipo_organizacao) falha("tipo_organizacao", "Selecione o tipo de organização.");
        if (dados.cnpj && !cnpjValido(dados.cnpj)) falha("cnpj", "CNPJ inválido. Confira os números ou deixe em branco.");
        if (dados.cidade.length < 2) falha("cidade", "Informe a cidade.");
        if (!dados.estado) falha("estado", "Selecione o estado.");
        if (dados.responsavel.length < 2) falha("responsavel", "Informe o nome do responsável.");
        if (!emailValido(dados.email)) falha("email", "Informe um e-mail válido.");
        if (dados.telefone.replace(/\D/g, "").length < 10) falha("telefone", "Informe um telefone com DDD.");

        if (dados.tipos_parceria.length === 0) {
            $("opcoesParceria").classList.add("invalido");
            if (!primeiroErro) primeiroErro = "opcoesParceria";
            mostrarErro("Marque pelo menos uma forma de colaborar.");
        }

        if (!$("consentimento").checked) {
            mostrarErro("É necessário autorizar o uso dos dados para enviar a proposta.");
            if (!primeiroErro) primeiroErro = "consentimento";
        }

        if (primeiroErro) {

            const alvo = $(primeiroErro);

            if (alvo) alvo.scrollIntoView({ behavior: "smooth", block: "center" });

            if (!erroForm.hidden) return;

            mostrarErro("Revise os campos destacados e tente novamente.");

            return;

        }

        /* grava */

        btnEnviar.disabled = true;
        btnEnviar.textContent = "Enviando...";

        try {

            const registro = {
                organizacao: dados.organizacao,
                tipo_organizacao: dados.tipo_organizacao,
                cnpj: dados.cnpj || null,
                cidade: dados.cidade,
                estado: dados.estado,
                site: dados.site || null,
                responsavel: dados.responsavel,
                cargo: dados.cargo || null,
                email: dados.email,
                telefone: dados.telefone,
                tipos_parceria: dados.tipos_parceria,
                mensagem: dados.mensagem || null,
                como_conheceu: dados.como_conheceu || null,
                consentimento: true
            };

            const { error } = await client
                .from("solicitacoes_parceria")
                .insert(registro);

            if (error) throw error;

            cardFormulario.hidden = true;
            cardSucesso.hidden = false;

            window.scrollTo({ top: 0, behavior: "smooth" });

        } catch (erro) {

            console.error("Erro ao enviar proposta:", erro);

            if (String(erro.message || "").includes("limite_solicitacoes")) {
                mostrarErro("Já recebemos propostas deste e-mail hoje. Aguarde nosso contato ou fale direto pelo WhatsApp (31) 98476-4198.");
            } else {
                mostrarErro("Não foi possível enviar agora. Tente novamente em instantes ou fale direto pelo WhatsApp (31) 98476-4198.");
            }

        } finally {

            btnEnviar.disabled = false;
            btnEnviar.textContent = "Enviar proposta de parceria";

        }

    });

})();
