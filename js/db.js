import { openDB } from "idb";

let db;
async function criarDB(){
    try {
        db = await openDB('banco', 1, {
            upgrade(db, oldVersion, newVersion, transaction){
                switch  (oldVersion) {
                    case 0:
                    case 1:
                        const store = db.createObjectStore('localizacao', {
                            keyPath: 'titulo'
                        });
                        store.createIndex('id', 'id');
                        console.log("banco de dados criado!");
                }
            }
        });
        console.log("banco de dados aberto!");
    }catch (e) {
        console.log('Erro ao criar/abrir banco: ' + e.message);
    }
}

window.addEventListener('DOMContentLoaded', async event =>{
    criarDB();
    document.getElementById('btnCadastro').addEventListener('click', adicionarLocalizacao);
    document.getElementById('btnCarregar').addEventListener('click', buscarTodasLocalizacoes);
    document.getElementById('btnRemover').addEventListener('click', removerLocalizacao);
    var mapa = document.getElementById('map');
});


async function buscarTodasLocalizacoes(){
    if(db == undefined){
        console.log("O banco de dados está fechado.");
    }
    const tx = await db.transaction('localizacao', 'readonly');
    const store = await tx.objectStore('localizacao');
    const localizacoes = await store.getAll();
    if(localizacoes){
        const divLista = localizacoes.map(localizacao => {
            const item = document.createElement('div')
            item.innerHTML = `<p>STARBUCKS</p>
            <p>${localizacao.titulo}</p>
            <p>${localizacao.pais}</p>
            <p>${localizacao.endereco}</p>
            <p>${localizacao.latitudee}</p>
            <p>${localizacao.longitudee}</p>`

            const button = document.createElement('div');
            button.innerHTML = "Carregar"
            button.className = 'botaoooo'
            button.addEventListener('click', () => {
                verLocalizacao(localizacao.latitudee, localizacao.longitudee)
                //onClick="verLocalizacao(${localizacao.latitudee}, ${localizacao.longitudee})" 
            })
            item.appendChild(button);
            return item
        });
        listagem(divLista);
    }
}

const sucesso =(posicao) => {
    posicaoInicial =posicao;
    latitude.innerHTML = posicaoInicial.coords.latitude
    longitude.innerHTML = posicaoInicial.coords.longitude
    mapa.src = `https://maps.google.com/maps?q=${localizacao.latitudee},${localizacao.longitudee}&t=&z=13&ie=UTF8&iwloc=&output=embed`
   };
  
   const erro =(error) => {
    let errorMessage;
    switch (error.code) {
        case 0: 
          errorMessage = "Erro desconhecido"
        break;
        case 1: 
          errorMessage = "Permissão negada!"
        break;
        case 2: 
          errorMessage = "Captura de posição indisponivel!"
        break;
        case 3: 
          errorMessage = "Tempo de solicitação excedido!"
        break;
    
    }
    console.log('Ocorreu um erro:' + errorMessage);
   };
  
   capturarlocalizacao.addEventListener('click', () => {
    navigator.geolocation.getCurrentPosition(sucesso, erro);
   })
  

function verLocalizacao(latitude, longitude){
    const mapa = document.getElementById('map')
    mapa.src = `https://maps.google.com/maps?q=${latitude},${longitude}&t=&z=13&ie=UTF8&iwloc=&output=embed`
}

async function adicionarLocalizacao() {
    let titulo = document.getElementById("titulo").value;
    let pais = document.getElementById("pais").value;
    let endereco = document.getElementById("endereco").value;
    let latitudee = document.getElementById("latitudee").value;
    let longitudee = document.getElementById("longitudee").value;
    const tx = await db.transaction('localizacao', 'readwrite')
    const store = tx.objectStore('localizacao');
    try {
        await store.add({ titulo: titulo, pais: pais, endereco: endereco, latitudee: latitudee, longitudee: longitudee });
        await tx.done;
        limparCampos();
        console.log('Registro adicionado com sucesso!');
    } catch (error) {
        console.error('Erro ao adicionar registro:', error);
        tx.abort();
    }
}


async function removerLocalizacao() {
    const tituloRemover = prompt('Qual localizacao deseja excluir:');
    if (!tituloRemover) {
        console.log('Remoção cancelada.');
        return;
    }
    const tx = await db.transaction('localizacao', 'readwrite');
    const store = tx.objectStore('localizacao');
    try {
        await store.delete(tituloRemover);
        await tx.done;
        console.log('Localização excluída com sucesso!');
        buscarTodasLocalizacoes();
    } catch (error) {
        console.error('Erro ao excluir localizacao.', error);
        tx.abort();
    }
}

function limparCampos() {
    document.getElementById("titulo").value = '';
    document.getElementById("pais").value = '';
    document.getElementById("endereco").value = '';
    document.getElementById("latitudee").value = '';
    document.getElementById("longitudee").value = '';
}

function listagem(lista){

    document.getElementById('resultados').innerHTML = "";
    lista.map(item => {
        document.getElementById('resultados').appendChild(item)       
    })
}
