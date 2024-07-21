import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
import { access } from "fs";

const app = express();
const port = 3000;
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
let result = "Enter your playlist link to see the result"
var client_id = '';//paste in your client id
var client_secret = ''; //paste in your client secret

//Getting the API's token
  async function getToken() {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      body: new URLSearchParams({
        'grant_type': 'client_credentials',
      }),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + (Buffer.from(client_id + ':' + client_secret).toString('base64')),
      },
    });
    return await response.json();
  }

function playlistClassification(rate){
  if (rate<=15) {
    return `You have an indie type shi music taste with an exotic rate of ${rate}%`
  } else if (rate<=30){
    return `You lowkey have an under-the-radar music taste with an exotic rate of ${rate}%`
  } else if (rate<=60){
    return `You have a mid music taste with an exotic rate of ${rate}%`
  } else return `You only listen to Taylor Swift with an exotic rate of ${rate}%`
}

app.get("/", (req,res)=>{
    res.render("index.ejs", {result:result});
})

app.post("/submit", async (req,res)=>{
    const token_body =  await getToken();
    const url = req.body.url;
    const regex = /\/playlist\/([^?]+)/;
    let match = url.match(regex);
    if (match) {
    const playlistId = match[1];
    const response = await axios.get(`https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=100`, {
        headers: { 'Authorization': 'Bearer ' + token_body.access_token},
      });
      let totalPopularity = 0;
            response.data.items.forEach(song => {
                totalPopularity += song.track.popularity; // Updated to access song.track.popularity
            });
            
            const popularityOfPlaylist = totalPopularity; // Assign totalPopularity to popularityOfPlaylist
    console.log(popularityOfPlaylist);
    const exoticRate = (popularityOfPlaylist/(response.data.items.length)*100)/100;
    result = playlistClassification(exoticRate);
    res.render("index.ejs",{result:result});
    } else {
    console.log("'/playlist/' not found in the URL.");
    res.redirect("/");
}
});  

app.listen(port, ()=>{
    console.log(`Up and running at ${port}.`);
})