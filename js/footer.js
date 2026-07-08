/* ========================================
FOOTER DINÂMICO
======================================== */

const footer =
document.getElementById(
'footer-dinamico'
);

if(footer){

    fetch('footer.html')

    .then(response => response.text())

    .then(data => {

        footer.innerHTML = data;

    })

    .catch(error => {

        console.error(
        'Erro ao carregar footer:',
        error
        );

    });

}