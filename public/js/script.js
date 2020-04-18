const POST_API_URL = 'https://jsonblob.com/api/jsonBlob';
const PUT_API_URL = 'https://jsonblob.com/api/jsonBlob/06bb2426-809d-11ea-b0e8-29e6a8b89d11';
const GET_API_URL = 'https://jsonblob.com/api/jsonBlob/16057a84-809d-11ea-b0e8-0f2c65fff2db';


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
}

async function refreshDataFromJSON_API() {
    jsonData = await (await fetch(GET_API_URL)).json();
    // console.log(jsonData);

    for (let id in jsonData) {
        // console.log(jsonData[id]);
        // const article = await ejs.renderFile('<%= include(article) %>', { auteur: jsonData[id] });
        // document.getElementById('row').innerHTML += article;

        const compiled = ejs.compile(await (await fetch('https://tensai100.github.io/web-citations/public/js/article.ejs')).text(), 'utf8');
        const html = compiled({ auteur: jsonData[id] });
        // document.getElementById('row').innerHTML += html;

        // const rendered = ejs.render('<%- include(article) %>', { auteur: jsonData[id] });
        // console.log(rendered);

        // let str = `<%- include(article, ${jsonData[id]}) %>`;
        // let fn = ejs.compile(str, { client: true });

        // fn(jsonData[id], null, function(path, d) { // include callback
        //     console.log(d);
        //     console.log(path);
        //     // path -> 'file'
        //     // d -> {person: 'John'}
        //     // Put your code here
        //     // Return the contents of file as a string
        // }); // returns rendered string
    }
}
refreshDataFromJSON_API();
// setInterval(refreshDataFromJSON_API, 2 * 1000);