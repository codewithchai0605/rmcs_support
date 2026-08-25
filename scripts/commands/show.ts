import mongoose from "mongoose";
import dbConnect from "../../lib/mongodb";
import AppVersion, { APP_VERSION_ID } from "../../lib/models/AppVersion";
import { printVersion } from "../shared";

export async function cmdShow() {
  await dbConnect();
  const doc = await AppVersion.findById(APP_VERSION_ID).lean();

  if (!doc) {
    console.log("No release has been published yet. Run `upload` first.");
  } else {
    console.log("Currently published:");
    printVersion(doc);
  }

  await mongoose.connection.close();
}
