import { createClient } from "redis"

class RedisClient{
    constructor(){
        this.client = createClient().on('error', (err) => {
            console.log("Can't connect to Redis:", err)
        })
    }

    isAlive(){
        return true
    }

    async get(key){
        return true
    }

    async set(key, value, duration){
        return true
    }

    async del(key){
        return true
    }
}

const redisClient = new RedisClient()

export default redisClient

