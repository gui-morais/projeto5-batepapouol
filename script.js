let nomeDoUsuario = {name:""};

function nomeUsuario (botao) {
    const nome = document.querySelector(".nomeUsuario");
    const loading = document.querySelector(".loading");
    const entrando = document.querySelector(".entrando");
    const alerta = document.querySelector(".erroNome");

    nomeDoUsuario.name = nome.value;
    const promise = axios.post("https://mock-api.driven.com.br/api/v6/uol/participants", nomeDoUsuario);

    nome.classList.add("escondido");
    botao.classList.add("escondido");
    loading.classList.remove("escondido");
    entrando.classList.remove("escondido");
    if(!alerta.classList.contains("escondido")) {
        alerta.classList.add("escondido");
    }

    promise.then(sucessoNome);
    promise.catch(erroNome);
}

function sucessoNome() {
    enviaStatus;
    setInterval(enviaStatus,5000);

    carregaMensagens();
    setInterval(carregaMensagens,3000);

    carregaParticipantes();
    setInterval(carregaParticipantes,10000);
}

function enviaStatus() {
    const promise = axios.post("https://mock-api.driven.com.br/api/v6/uol/status", nomeDoUsuario);
    promise.catch(() => window.location.reload());
}

function carregaMensagens () {
    const promise = axios.get("https://mock-api.driven.com.br/api/v6/uol/messages");
    promise.then(renderizaMensagens);
    promise.catch(() => window.location.reload());
}

function renderizaMensagens (resposta) {
    const mensagens = resposta.data;
    const pagina = document.querySelector(".pagina-inicial");
    if(!pagina.classList.contains("escondido")) {
        pagina.classList.add("escondido");
    }
    const conversas = document.querySelector(".conversas");
    conversas.innerHTML = '';
    for(let i=0;i<mensagens.length-1;i++) {
        if(mensagens[i].type === "status") {
            conversas.innerHTML += `
                <div class="mensagem ${mensagens[i].type}">
                    <span class="horario">(${mensagens[i].time}) </span>
                    <span><b>${mensagens[i].from}</b> ${mensagens[i].text}</span>
                </div>`;
        } else if(mensagens[i].type === "message"){
            conversas.innerHTML += `
                <div class="mensagem ${mensagens[i].type}">
                    <span class="horario">(${mensagens[i].time}) </span>
                    <span><b>${mensagens[i].from}</b> para <b>${mensagens[i].to}</b>: ${mensagens[i].text}</span>
                </div>`;
        } else if(mensagens[i].type === "private_message") {
            if(mensagens[i].from === nomeDoUsuario.name || mensagens[i].to === nomeDoUsuario.name || mensagens[i].to === "Todos") {
                conversas.innerHTML += `
                    <div class="mensagem ${mensagens[i].type}">
                        <span class="horario">(${mensagens[i].time}) </span>
                        <span><b>${mensagens[i].from}</b> reservadamente para <b>${mensagens[i].to}</b>: ${mensagens[i].text}</span>
                    </div>`;
            }
        }
    }
    const elementoQueQueroQueApareca = conversas.querySelectorAll('.mensagem');
    elementoQueQueroQueApareca[elementoQueQueroQueApareca.length-1].scrollIntoView();
}

function carregaParticipantes() {
    const promise = axios.get("https://mock-api.driven.com.br/api/v6/uol/participants");
    promise.then(renderizaParticipantes);
}

function renderizaParticipantes(resposta) {
    const participantes = resposta.data;
    const bloco = document.querySelector(".contatos");
    const usuarioAntigo = acharSelecionado(bloco);
    let nome = null;
    if(usuarioAntigo!==null) {
        const nomeAntigo = usuarioAntigo.querySelector(".nome");
        let nome=null;
        for(let i=0;i<participantes.length && nome===null;i++) {
            if(participantes[i].name===nomeAntigo.innerHTML) {
                nome=participantes[i].name;
            }
        }
    }

    if(nome===null) {
        const publico = document.querySelector(".publico");
        trocarDestinatario(publico);

        bloco.innerHTML = `
            <div class="contato" data-identifier="participant">
                <div onclick="trocarDestinatario(this)">
                    <ion-icon name="people"></ion-icon>
                    <span class="nome">Todos</span>
                </div>
                <ion-icon name="checkmark" class="checkmark"></ion-icon>
            </div>`;
    } else {
        bloco.innerHTML = `
            <div class="contato" data-identifier="participant">
                <div onclick="trocarDestinatario(this)">
                    <ion-icon name="people"></ion-icon>
                    <span class="nome">Todos</span>
                </div>
                <ion-icon name="checkmark" class="checkmark escondido"></ion-icon>
            </div>`;
    }
    bloco.innerHTML += `
        <div class="contato" data-identifier="participant">
            <div>
                <ion-icon name="person-circle"></ion-icon>
                <span class="nome"><b>Você</b></span>
            </div>
            <ion-icon name="checkmark" class="checkmark escondido"></ion-icon>
        </div>
        `;

    for(let i=0;i<participantes.length;i++) {
        if(participantes[i].name!==nomeDoUsuario.name) {
            if(participantes[i].name===nome) {
                bloco.innerHTML += `
                    <div class="contato" data-identifier="participant">
                    <div onclick="trocarDestinatario(this)">
                        <ion-icon name="person-circle"></ion-icon>
                        <span class="nome">${participantes[i].name}</span>
                    </div>
                    <ion-icon name="checkmark" class="checkmark"></ion-icon>
                </div>`;
            } else {
                bloco.innerHTML += `
                    <div class="contato" data-identifier="participant">
                    <div onclick="trocarDestinatario(this)">
                        <ion-icon name="person-circle"></ion-icon>
                        <span class="nome">${participantes[i].name}</span>
                    </div>
                    <ion-icon name="checkmark" class="checkmark escondido"></ion-icon>
                </div>`;
            }
        }
    }

    textoDirecionado();
}

