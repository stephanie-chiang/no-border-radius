import { fileTypeFromBuffer } from "file-type";
import fs from "fs";
import { extractFileName, buildImageFileName } from "./fetchImageHelpers";

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
            fs.createWriteStream(destinationFilePath).write(buffer);
            console.log(`Success! Your ${fileType.ext} image is now copied to ${destinationFilePath}`);
            return {
                 "imageName": imageName, "destinationFilePath": destinationFilePath
                };
        }
    } catch (error) {
            console.error("Error writing occurred", error.message);
        }
}
// implement checks for existing files in destination directory later
// async function nameSavedFile(fileType) {
//     const existingFilesArray = fs.readdir(
//         process.env.IMAGE_INPUT_PATH, (error, files) => {
//         try {
//             console.log("\nFiles in imageInput dir");
//             files.forEach((file) => {
//                 console.log(file);
//                 existingFilesArray.append(file);
//             })
//         } catch (error) {
//             console.log(`An error has occurred: ${error}`)
//         }
//     }); 

    // const destinationFilePath = path.join(process.env.IMAGE_INPUT_PATH, "inputImage", fileType.ext);
    // if (existsSync(destinationFilePath)) {
    //     console.log("This file exists...time to rename!");
    //     const copyNumber = 0;
    //     const newDestinationFilePath = path.join(process.env.IMAGE_INPUT_PATH, outputFileName)
    // }