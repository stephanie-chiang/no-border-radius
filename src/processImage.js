import sharp from 'sharp';
import dotenv from "dotenv";
import * as path from "path";

dotenv.config();

export function processImage(savedImageInfo) {
    const inputPath = path.resolve(savedImageInfo.destinationFilePath);
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
                console.log(`Error processing image: ${error}`);
            }
            else {
                console.log(`Successfully processed. Image info = ${info}`);
            }
        }
    )
}