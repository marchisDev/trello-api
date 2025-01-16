/**
 */

const MONGODB_URI = 'mongodb+srv://marchisDev:gBZu8na97EnByumZ@cluster0-marchisdev.bl6vb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0-marchisDev'
const DATABASE_NAME = 'marchisDev-Trello'

import { MongoClient, ServerApiVersion } from 'mongodb'

// khoi tao mot doi tuong trelloInstance bna dau la null(vi chua connect)
let trelloDatabaseInstance = null

// khoi tao mot doi tuong mongoClientInstance de connect toi MongoDB
const mongoClientInstance = new MongoClient(MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true
  }
})

export const CONNECT_DB = async () => {
  // goi ket noi toi mongoDB Atlas vs URI da khai bao trong than cua clientInstance
  await mongoClientInstance.connect()
  // ket noi thanh cong thi lay ra database theo ten va gan nguoc no lai vao bien trelloDatabaseInstance o tren
  trelloDatabaseInstance = mongoClientInstance.db(DATABASE_NAME)
}

export const CLOSE_DB = async () => {
  console.log('Closing MongoDB connection...')
  await mongoClientInstance.close()
}

// Function GET_DB (khong async) nay co nhiem vu export ra cai trello database instance da connect sau khi da connect thanh
// cong toi mongoDB de chung ta co the su dung no o nhieu noi khac nhau trong code
// chi goi GET_DB khi da connect thanh cong toi mongodb
export const GET_DB = () => {
  if (!trelloDatabaseInstance) {
    throw new Error('Must connect to Database first')
  }
  return trelloDatabaseInstance
}

