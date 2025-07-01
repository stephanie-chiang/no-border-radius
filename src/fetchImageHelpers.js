import * as path from "path";
import dotenv from "dotenv";

dotenv.config();

export function extractFileName(response) {
    const imageUrl = response.url;
    const regex = /\/([\w\d]+)\.(jpe?g|gif|png|avif|tiff|svg|webp)$/i;
    const matches = imageUrl.match(regex)
    return matches && matches[1] ? matches[1] : console.error("No matches found", matches);
}

export function buildImageFileName(imageName, fileType) {
    const outputFileName = `${imageName}.${fileType.ext}`;
    const destinationFilePath = path.join(process.env.IMAGE_INPUT_PATH, outputFileName);
    return destinationFilePath;
}