import mongoose, { Schema } from "mongoose";

const imageSchema = new Schema(
  {
    image_id: {
      type: String,
      required: true,
      unique: true, // Ensures `image_id` is unique
    },
    name: {
      type: String,
      required: true,
    },
    value: {
      type: Buffer, // Stores the image as binary data
      required: true,
    },
    contentType: {
      type: String, // Stores the MIME type of the image (e.g., "image/png", "image/jpeg")
      required: true,
    },
  },
  {
    timestamps: true
  }
);

export default mongoose.model("images", imageSchema);
