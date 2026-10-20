/* ==========================================================
   CARROSSEL DO CABEÇALHO (Início, Buscar e Sobre)

   PARA TROCAR AS IMAGENS: edite apenas a lista SLIDES abaixo.
   - img:  arquivo dentro de assets/img (1920x900, até ~200 KB)
   - alt:  descrição curta da imagem
   - href: (opcional) link do botão do slide
   - rotulo: (opcional) texto do botão do slide
   Imagens que não existirem na pasta são ignoradas sozinhas.
========================================================== */

(function () {

    const SLIDES = [
        { img: "assets/img/protese-banner.jpg",
          alt: "Pessoa caminhando ao pôr do sol com uma muleta" },
        { img: "assets/img/carrossel-muletas.jpg",
          alt: "Mãos entregando um par de muletas",
          href: "buscar.html?categoria=muleta", rotulo: "Ver muletas" },
        { img: "assets/img/carrossel-cadeira.jpg",
          alt: "Cadeira de rodas em uma calçada ensolarada",
          href: "buscar.html?categoria=cadeira_de_rodas", rotulo: "Ver cadeiras de rodas" },
        { img: "assets/img/carrossel-calcados.jpg",
          alt: "Calçados organizados para doação",
          href: "buscar.html?categoria=calcado", rotulo: "Ver calçados" }
    ];

    const INTERVALO = 6000;

    function carregar(slide) {
        return new Promise(resolve => {
            const im = new Image();
            im.onload = () => resolve(slide);
            im.onerror = () => resolve(null);
            im.src = slide.img;
        });
    }

    function iniciar() {

        const hero = document.querySelector(".hero-home, .buscar-hero, .about-hero");
        if (!hero) return;

        const movimentoReduzido =
            window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        /* o primeiro slide aparece logo; os demais só se existirem */
        carregar(SLIDES[0]).then(primeiro => {

            const lista = [primeiro || SLIDES[0]];

            Promise.all(SLIDES.slice(1).map(carregar)).then(demais => {

                demais.forEach(s => { if (s) lista.push(s); });

                montar(hero, lista, movimentoReduzido);

            });

        });

    }

    function montar(hero, lista, movimentoReduzido) {

        const caixa = document.createElement("div");
        caixa.className = "hero-carrossel";
        caixa.setAttribute("role", "region");
        caixa.setAttribute("aria-roledescription", "carrossel");
        caixa.setAttribute("aria-label", "Imagens do PASSO ÚNICO");

        const slides = lista.map((s, i) => {
            const d = document.createElement("div");
            d.className = "hero-slide" + (i === 0 ? " ativo" : "");
            d.style.backgroundImage = "url('" + s.img + "')";
            d.setAttribute("role", "img");
            d.setAttribute("aria-label", s.alt || "");
            if (i !== 0) d.setAttribute("aria-hidden", "true");
            caixa.appendChild(d);
            return d;
        });

        const sombra = document.createElement("div");
        sombra.className = "hero-carrossel-sombra";
        caixa.appendChild(sombra);

        hero.insertBefore(caixa, hero.firstChild);

        if (lista.length < 2) return;

        const controles = document.createElement("div");
        controles.className = "hero-controles";

        const link = document.createElement("a");
        link.className = "hero-slide-link";
        controles.appendChild(link);

        const pontos = document.createElement("div");
        pontos.className = "hero-pontos";

        const botoes = lista.map((s, i) => {
            const b = document.createElement("button");
            b.type = "button";
            b.setAttribute("aria-label", "Ir para a imagem " + (i + 1));
            b.addEventListener("click", () => { ir(i); reiniciar(); });
            pontos.appendChild(b);
            return b;
        });

        const pausa = document.createElement("button");
        pausa.type = "button";
        pausa.className = "hero-pausa";
        pausa.setAttribute("aria-label", "Pausar troca de imagens");
        pausa.textContent = "❚❚";
        pontos.appendChild(pausa);

        controles.appendChild(pontos);
        hero.appendChild(controles);

        let atual = 0;
        let timer = null;
        let pausado = movimentoReduzido;
        let sobre = false;

        function ir(n) {
            slides[atual].classList.remove("ativo");
            slides[atual].setAttribute("aria-hidden", "true");
            botoes[atual].classList.remove("ativo");
            atual = (n + lista.length) % lista.length;
            slides[atual].classList.add("ativo");
            slides[atual].removeAttribute("aria-hidden");
            botoes[atual].classList.add("ativo");
            const s = lista[atual];
            if (s.href) {
                link.href = s.href;
                link.textContent = (s.rotulo || "Ver itens") + " →";
                link.style.display = "";
            } else {
                link.removeAttribute("href");
                link.style.display = "none";
            }
        }

        function parar() { clearInterval(timer); timer = null; }

        function tocar() {
            parar();
            if (!pausado && !sobre) timer = setInterval(() => ir(atual + 1), INTERVALO);
        }

        function reiniciar() { tocar(); }

        function atualizarPausa() {
            pausa.textContent = pausado ? "▶" : "❚❚";
            pausa.setAttribute("aria-label",
                pausado ? "Retomar troca de imagens" : "Pausar troca de imagens");
        }

        pausa.addEventListener("click", () => {
            pausado = !pausado;
            atualizarPausa();
            tocar();
        });

        hero.addEventListener("mouseenter", () => { sobre = true; tocar(); });
        hero.addEventListener("mouseleave", () => { sobre = false; tocar(); });
        hero.addEventListener("focusin", () => { sobre = true; tocar(); });
        hero.addEventListener("focusout", () => { sobre = false; tocar(); });

        document.addEventListener("visibilitychange", () => {
            if (document.hidden) parar(); else tocar();
        });

        ir(0);
        atualizarPausa();
        tocar();

    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", iniciar);
    } else {
        iniciar();
    }

})();
