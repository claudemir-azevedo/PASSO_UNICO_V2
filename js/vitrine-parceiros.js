/* Vitrine pública de parceiros (página Parceiros).
   Mostra só as organizações aprovadas pelo administrador e marcadas para
   exibição (função parceiros_publicos do banco). Sem parceiros, a seção
   continua escondida. */

(async function () {

    const secao = document.getElementById("vitrineParceiros");
    const lista = document.getElementById("vitrineLista");

    if (!secao || !lista) return;

    let tentativas = 0;
    while (!window.supabaseClient && tentativas < 50) {
        await new Promise(r => setTimeout(r, 100));
        tentativas++;
    }
    if (!window.supabaseClient) return;

    try {

        const { data, error } = await window.supabaseClient.rpc("parceiros_publicos");

        if (error || !Array.isArray(data) || data.length === 0) return;

        data.forEach(p => {

            const card = document.createElement("article");
            card.className = "vitrine-card";

            /* logo: só caminhos dentro de assets/img/parceiros */
            const logo = String(p.logo_url || "").trim();
            if (/^assets\/img\/parceiros\/[a-z0-9._-]+\.(png|jpe?g|webp|svg)$/i.test(logo)) {
                const caixa = document.createElement("div");
                caixa.className = "vitrine-logo";
                const img = document.createElement("img");
                img.src = logo;
                img.alt = "Logo de " + (p.organizacao || "parceiro");
                img.loading = "lazy";
                img.addEventListener("error", () => caixa.remove());
                caixa.appendChild(img);
                card.appendChild(caixa);
            }

            const nome = document.createElement("h3");
            nome.textContent = p.organizacao || "";
            card.appendChild(nome);

            const tipo = document.createElement("span");
            tipo.className = "vitrine-tipo";
            tipo.textContent = p.tipo_organizacao || "";
            card.appendChild(tipo);

            const local = document.createElement("p");
            local.className = "vitrine-local";
            local.textContent = [p.cidade, p.estado].filter(Boolean).join(" / ");
            card.appendChild(local);

            if (Array.isArray(p.tipos_parceria) && p.tipos_parceria.length) {
                const apoio = document.createElement("p");
                apoio.className = "vitrine-apoio";
                apoio.textContent = "Colabora com: " + p.tipos_parceria.join(", ");
                card.appendChild(apoio);
            }

            const bruto = String(p.site || "").trim();
            if (bruto && !/^@/.test(bruto)) {
                const href = /^https?:\/\//i.test(bruto) ? bruto : "https://" + bruto;
                let urlOk = false;
                try {
                    const u = new URL(href);
                    urlOk = /^https?:$/.test(u.protocol) &&
                            /^[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$/i.test(u.hostname);
                } catch (e) { urlOk = false; }
                if (urlOk) {
                    const a = document.createElement("a");
                    a.href = href;
                    a.target = "_blank";
                    a.rel = "noopener noreferrer";
                    a.textContent = "Visitar site";
                    card.appendChild(a);
                }
            }

            lista.appendChild(card);

        });

        secao.hidden = false;

    } catch (e) {
        /* sem vitrine: a página segue normal */
    }

})();
