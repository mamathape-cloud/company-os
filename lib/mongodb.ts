import mongoose from "mongoose";

function getMongoUri(): string {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not set");
  }
  return uri;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

const cached = global.mongooseCache ?? { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      console.info("[MongoDB] Connecting...");
    }

    cached.promise = mongoose.connect(getMongoUri(), { dbName: "companyos" }).then((connection) => {
      if (process.env.NODE_ENV === "development") {
        // eslint-disable-next-line no-console
        console.info("[MongoDB] Connected");
      }
      return connection;
    });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    throw error;
  }
}
