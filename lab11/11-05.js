const rpcWSS = require('rpc-websockets').Server;



let server = new rpcWSS({ port: 3000, host: 'localhost' });

server.setAuth((credentials)=>{return (credentials.login == 'mns' && credentials.password == 'mns')});

server.register('square', (params) => {
    if (params[1] == undefined)
        return 3.14 * params[0] * params[0];
    return params[0] * params[1]
}).public();

server.register('sum', (params) => { return params.reduce((res, item) => { return res + item }, 0) }).public();

server.register('mul', (params) => { return params.reduce((res, item) => { return res * item }, 1) }).public();

server.register('fib', (params) => {
    return new Array(params[0]).fill(1).reduce((arr, _, i) => {
        arr.push((i <= 1) ? i : arr[i - 2] + arr[i - 1])
        return arr
    }, []);
}).protected();

server.register('fact', (params) => {
    let total =1;
    for (i = 0; i < params[0]; i++){
        total = total * (params[0] - i);
    }
    return total;
}).protected();