const express = require('express');
const app = express();
const mysql = require('mysql');
const fetch = require(('node-fetch'));


app.listen(3002, () => console.log('Success: The server is listen on port 3000'));

const cnx = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'webcitations'
});

cnx.connect((err) => {
    if (err)
        console.log('Error on cnx.connect: ' + err);
    else {
        console.log('Success: Connected to database');
    }
});


const POST_API_URL = 'https://jsonblob.com/api/jsonBlob';
const PUT_API_URL = 'https://jsonblob.com/api/jsonBlob/06bb2426-809d-11ea-b0e8-29e6a8b89d11';
const GET_API_URL = 'https://jsonblob.com/api/jsonBlob/16057a84-809d-11ea-b0e8-0f2c65fff2db';

async function RefreshingData() {

    //Get (PUTED) JSON file    
    let json_toPUT = {};
    try {
        json_toPUT = await (await fetch(PUT_API_URL)).json();

        //Adding to database
        const ids = Object.getOwnPropertyNames(json_toPUT);
        for (let i = 0; i < ids.length; i++) {
            const citation = await (await fetch(json_toPUT[ids[i]])).json();

            const sql = `INSERT INTO citations (id_auteur, citation) VALUES (${citation.id_auteur}, "${citation.citation}")`;
            cnx.query(sql, (err, res) => {
                if (err)
                    console.log('Error on cnx.query (insert): ' + err);
                else {
                    console.log('Success: 1 record inserted');
                }
            });
        }


        // Upload JSON file
        const sql_auteurs = `SELECT a.id_auteur, a.nom, c.id_citation, c.citation FROM auteurs AS a 
                            LEFT JOIN citations AS c 
                            ON a.id_auteur = c.id_auteur 
                            ORDER BY a.id_auteur`;
        cnx.query(sql_auteurs, async(err, res_auteurs) => {
            if (err)
                console.log('Error on cnx.query (SELECT * FROM auteurs): ' + err);
            else {

                const json_auteurs = {};
                for (let i = 0, auteurID; i < res_auteurs.length; i++) {
                    const citations = {};
                    if (auteurID !== res_auteurs[i].id_auteur) {
                        json_auteurs[res_auteurs[i].id_auteur] = {
                            nom: res_auteurs[i].nom,
                            citations: citations
                        }

                        auteurID = res_auteurs[i].id_auteur;
                    }

                    json_auteurs[res_auteurs[i].id_auteur].citations[res_auteurs[i].id_citation] = res_auteurs[i].citation;
                }

                let options = {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    },
                    body: JSON.stringify(json_auteurs)
                }

                let res = await fetch(GET_API_URL, options);

                // Clean (PUTED) JSON file 
                options = {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    },
                    body: JSON.stringify({})
                }

                res = await fetch(PUT_API_URL, options);
                console.log('Success: Cleaned');

                console.log('Success: API Uploaded');
            }
        });


    } catch (err) { console.log(err); }

}

setInterval(RefreshingData, 5000);