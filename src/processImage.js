import sharp from 'sharp';
import dotenv from "dotenv";
import * as path from "path";
import fsPromises from "fs/promises";
import fs from "fs";
import { fileTypeFromBuffer} from "file-type";
import {
    extractFileName,
    getFileExtension,
    buildOutputPath,
    isImage,
    transformImageWithSharp
} from "./processImageHelpers";

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
        if (fetchResponse?.body?.cancel) {
            console.log(`Cancelling response body`);
            await fetchResponse.body.cancel();
        }
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

    const borderRadius = 30;
    await transformImageWithSharp(inputPath, outputPath, borderRadius);

    if (!fs.existsSync(outputPath)){
        return;
    }
    return outputPath;
}
