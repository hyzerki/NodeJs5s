import express from 'express';

const tsRoute = express.Router();

import data from "./phones.json" assert { "type": "json" };

tsRoute.get('/', (request, response) => {
    response.json(data);
});

tsRoute.post('/', (request, response) => {

    const {id, name, phone} = request.body;
    const newTs = {id, name, phone};
    console.log(newTs)
    const targetTs = data.find(ts => ts.id === newTs.id);
    console.log(targetTs)
    if (!targetTs) {
        data.push(newTs);
        response.json(newTs);
    }
    response.status(400).end();
});

tsRoute.put('/', (request, response) => {
    const {id, name, phone} = request.body;
    const newTs = {id, name, phone};
    const targetTs = data.find(ts => ts.id === newTs.id);
    if (id && targetTs) {
        targetTs.name = name;
        targetTs.phone = phone;
        response.json(targetTs);
    } else {
        response.status(400).end();
    }
});

tsRoute.delete('/', (request, response) => {
    console.log(request.query.id)
    console.log(data)
    const target = data.find(ts => ts.id === +request.query.id);
    let identify = data.findIndex(ts => ts.id === +request.query.id);
    console.log(target)
    if (request.query.id && target) {
        let deleted = data.splice(identify,1);
        // data = data.filter((ts) => ts.id !== target.id);
        console.log(deleted)
        response.json(deleted);
    } else {
        response.status(400).end();
    }
});


export default tsRoute;
