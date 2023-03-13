
import { createClient } from 'redis';

const client = createClient();


client.on('error', err => console.log('Redis Client Error', err));

await client.connect();

await client.publish("zxc","Knock knock my politically incorrect racial epithets")

await client.disconnect();