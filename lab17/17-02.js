import { createClient } from 'redis';

const client = createClient();


client.on('error', err => console.log('Redis Client Error', err));

await client.connect();
let t1 = Date.now();
for (let i = 0; i < 10000; i++) {
    await client.set(i.toString(), `set${i}`);
}
let t2 = Date.now();
console.log(`Time spent on set ops: ${t2-t1}`)

t1 = Date.now();
for (let i = 0; i < 10000; i++) {
    await client.get(i.toString());
}
t2 = Date.now();
console.log(`Time spent on get ops: ${t2-t1}`)

t1 = Date.now();
for (let i = 0; i < 10000; i++) {
    await client.del(i.toString());
}
t2 = Date.now();
console.log(`Time spent on del ops: ${t2-t1}`)

const value = await client.get('key');
await client.disconnect();