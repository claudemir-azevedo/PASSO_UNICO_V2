/* ========================================
HEADER DINÂMICO
======================================== */

const header = document.getElementById("header-dinamico");

const paginaAtualHeader = window.paginaAtual || "";

if (header) {
    header.innerHTML = `
<header class="header">
    <div class="navbar">

        <a href="index.html" class="logo">
            <img src="assets/img/logo.png" alt="PASSO ÚNICO">
        </a>

        <nav class="nav-links">
            <a href="index.html" class="${paginaAtualHeader === "index" ? "active" : ""}">Início</a>
            <a href="buscar.html" class="${paginaAtualHeader === "buscar" ? "active" : ""}">Buscar</a>
            <a href="parceiros.html" class="${paginaAtualHeader === "parceiros" ? "active" : ""}">Parceiros</a>
            <a href="sobre.html" class="${paginaAtualHeader === "sobre" ? "active" : ""}">Sobre</a>

            <div class="nav-dropdown">
                <button type="button" class="nav-dropdown-toggle">
                    Projeto
                    <svg viewBox="0 0 12 8" width="10" height="7" fill="none" aria-hidden="true"><path d="M1 1l5 5 5-5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </button>

                <div class="nav-dropdown-menu">
                    <a href="inclusao-social.html">Inclusão Social</a>
                    <a href="sustentabilidade.html">Sustentabilidade</a>
                    <a href="transparencia.html">Transparência</a>
                    <a href="impacto-social.html">Impacto Social</a>
                </div>
            </div>
        </nav>

        <div class="nav-actions">
            <a href="login.html" class="btn-login">Entrar</a>
            <a href="colaborar.html" class="btn-primary">Quero Colaborar</a>
        </div>

    </div>
</header>
`;
}

const siteHeader = document.querySelector(".header");

const dropdownToggle = document.querySelector(".nav-dropdown-toggle");
const dropdown = document.querySelector(".nav-dropdown");

if (dropdownToggle && dropdown) {

    dropdownToggle.addEventListener("click", (evento) => {
        evento.stopPropagation();
        dropdown.classList.toggle("open");
    });

    document.addEventListener("click", (evento) => {
        if (!dropdown.contains(evento.target)) {
            dropdown.classList.remove("open");
        }
    });

}

window.addEventListener("scroll", () => {
    if (!siteHeader) return;

    if (window.scrollY > 40) {
        siteHeader.classList.add("scrolled");
    } else {
        siteHeader.classList.remove("scrolled");
    }
});