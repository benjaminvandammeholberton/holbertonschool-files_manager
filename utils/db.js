class DBClient{
    constructor(){

    }

    isAlive(){
        return true
    }

    async nbUsers(){
        return true
    }

    async nbFiles(){
        return true 
    }

}

const dbClient = new DBClient()

export default dbClient