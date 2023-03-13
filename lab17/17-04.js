import { createClient } from 'redis';

const client = createClient();


client.on('error', err => console.log('Redis Client Error', err));

await client.connect();
let t1 = Date.now();
for (let i = 0; i < 10000; i++) {
    await client.hSet(i.toString(), i.toString(), `val-${i}`);
}
let t2 = Date.now();
console.log(`Time spent on hSet ops: ${(t2-t1)/1000}`)

t1 = Date.now();
for (let i = 0; i < 10000; i++) {
    await client.hGet(i.toString(),i.toString());
}
t2 = Date.now();
console.log(`Time spent on hGet ops: ${(t2-t1)/1000}`)

const value = await client.get('key');
await client.disconnect();