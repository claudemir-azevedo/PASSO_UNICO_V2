/* ========================================
SLIDER HERO
======================================== */

const slides =
document.querySelectorAll(
'.hero-slide'
);

let slideAtual = 0;


/* ========================================
AUTO SLIDE
======================================== */

function trocarSlide(){

slides.forEach(slide=>{

slide.classList.remove(
'active'
);

});

slideAtual++;

if(
slideAtual >= slides.length
){

slideAtual = 0;

}

slides[slideAtual]
.classList.add(
'active'
);

}


/* ========================================
INTERVAL
======================================== */

if(slides.length > 0){

setInterval(
trocarSlide,
5000
);

}


/* ========================================
INIT
======================================== */

console.log(
'INICIO OK'
);