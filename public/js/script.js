const POST_API_URL = 'https://jsonblob.com/api/jsonBlob';
const PUT_API_URL = 'https://jsonblob.com/api/jsonBlob/06bb2426-809d-11ea-b0e8-29e6a8b89d11';
const GET_API_URL = 'https://jsonblob.com/api/jsonBlob/16057a84-809d-11ea-b0e8-0f2c65fff2db';


refreshDataFromJSON_API();

async function refreshDataFromJSON_API() {
    const jsonData = await (await fetch(GET_API_URL)).json();

    let html = '';
    for (let id in jsonData) {
        // const compiled = ejs.compile(await (await fetch('https://tensai100.github.io/web-citations/public/js/article.ejs')).text(), 'utf8');

        const compiled = ejs.compile(`<% const id = data['id'], auteur = data['auteur']  %>
        <div class="cl-xs-12 col-sm-6 col-md-6 col-lg-4 col-xl-3">
        <div class="why-edit-box">
            <h3>
                <%= auteur.nom %>
            </h3>
            <div class="citations">
                <% for (let id_citation in auteur.citations){ %>
                    <p>
                        <%= auteur.citations[id_citation] %>
                    </p>
                    <% } %>
            </div>
    
            <div class="form-group form">
                <textarea id="citation<%= id %>" placeholder="Nouvelle citation..." class="form-control citationJS" rows="3"></textarea>
                <p id="infos<%= id %>"></p>
                <button type="button" class="btn btn-primary" onclick="ajouterCitation(<%= id %>)">Ajouter</button>
            </div>
        </div>
    </div>`, 'utf8');
        html += compiled({ data: { id: id, auteur: jsonData[id] } });
    }
    document.getElementById('row').innerHTML = html;
}


async function ajouterCitation(id_auteur) {
    //Name verifications
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

    setTimeout(refreshDataFromJSON_API, 5 * 1000);
}