function erroNome() {
    const nome = document.querySelector(".nomeUsuario");
    const botao = document.querySelector(".botaoEntrar");
    const loading = document.querySelector(".loading");
    const entrando = document.querySelector(".entrando");
    const alerta = document.querySelector(".erroNome");

    nome.classList.remove("escondido");
    botao.classList.remove("escondido");
    alerta.classList.remove("escondido");
    loading.classList.add("escondido");
    entrando.classList.add("escondido");
}

function enviarMensagem() {
    const barraTexto = document.querySelector("textarea");
    const usuarioEscolhido = acharSelecionado(document.querySelector(".contatos"));
    const modoEscolhido = acharSelecionado(document.querySelector(".modoDeEnvio"));
    const nomeUsuario = usuarioEscolhido.querySelector(".nome");
    const nomeModo = modoEscolhido.querySelector(".nome");
    let modo;
    if(nomeModo.innerHTML==="Reservadamente") {
        modo = "private_message";
    } else {
        modo = "message";
    }

    const mensagem = {
        from:nomeDoUsuario.name,
        to:nomeUsuario.innerHTML,
        text:barraTexto.value,
        type:modo
    }

    const promise = axios.post("https://mock-api.driven.com.br/api/v6/uol/messages",mensagem);
    promise.then(carregaMensagens);
    promise.catch(() => window.location.reload());
    barraTexto.value = "";
}

function trocarDestinatario(clicado) {
    const usuarioEscolhido = clicado.parentNode;
    const iconeEscolhido = usuarioEscolhido.querySelector(".escondido");
    
    if(iconeEscolhido!==null) {
        const participantes = usuarioEscolhido.parentNode;
        const usuarioAntigo = acharSelecionado(participantes);

        const icone = usuarioAntigo.querySelector(".checkmark");
        icone.classList.add("escondido");
        iconeEscolhido.classList.remove("escondido");
    }
    nome = clicado.querySelector(".nome");
    if(nome.innerHTML==="Todos") {
        const publico = document.querySelector(".publico");
        trocarDestinatario(publico);
    }
    textoDirecionado();
}

function textoDirecionado() {
    const usuarioEscolhido = acharSelecionado(document.querySelector(".contatos"));
    const modoEscolhido = acharSelecionado(document.querySelector(".modoDeEnvio"));
    const nomeUsuario = usuarioEscolhido.querySelector(".nome");
    const nomeModo = modoEscolhido.querySelector(".nome");

    const texto = document.querySelector(".texto-direcionado");
    if(nomeModo.innerHTML === "Reservadamente") {
        texto.innerHTML = `Enviando para ${nomeUsuario.innerHTML} (reservadamente)`;
    } else {
        texto.innerHTML = `Enviando para ${nomeUsuario.innerHTML}`;
    }
}

function trocarModo(clicado) {
    const usuarioEscolhido = acharSelecionado(document.querySelector(".contatos"))
    const nomeUsuario = usuarioEscolhido.querySelector(".nome");
    const nomeModo = clicado.querySelector(".nome");
    if(nomeModo.innerHTML==="Reservadamente") {
        if(nomeUsuario.innerHTML!=="Todos") {
            trocarDestinatario(clicado);
        }
    } else {
        trocarDestinatario(clicado);
    }
}

function acharSelecionado(grupo) {
    const usuarios = grupo.querySelectorAll(".contato");
    let usuarioEscolhido=null;

    for(let i=0;i<usuarios.length && usuarioEscolhido===null;i++) {
        if(usuarios[i].querySelector(".escondido")===null) {
            usuarioEscolhido = usuarios[i];
        }
    }
    return usuarioEscolhido;
}

function sidebar() {
    const sidebar = document.querySelector(".sidebar");
    const auxiliar = document.querySelector(".auxiliar");
    sidebar.classList.toggle("escondido");
    auxiliar.classList.toggle("escondido");
}