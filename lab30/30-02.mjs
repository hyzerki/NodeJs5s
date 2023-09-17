import express from "express";
import fs from "fs";

//todo docker run --rm -v $(pwd):/src -u $(id -u):$(id -g) emscripten/emsdk emcc func.c -o func.js

const app = express();

let wasmCode = fs.readFileSync("public/func.wasm");
const wasmImports = {};
const wasmModule = new WebAssembly.Module(wasmCode);
const wasmInstance = new WebAssembly.Instance(wasmModule, wasmImports);
const sum = wasmInstance.exports.sum;
const sub = wasmInstance.exports.sub;
const mul = wasmInstance.exports.mul;


app.use('/public', express.static("public"));

//t3
app.get("/sum/:x/:y",(req,res)=>{
    let x = parseInt(req.params.x);
    let y = parseInt(req.params.y);
    let result = sum(x,y);
    res.send({result});
});

app.get("/sub/:x/:y",(req,res)=>{
    let x = parseInt(req.params.x);
    let y = parseInt(req.params.y);
    let result = sub(x,y);
    res.send({result});
});

app.get("/mul/:x/:y",(req,res)=>{
    let x = parseInt(req.params.x);
    let y = parseInt(req.params.y);
    let result = mul(x,y);
    res.send({result});
});

app.listen(3000, ()=>{
    console.log("http://localhost:3000/public/30-02.html");
});