import * as path from "path";
import dotenv from "dotenv";

dotenv.config();

export function extractFileName(response) {
    const imageUrl = response.url;
    const regex = /\/([\w\d]+)\.(jpe?g|gif|png|avif|tiff|svg|webp)$/i;
    const matches = imageUrl.match(regex)
    return matches && matches[1] ? matches[1] : console.error("No matches found", matches);
}

export function buildImageFileNameAndPath(imageName, fileType) {
    return path.join(process.env.IMAGE_INPUT_PATH, `${imageName}.${fileType.ext}`);
}

async function getFileType(response) {
    const fileType = await fileTypeFromFile(response)
}