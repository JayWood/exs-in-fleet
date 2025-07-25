import { MongoClient } from 'mongodb'

const uri = `mongodb://${process.env.MONGO_URL}`
const options = {}

let client: MongoClient
let clientPromise: Promise<MongoClient>

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

if (!global._mongoClientPromise) {
  console.log('Creating a new MongoClient')
  console.log(uri)
  client = new MongoClient(uri, options)
  global._mongoClientPromise = client.connect()
}

clientPromise = global._mongoClientPromise

export default clientPromise
