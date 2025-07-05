import sharp from 'sharp';
import dotenv from "dotenv";
import * as path from "path";
import fsPromises from "fs/promises";
import fs from "fs";
import { fileTypeFromBuffer} from "file-type";
import { extractFileName, getFileExtension, buildOutputPath, isImage} from "./processImageHelpers";

dotenv.config();

export async function saveImage(fetchResponse) {
    console.log(fetchResponse);
    if (!isImage(fetchResponse)) {
        console.log(`Incorrect content-type ${fetchResponse.headers.contentType} detected. Try another image. \n`);
        return;
    }
    const arrayBuffer = await fetchResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileType = await fileTypeFromBuffer(buffer);
    console.log(`Filetype = ${fileType}`);

    let fileExtension;
    fileType ? fileExtension = fileType.ext : fileExtension = getFileExtension(fetchResponse);

    console.log(`File extension = ${fileExtension}`);

    if (!fileExtension) {
        console.log(`No valid extension could be detected for ${fetchResponse.url}. The program will only accept valid images. \n`);
        return;
    }

    const imageName = extractFileName(fetchResponse);
    const outputFileName = `${imageName}.${fileExtension}`;
    const destinationFilePath = path.join(process.env.IMAGE_INPUT_PATH, outputFileName);

    try {
        await fsPromises.writeFile(destinationFilePath, buffer);
        console.log(`Success! Your ${fileExtension} image is now copied to ${destinationFilePath}`);
        return destinationFilePath;
    } catch (error) {
            console.error(`Error writing to ${error.path} occurred`, error.code, error.message);
            return;
    }
}

export async function processImage(inputPath) {
    if (!fs.existsSync(inputPath)) {
        console.error(`Error: no input file at ${inputPath}`);
        return;
    }

    const outputPath = buildOutputPath(inputPath, process.env.IMAGE_OUTPUT_PATH);
    console.log(`New output path is: ${outputPath}`);

    const image = sharp(inputPath);
    const {width, height} = await image.metadata();

    const borderRadius = 30;
    const roundedCorners = Buffer.from(
        `<svg><rect x="0" y="0" width="${width/2}" height="${height/2}" rx="${borderRadius}" ry="${borderRadius}" fill="red"/></svg>`
    )

    image
        .resize(Math.round(width/2), Math.round(height/2), {
            fit: sharp.fit.contain,
        })
        .composite([{
            input: roundedCorners,
            blend: "dest-in"
        }])
        .toFile(
            outputPath, (error, info) => {
                if (error) {
                    console.error(`Error processing your image: ${error}. \n`);
                    console.error(`Please try again. \n`);
                }
                else {
                    console.log(`Successfully processed. \n`)
                    console.log(`Image info = ${info.format}, width ${info.width}, heigh ${info.height}`);
                }
            }
        )
    if (!fs.existsSync(outputPath)){
        console.error(`Error: no input file at ${outputPath}`);
        return;
    }
    return outputPath;
}
