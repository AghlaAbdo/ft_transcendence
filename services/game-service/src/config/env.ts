import dotenv from 'dotenv'

dotenv.config();

const DB_NAME = process.env.DB_NAME || 'dataBase';


export {
    DB_NAME
}