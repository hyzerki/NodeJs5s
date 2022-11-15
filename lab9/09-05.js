const http = require("http");
let xmlbuilder = require("xmlbuilder");
let xmlparseString = require("xml2js").parseString;

let xmldoc = xmlbuilder.create("request").att("id", 1);
xmldoc.ele("x").att("value", 3).up()
    .ele("x").att("value", 3).up()
    .ele("x").att("value", 5).up()
    .ele("x").att("value", 1).up()
    .ele("m").att("value", "d").up()
    .ele("m").att("value", "a");

let options = {
    method: "POST",
    port: 3000,
    host: "localhost",
    path: `/xml`
}

let request = http.request(options, (response) => {
    console.log(" " + response.statusCode);

    let data = "";
    response.on("data", (chunk) => {
        data += chunk.toString("utf8")
    });

    response.on("end", () => {
        xmlparseString(data, (err, result) => {
            if(err){
                console.log("xml parse error");
            }else{
                console.log(result.response.sum[0].$.element + " "+result.response.sum[0].$.result);
                console.log(result.response.concat[0].$.element + " "+result.response.concat[0].$.result);
            }
        });
    });

});

request.on("error", (e) => {
    console.log("error" + e.message);
});

request.end(xmldoc.toString({ pretty: true }));