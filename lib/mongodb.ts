import mongoose from "mongoose";
import { config } from "./config";

// As of Mongoose 8+/9+, calling mongoose.connect() when a connection already
// exists is a safe no-op -- so, per Mongoose's own Next.js guide, we can just
// call this at the top of every Server Action / Route Handler / Server
// Component data function without any manual connection caching.
// https://mongoosejs.com/docs/nextjs.html
export default async function dbConnect() {
  await mongoose.connect(config.mongoUri);
  return mongoose;
}
