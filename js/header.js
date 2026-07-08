/* ========================================
HEADER DINÂMICO
======================================== */

const header =
document.getElementById(
'header-dinamico'
);

/* ========================================
RENDER
======================================== */

if(header){

header.innerHTML = `

<header class="header">

<div class="navbar">

<!-- LOGO -->

<a
href="index.html"
class="logo">

<img
src="assets/img/logo.png"
alt="PASSO ÚNICO">

</a>

<!-- MENU -->

<nav class="nav-links">

<a
href="index.html"
class="${
paginaAtual === 'index'
? 'active'
: ''
}">
Início
</a>

<a
href="buscar.html"
class="${
paginaAtual === 'buscar'
? 'active'
: ''
}">
Buscar
</a>

<a
href="parceiros.html"
class="${
paginaAtual === 'parceiros'
? 'active'
: ''
}">
Parceiros
</a>

<a
href="sobre.html"
class="${
paginaAtual === 'sobre'
? 'active'
: ''
}">
Sobre
</a>

</nav>

<!-- BOTÕES -->

<div class="nav-actions">

<a
href="login.html"
class="btn-login">
Entrar
</a>

<a
href="colaborar.html"
class="btn-primary">
Quero Colaborar
</a>

</div>

</div>

</header>

`;

}

/* ========================================
SCROLL EFFECT
======================================== */

window.addEventListener(
'scroll',
()=>{

const siteHeader =
document.querySelector(
'.header'
);

if(!siteHeader) return;

if(window.scrollY > 40){

siteHeader.classList.add(
'scrolled'
);

}else{

siteHeader.classList.remove(
'scrolled'
);

}

}
);