// testdb.js - Arcadecord
//
// Copyright (C) 2022 Ken Zhou
//
// This file is part of Arcadecord.
//
// Arcadecord can not be copied and/or distributed
// without the express permission of Ken Zhou.

import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import db from './db2.js';

export async function createTestingDb() {
  const mongod = await MongoMemoryServer.create();

  return {
    async connect() {
      const uri = mongod.getUri();
      await db.connect(uri);
    },
    async closeDatabase() {
      await mongoose.connection.dropDatabase();
      await mongoose.connection.close();
      await mongod.stop();
    },
    async clearDatabase() {
      const collections = mongoose.connection.collections;
      for (const key in collections) {
        const collection = collections[key];
        await collection.deleteMany();
      }
    },
  };
}

// // connect to testing in memory database
// export async function connect() {
//   const uri = mongod.getUri()
//   await db.connect(uri)
// }

// // disconnect and close connection
// export async function closeDatabase() {
//   await mongoose.connection.dropDatabase()
//   await mongoose.connection.close()
//   await mongod.stop()
// }

// // clear the db, remove all data
// export async function clearDatabase() {
//   const collections = mongoose.connection.collections
//   for (const key in collections) {
//     const collection = collections[key]
//     await collection.deleteMany()
//   }
// }
