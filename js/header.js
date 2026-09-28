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

window.addEventListener("scroll", () => {
    if (!siteHeader) return;

    if (window.scrollY > 40) {
        siteHeader.classList.add("scrolled");
    } else {
        siteHeader.classList.remove("scrolled");
    }
});