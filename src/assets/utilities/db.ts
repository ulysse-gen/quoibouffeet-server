import { UUID, randomUUID } from 'crypto';
import mysql, { QueryOptions } from 'mysql2/promise';

const MysqlConfig = {
  db: {
    /* don't expose password or any sensitive info, done only for demo */
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "quoibouffeet",
    port: (process.env.DB_PORT) ? parseInt(process.env.DB_PORT) : 3306,
    password: process.env.DB_PASSWORD || "quoibouffeet",
    database: process.env.DB_DB || "quoibouffeet",
    connectTimeout: 60000
  }
};

export async function generateRandomIDForTable(table: string) {
  const UUID = randomUUID();
  if (await idExistsOnTable(table, UUID.toString()))return generateRandomIDForTable(table);
  return UUID;
}

export async function idExistsOnTable(table: string, id: string) {
  const CheckQuery = await query(`SELECT id FROM ${table} WHERE id = '${id}';`) as Array<{id:string}>;
  return (CheckQuery.length != 0);
}

export async function query(sql: string, params?: Array<any>) {
  const connection = await mysql.createConnection(MysqlConfig.db);
  const [results, ] = await connection.query(sql, params);
  await connection.end();
  connection.destroy();
  return results;
}

export async function execute(sql: string, params?: Array<any>) {
  const connection = await mysql.createConnection(MysqlConfig.db);
  const [results, ] = await connection.execute({sql}, params);
  await connection.end();
  connection.destroy();
  return results;
}

export async function queryTransaction(queries: Array<{sql: string, params?: Array<any>}>) {
  const connection = await mysql.createConnection(MysqlConfig.db);
  await connection.beginTransaction();
  const query = queries.map(async query => connection.query(query.sql, query.params));
  await Promise.all(query);
  return connection.commit();
}

export default {query, execute, queryTransaction};