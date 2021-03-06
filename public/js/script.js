const POST_API_URL = 'https://jsonblob.com/api/jsonBlob';
const PUT_API_URL = 'https://jsonblob.com/api/jsonBlob/06bb2426-809d-11ea-b0e8-29e6a8b89d11';
const GET_API_URL = 'https://jsonblob.com/api/jsonBlob/16057a84-809d-11ea-b0e8-0f2c65fff2db';
const REQ_API_URL = 'https://jsonblob.com/api/jsonBlob/2d2fa0bf-81ae-11ea-acec-e19a6b7d235b';


refreshDataFromJSON_API();

async function refreshDataFromJSON_API() {
    const jsonData = await (await fetch(GET_API_URL)).json();

    let html = '';
    for (let id in jsonData) {// Creation des articles
        compiled = ejs.compile(await (await fetch('https://tensai100.github.io/web-citations/public/js/article.ejs')).text(), 'utf8');
        html += compiled({ data: { id: id, auteur: jsonData[id] } });
    }

    //Article nouveau auteur
    compiled = ejs.compile(await (await fetch('https://tensai100.github.io/web-citations/public/js/ajout.ejs')).text(), 'utf8');
    html += compiled({ data: null });
    document.getElementById('row').innerHTML = html;
}


async function ajouterAuteur() {
    //Name verifications
    const nom = document.getElementById(`auteur0`).value;
    const isHTML = RegExp.prototype.test.bind(/^(<([^>]+)>)$/i);

    if (nom.length <= 0 || isHTML(nom)) {
        document.getElementById(`infos0`).textContent = 'Veuillez entrer un nom valide!';
        document.getElementById(`infos0`).style.color = 'red';
        return;
    }

    //POST a new JSON file and get its json_url
    let options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify({ req: `INSERT INTO auteurs (nom) VALUES ("${nom}")` })
    }

    const response = await fetch(POST_API_URL, options);
    const location_url = response.headers.get('Location');
    console.log(location_url);


    //Get existing (PUT) JSON file    
    let jsonData = {};
    jsonData = await (await fetch(REQ_API_URL)).json();
    console.log('oldJson: ' + jsonData);


    //Adding 
    const randomId = Date.now().toString();
    jsonData[randomId] = location_url;
    console.log(jsonData);

    options = {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify(jsonData)
    }

    const res = await fetch(REQ_API_URL, options);
    console.log('PUT: ' + res);

    document.getElementById(`infos0`).textContent = 'Votre auteur sera ajouter dans le plus brève délai';
    document.getElementById(`infos0`).style.color = 'green';

    setTimeout(refreshDataFromJSON_API, 7 * 1000);

}


async function ajouterCitation(id_auteur) {
    //Text verifications
    const citation = document.getElementById(`citation${id_auteur}`).value;
    const isHTML = RegExp.prototype.test.bind(/^(<([^>]+)>)$/i);

    if (citation.length <= 0 || isHTML(citation)) {
        document.getElementById(`infos${id_auteur}`).textContent = 'Entrez une citation valide!';
        document.getElementById(`infos${id_auteur}`).style.color = 'red';
        return;
    }


    //POST a new JSON file and get its json_url
    let options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify({ id_auteur: id_auteur, citation: citation })
    }

    const response = await fetch(POST_API_URL, options);
    const location_url = response.headers.get('Location');
    console.log(location_url);


    //Get existing (PUT) JSON file    
    let jsonData = {};
    jsonData = await (await fetch(PUT_API_URL)).json();
    console.log('oldJson: ' + jsonData);


    //Adding 
    const randomId = Date.now().toString();
    jsonData[randomId] = location_url;
    console.log(jsonData);

    options = {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify(jsonData)
    }

    const res = await fetch(PUT_API_URL, options);
    console.log('PUT: ' + res);

    document.getElementById(`infos${id_auteur}`).textContent = 'Votre demande sera traiter dans le plus brève délai';
    document.getElementById(`infos${id_auteur}`).style.color = 'green';

    setTimeout(refreshDataFromJSON_API, 7 * 1000);
}