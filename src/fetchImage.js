import dotenv from "dotenv";
import fs from "fs";
import { fileTypeFromBuffer} from "file-type"; 
import { extractFileName, buildImageFileName } from "./processImageHelpers";

dotenv.config();

export async function fetchImage(imageUrl) {
    const response = await fetch(imageUrl);
    if (response.status != 200) {
        throw new Error(`Problem fetching image: ${error}`);
    }
    return response;
}

export async function saveImage(fetchResponse) {
    const arrayBuffer = await fetchResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileType = await fileTypeFromBuffer(buffer);
    try {
        if (fileType.ext) {
            const imageName = extractFileName(fetchResponse);
            const destinationFilePath = buildImageFileName(imageName, fileType);
            console.log("SaveImage - destination file path: ",destinationFilePath);
            fs.createWriteStream(destinationFilePath).write(buffer);
            console.log(`Success! Your ${fileType.ext} image is now copied to ${destinationFilePath}`);
            return {
                 "imageName": imageName, "destinationFilePath": destinationFilePath, "ext": fileType.ext
                };
        }
    } catch (error) {
            console.error("Error writing occurred", error.message);
        }
}