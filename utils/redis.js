const redis = require('redis');
const util = require('util')


class RedisClient{
    constructor(){
        this.client = redis.createClient()

        this.client.on('connect', () => {
            console.log("Redis client connected to the server");
        })

        this.client.on('error', (err) => {
            console.log("Can't connect to Redis:", err)
        })
    }

    isAlive(){
        return this.client.connected;                               
    }

    async get(key){
        const getAsync = util.promisify(this.client.get).bind(this.client);
        return getAsync(key)
    }

    async set(key, value, duration){
        await this.client.set(key, value)
        await this.client.expire(key, duration)
    }

    async del(key){
        await this.client.del(key)
    }
}

const redisClient = new RedisClient()
module.exports = redisClient;