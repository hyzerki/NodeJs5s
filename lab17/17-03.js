import { createClient } from 'redis';

const client = createClient();


client.on('error', err => console.log('Redis Client Error', err));

await client.connect();
let t1 = Date.now();
await client.set("incr", 0);
for (let i = 0; i < 10000; i++) {
    await client.incr("incr");
}
let t2 = Date.now();
console.log(`Time spent on incr ops: ${(t2-t1)/1000}`)

t1 = Date.now();
for (let i = 0; i < 10000; i++) {
    await client.decr("incr");
}
t2 = Date.now();
console.log(`Time spent on decr ops: ${(t2-t1)/1000}`)

const value = await client.get('key');
await client.disconnect();