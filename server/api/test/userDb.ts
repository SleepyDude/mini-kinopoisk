import { Pool } from 'pg'

export const usersPool = new Pool({
    host: 'localhost',
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    port: +process.env.POSTGRES_PORT_OUTSIDE,
    database: process.env.POSTGRES_USERS_DB,
});
