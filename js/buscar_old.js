const listaCalcados = document.getElementById('lista-calcados');
const contadorResultados = document.getElementById('contadorResultados');
const formBusca = document.getElementById('formBusca');

const calcadosMock = [
{
tipo:'Tênis',
numero:38,
cidade:'Belo Horizonte',
estado:'MG',
telefone:'31999999999',
foto_url:'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop'
},
{
tipo:'Bota',
numero:40,
cidade:'São Paulo',
estado:'SP',
telefone:'11999999999',
foto_url:'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?q=80&w=1200&auto=format&fit=crop'
},
{
tipo:'Sandália',
numero:36,
cidade:'Rio de Janeiro',
estado:'RJ',
telefone:'21999999999',
foto_url:''
}
];

function renderizarCalcados(lista){

if(!lista.length){

listaCalcados.innerHTML = `
<div class="sem-resultado">
<h3>Nenhum resultado encontrado</h3>
<p>Tente alterar os filtros da busca.</p>
</div>
`;

contadorResultados.innerText = '0 pares encontrados';

return;
}

contadorResultados.innerText =
`${lista.length} pares encontrados`;

listaCalcados.innerHTML = '';

lista.forEach(item=>{

const whatsapp =
`https://wa.me/55${item.telefone}`;

listaCalcados.innerHTML += `

<div class="calcado-card">

<div class="calcado-imagem">

${item.foto_url
? `<img src="${item.foto_url}" alt="${item.tipo}">`
: `<div class="sem-imagem">Sem imagem</div>`}

<span class="status-badge">
Disponível
</span>

</div>

<div class="calcado-conteudo">

<div class="calcado-tag">
${item.tipo}
</div>

<h3>
${item.tipo} • Nº ${item.numero}
</h3>

<div class="calcado-info">

<p class="localizacao">
📍 ${item.cidade} - ${item.estado}
</p>

</div>

<a
href="${whatsapp}"
target="_blank"
class="btn-whatsapp">
Entrar em contato
</a>

</div>

</div>

`;
});

}

function buscarCalcados(event){

if(event){
event.preventDefault();
}

const cidade =
document.getElementById('cidade').value.toLowerCase();

const numero =
document.getElementById('numero').value;

const tipo =
document.getElementById('tipo').value;

const filtrados = calcadosMock.filter(item=>{

const cidadeOk =
!cidade ||
item.cidade.toLowerCase().includes(cidade);

const numeroOk =
!numero ||
String(item.numero) === numero;

const tipoOk =
!tipo ||
item.tipo === tipo;

return cidadeOk && numeroOk && tipoOk;

});

renderizarCalcados(filtrados);

}

formBusca.addEventListener(
'submit',
buscarCalcados
);

renderizarCalcados(calcadosMock);