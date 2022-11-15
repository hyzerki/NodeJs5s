const axios = require("axios");
const fs = require("fs");

async function get(){
    try{
        let config = {
            responseType: "stream"
        };
    
        let response = await axios.get("http://localhost:3000/files/image.png", config);
        response.data.pipe(fs.createWriteStream("downloaded.png"));
    }catch(error){
        console.error(error);
    }
}

get();