import sharp from 'sharp';
import dotenv from "dotenv";
import * as path from "path";
import fs from "fs";
import { fileTypeFromBuffer} from "file-type"; 
import { extractFileName, buildImageFileNameAndPath } from "./processImageHelpers";

dotenv.config();

export async function saveImage(fetchResponse) {
    const arrayBuffer = await fetchResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileType = await fileTypeFromBuffer(buffer);
    try {
        if (fileType.ext) {
            const imageName = extractFileName(fetchResponse);
            const destinationFilePath = buildImageFileNameAndPath(imageName, fileType);
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
    if (!fs.existsSync(savedImageInfo.destinationFilePath)) {
        console.error(`Error: not input file at ${savedImageInfo.destinationFilePath}`);
        return;
    }
    console.log("input path", savedImageInfo.destinationFilePath);
    // const inputPath = path.join(__dirname, process.env.IMAGE_INPUT_PATH, "");
    const resolvedPath = path.resolve(savedImageInfo.destinationFilePath).replace(/\\/g, "/");
    console.log("resolved path: ", resolvedPath);
    // console.log("joined input path = ", inputPath);
    sharp(resolvedPath) 
    .resize(300, 300, {
        fit: sharp.fit.fill,
    })
    .toFile(
        (path.join(
            process.env.IMAGE_OUTPUT_PATH,
            savedImageInfo.imageName + "_resized" + ".jpg"
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
