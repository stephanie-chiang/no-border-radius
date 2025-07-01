import sharp from 'sharp';
import dotenv from "dotenv";
import * as path from "path";
import fs from "fs";

dotenv.config();

export function processImage(savedImageInfo) {
    const inputPath = path.resolve(savedImageInfo.destinationFilePath);
    if (!fs.existsSync) {
        console.error(`Error: not input file at ${inputPath}`);
        return;
    }
    const resolvedPath = inputPath.replace("\\","/");
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