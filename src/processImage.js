import sharp from 'sharp';
import dotenv from "dotenv";
import * as path from "path";
import fs from "fs";
import { fileTypeFromBuffer} from "file-type"; 
import { extractFileName, buildImageFileName } from "./processImageHelpers";

dotenv.config();

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
export function processImage(savedImageInfo) {
    const inputPath = path.resolve(savedImageInfo.destinationFilePath);
    if (!fs.existsSync(inputPath)) {
        console.error(`Error: no input file at ${inputPath}`);
        return;
    }
    const resolvedPath = inputPath.replaceAll("\\","/");
    sharp(resolvedPath)
    .resize(300, 300, {
        fit: sharp.fit.fill,
    })
    .toFile(
        (path.join(
            process.env.IMAGE_OUTPUT_PATH,
            savedImageInfo.imageName + "_resized" + ".png"
        )),
        (error, info) => {
            if (error) {
                console.error(`Error processing image: ${error}`);
            }
            else {
                console.log(`Successfully processed. Image info = ${info}`);
            }
        }
    )
}
