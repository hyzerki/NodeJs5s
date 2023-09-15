import jsonrpc from "jsonrpc-server-http-nats";

const server = new jsonrpc();

function paramValidator(params) {
    if (Array.isArray(params)) {
        if (params.length <= 1)
            throw new Error('Массив должен иметь больше двух элементов');
        params.forEach((item) => {
            if (Number.isNaN(item))
                throw new Error('Ожидается, что все параметры - числа');
        });
        return params;
    }
    let resParams = [];
    Object.keys(params).forEach(key => {
        if (!RegExp(/^x\d+$/).test(key)) {
            throw new Error("Параметры должны именоваться от x1 до xn")
        }
        if (Number.isNaN(params[key])) {
            throw new Error('Ожидается, что все параметры - числа');
        }
        resParams.push(params[key]);
        console.log(`${key}: ${params[key]}`)
    });
    if (resParams.length <= 1) {
        throw new Error('Параметров должно быть больше двух');
    }
    return resParams;

}



function binValidator(params) {
    if (Array.isArray(params)) {
        if (params.length !== 2) {
            throw new Error("Параметров должно быть ровно 2");
        }
        if (Number.isNaN(params[0]) || Number.isNaN(params[1])) {
            throw new Error("Параметры должны быть числами");
        }
        return { x: params[0], y: params[1] };
    }
    else if (typeof params === "object") {
        if (Number.isNaN(params.x) || Number.isNaN(params.y)) {
            throw new Error("Параметры должны быть числами");
        }
        return params;
    }
    throw new Error("Параметры неверно переданы");
}

server.on("sum", paramValidator, (params, channel, response) => {
    response(null, params.reduce((prev, currval) => prev + currval));
});

server.on("mul", paramValidator, (params, channel, response) => {
    response(null, params.reduce((sum, currval) => sum * currval));
});

server.on("div", binValidator, (params, channel, response) => {
    response(null, params.x / params.y);
});

server.on("proc", binValidator, (params, channel, response) => {
    response(null, params.x / params.y * 100);
});



server.listenHttp({ host: "127.0.0.1", port: 3000 }, () => {
    console.log("Server started on port 3000");
});