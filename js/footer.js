/* ========================================
FOOTER DINÂMICO
======================================== */

const footer =
document.getElementById(
'footer-dinamico'
);

if (footer) {

    fetch('footer.html')

    .then(response => {

        if (!response.ok) {

            throw new Error(
                `Erro ${response.status}`
            );

        }

        return response.text();

    })

    .then(data => {

        footer.innerHTML = data;

    })

    .catch(error => {

        console.error(
            'Erro ao carregar footer:',
            error
        );

        footer.innerHTML = `
            <footer class="footer-erro">
                Não foi possível carregar o rodapé.
            </footer>
        `;

    });

}