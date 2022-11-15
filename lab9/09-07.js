const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");

try {
    let form = new FormData();
    form.append("file", fs.createReadStream("image.png"),{ knownLength: fs.statSync("image.png").size});
    let config = {
        headers:{
            ...form.getHeaders(),
            "Content-Length":form.getLengthSync()
        }
    };
    axios.post("http://localhost:3000/upload", form, config);
}catch(error){
    console.error(error);
}