/* ========================================
UTILIDADES
======================================== */

function esc(valor){

    return String(valor ?? "")
        .replace(/&/g,"&amp;")
        .replace(/</g,"&lt;")
        .replace(/>/g,"&gt;")
        .replace(/"/g,"&quot;")
        .replace(/'/g,"&#39;");

}

const ROTULO_STATUS = {
    disponivel: "Disponível",
    entregue: "Entregue",
    nova: "Nova",
    contato: "Em contato",
    aprovada: "Aprovada",
    recusada: "Recusada"
};

function etiquetaStatus(status){

    const chave = String(status || "").toLowerCase();

    const rotulo = ROTULO_STATUS[chave] || (status || "-");

    return `<span class="status ${esc(chave)}">${esc(rotulo)}</span>`;

}

/* ========================================
AGUARDAR SUPABASE
======================================== */

async function iniciarPainel(){

/* ESPERA SUPABASE */

while(!window.supabaseClient){

await new Promise(resolve=>
setTimeout(resolve,100)
);

}
const supabase =
window.supabaseClient;

const {
    data: authData,
    error: authError
} = await supabase.auth.getUser();

if (authError || !authData.user) {

    window.location.href = "login.html";

    return;

}



/* ========================================
ELEMENTOS
======================================== */

const totalCalcados =
document.getElementById(
"totalCalcados"
);

const totalDisponiveis =
document.getElementById(
"totalDisponiveis"
);

const totalEntregues =
document.getElementById(
"totalEntregues"
);

const totalUsuarios =
document.getElementById(
"totalUsuarios"
);

const tabelaCalcados =
document.getElementById(
"tabelaCalcados"
);


/* ========================================
BUSCAR CALÇADOS
======================================== */

const {
data: calcados,
error: erroCalcados
} =
await supabase
.from("calcados")
.select(`
*,
usuarios(*)
`);






/* ========================================
BUSCAR USUÁRIOS
======================================== */

const {
data: usuarios,
error: erroUsuarios
} =
await supabase
.from("usuarios")
.select("*");

const usuarioAtual =
usuarios.find(
u => u.id === authData.user.id
);

if (!usuarioAtual) {

    window.location.href = "login.html";

    return;

}

if (usuarioAtual.tipo_usuario !== "admin") {

    window.location.href =
    "painel-colaborador.html";

    return;

}










/* ========================================
VALIDA ERROS
======================================== */

if(erroCalcados){

console.error(
erroCalcados
);

return;

}

if(erroUsuarios){

console.error(
erroUsuarios
);

return;

}


/* ========================================
MÉTRICAS
======================================== */

const total =
calcados?.length || 0;

const disponiveis =
calcados?.filter(item=>
item.status === "disponivel"
).length || 0;

const entregues =
calcados?.filter(item=>
item.status === "entregue"
).length || 0;

const usuariosTotal =
usuarios?.length || 0;


/* ========================================
ATUALIZA CARDS
======================================== */

if(totalCalcados){

totalCalcados.innerText =
total;

}

if(totalDisponiveis){

totalDisponiveis.innerText =
disponiveis;

}

if(totalEntregues){

totalEntregues.innerText =
entregues;

}

if(totalUsuarios){

totalUsuarios.innerText =
usuariosTotal;

}

/* PROPOSTAS DE PARCERIA */
await carregarSolicitacoes(supabase);



/* ========================================
VALIDA TABELA
======================================== */

if(!tabelaCalcados){

return;

}


/* ========================================
LIMPA TABELA
======================================== */

tabelaCalcados.innerHTML = "";


/* ========================================
SEM CALÇADOS
======================================== */

if(total === 0){

tabelaCalcados.innerHTML = `

<tr>

<td colspan="7">

Nenhum item cadastrado.

</td>

</tr>

`;

return;

}


/* ========================================
MONTA TABELA
======================================== */

const mapaUsuarios = {};

usuarios.forEach(usuario => {

    mapaUsuarios[usuario.id] =
    usuario.nome;

});

/* DISPONIBILIZA OS CALÇADOS GLOBALMENTE */
window.calcadosPainel = calcados;

calcados.forEach((item,index)=>{

tabelaCalcados.innerHTML += `

<tr>

<td>${esc(item.tipo) || "-"}</td>

<td>${esc(item.numero) || "-"}</td>

<td>${esc(item.cidade) || "-"}</td>

<td>${esc(item.estado) || "-"}</td>

<td>${etiquetaStatus(item.status)}</td>

<td><strong>${esc(mapaUsuarios[item.usuario_id]) || "-"}</strong></td>

<td>

<button
type="button"
class="btn-tabela"
onclick="abrirDetalhesCalcado(window.calcadosPainel[${index}])">

Ver

</button>

</td>

</tr>

`;

});


}


/* ========================================
PROPOSTAS DE PARCERIA
======================================== */

function fmtData(iso){
    if(!iso) return "-";
    const d = new Date(iso);
    return isNaN(d) ? "-" : d.toLocaleDateString("pt-BR") + " " +
        d.toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"});
}

function renderSolicitacoes(){

    const tbody = document.getElementById("tabelaSolicitacoes");
    const lista = window.solicitacoesPainel || [];

    if(!tbody) return;

    const novas = lista.filter(s => s.status === "nova").length;

    const cardTotal = document.getElementById("totalParcerias");
    if(cardTotal) cardTotal.innerText = novas;

    const badge = document.getElementById("badgeSolicitacoes");
    if(badge) badge.innerText = novas ? novas + "\u00a0nova" + (novas>1?"s":"") : lista.length + " no total";

    if(lista.length === 0){
        tbody.innerHTML = '<tr><td colspan="7">Nenhuma proposta recebida ainda.</td></tr>';
        return;
    }

    tbody.innerHTML = lista.map((s,i)=>`
<tr>
<td>${esc(fmtData(s.created_at))}</td>
<td><strong>${esc(s.organizacao)}</strong><br><small>${esc(s.tipo_organizacao)}</small></td>
<td>${esc(s.cidade)}/${esc(s.estado)}</td>
<td>${esc(s.responsavel)}</td>
<td>${esc((s.tipos_parceria||[]).join(", "))}</td>
<td>${etiquetaStatus(s.status)}</td>
<td><button type="button" class="btn-tabela" onclick="abrirSolicitacao(${i})">Ver</button></td>
</tr>`).join("");

}

async function carregarSolicitacoes(supabase){

    const secao = document.getElementById("secaoSolicitacoes");

    try{

        const { data, error } = await supabase
            .from("solicitacoes_parceria")
            .select("*")
            .order("created_at",{ascending:false});

        if(error) throw error;

        window.solicitacoesPainel = data || [];
        window.supabasePainel = supabase;

        renderSolicitacoes();

    }catch(e){

        if(secao) secao.style.display = "none";

    }

}

function abrirSolicitacao(index){

    const s = (window.solicitacoesPainel || [])[index];
    if(!s) return;

    const tel = String(s.telefone||"").replace(/\D/g,"");
    const wa = tel ? "https://wa.me/" + (tel.startsWith("55") && tel.length > 11 ? tel : "55"+tel) : "";

    let siteHref = "";
    const siteTxt = String(s.site||"").trim();
    if(siteTxt){
        if(/^@/.test(siteTxt)) siteHref = "https://instagram.com/" + encodeURIComponent(siteTxt.slice(1));
        else if(/^https?:\/\//i.test(siteTxt)) siteHref = siteTxt;
        else siteHref = "https://" + siteTxt;
    }

    const linha = (rotulo,html)=>`<div class="sol-linha"><span>${rotulo}</span><div>${html}</div></div>`;

    const opcoes = ["nova","contato","aprovada","recusada"].map(v=>
        `<option value="${v}" ${s.status===v?"selected":""}>${ROTULO_STATUS[v]||v}</option>`).join("");

    abrirModal(`
<button type="button" class="modal-fechar" onclick="fecharModal()">×</button>
<div class="sol-modal">
<h1 class="modal-titulo">${esc(s.organizacao)}</h1>
<div class="sol-sub">${esc(s.tipo_organizacao)} · recebida em ${esc(fmtData(s.created_at))}</div>
${linha("Cidade", esc(s.cidade)+" / "+esc(s.estado))}
${s.cnpj ? linha("CNPJ", esc(s.cnpj)) : ""}
${siteHref ? linha("Site", `<a href="${esc(siteHref)}" target="_blank" rel="noopener noreferrer">${esc(siteTxt)}</a>`) : ""}
${linha("Responsável", esc(s.responsavel)+(s.cargo?" — "+esc(s.cargo):""))}
${linha("E-mail", `<a href="mailto:${esc(s.email)}">${esc(s.email)}</a>`)}
${linha("Telefone", esc(s.telefone))}
${linha("Quer colaborar com", esc((s.tipos_parceria||[]).join(", ")))}
${s.mensagem ? linha("Mensagem", `<div class="sol-texto">${esc(s.mensagem)}</div>`) : ""}
${s.como_conheceu ? linha("Como conheceu", esc(s.como_conheceu)) : ""}
<div class="sol-acoes">
${wa ? `<a class="modal-whatsapp" href="${esc(wa)}" target="_blank" rel="noopener noreferrer">Chamar no WhatsApp</a>` : ""}
</div>
<div class="sol-gestao">
<label for="solStatus">Status</label>
<select id="solStatus">${opcoes}</select>
<label for="solObs">Observações internas</label>
<textarea id="solObs" rows="4" maxlength="2000">${esc(s.observacoes_admin||"")}</textarea>
<button type="button" class="btn-tabela" id="solSalvar" onclick="salvarSolicitacao(${index})">Salvar</button>
</div>
</div>`);

}

async function salvarSolicitacao(index){

    const s = window.solicitacoesPainel[index];
    const btn = document.getElementById("solSalvar");
    const status = document.getElementById("solStatus").value;
    const obs = document.getElementById("solObs").value.trim();

    btn.disabled = true;
    btn.textContent = "Salvando...";

    const { data, error } = await window.supabasePainel
        .from("solicitacoes_parceria")
        .update({ status, observacoes_admin: obs || null, updated_at: new Date().toISOString() })
        .eq("id", s.id)
        .select();

    btn.disabled = false;
    btn.textContent = "Salvar";

    if(error || !data || data.length === 0){
        mostrarToast("Não foi possível salvar. Verifique se você está logado como administrador.","erro");
        return;
    }

    window.solicitacoesPainel[index] = data[0];
    renderSolicitacoes();
    fecharModal();
    mostrarToast("Proposta atualizada.","sucesso");

}


/* ========================================
INIT
======================================== */

document.addEventListener(
"DOMContentLoaded",
()=>{

iniciarPainel();

}
);