
import { createClient } from 'redis';

const client = createClient();


client.on('error', err => console.log('Redis Client Error', err));

await client.connect();

const listener = async (message, channel) => {
    console.log(message);
    await client.unsubscribe("zxc", listener);
    await client.disconnect();
}

client.subscribe("zxc", listener);

