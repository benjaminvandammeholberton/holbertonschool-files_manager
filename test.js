import dbClient from './utils/db';

async function test () {
    const status = await dbClient.isAlive()
    console.log(status);
}

test()
