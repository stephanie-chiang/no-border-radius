import sharp from 'sharp';
import readline from 'readline';
import { fileTypeFromBuffer } from 'file-type';
import fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: '>'
});
function resolveInput(urlPrompter) {
  return new Promise(resolve => {
    rl.question(urlPrompter, resolve);
  });
}
async function getUserInput() {
  const answer = await resolveInput("Input the url of your image: ");
  return answer;
}
async function validateInput() {
  const answer = await getUserInput();
  const regex = /^https?:\/\/[^\s?#]+\.(jpe?g|gif|png|avif|tiff|svg|webp)(\?[^\s]*)?$/i;
  const isMatch = regex.test(answer);
  return isMatch ? answer : validateInput();
}

dotenv.config();
function extractFileName(response) {
  const imageUrl = response.url;
  const regex = /\/([\w\d]+)\.(jpe?g|gif|png|avif|tiff|svg|webp)$/i;
  const matches = imageUrl.match(regex);
  return matches && matches[1] ? matches[1] : console.error("No matches found", matches);
}
function buildImageFileName(imageName, fileType) {
  const outputFileName = `${imageName}.${fileType.ext}`;
  const destinationFilePath = path.join(process.env.IMAGE_INPUT_PATH, outputFileName);
  return destinationFilePath;
}

async function fetchImage(imageUrl) {
  const response = await fetch(imageUrl);
  if (response.status != 200) {
    throw new Error(`Problem fetching image: ${error}`);
  }
  return response;
}
async function saveImage(fetchResponse) {
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
        "imageName": imageName,
        "destinationFilePath": destinationFilePath
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

dotenv.config();
function processImage(savedImageInfo) {
  const inputPath = path.resolve(savedImageInfo.destinationFilePath);
  if (!fs.existsSync) {
    console.error(`Error: not input file at ${inputPath}`);
    return;
  }
  const resolvedPath = inputPath.replace("\\", "/");
  sharp(resolvedPath).resize(300, 300, {
    fit: sharp.fit.fill
  }).toFile(path.join(process.env.IMAGE_OUTPUT_PATH, savedImageInfo.imageName + "_resized" + ".png"), (error, info) => {
    if (error) {
      console.error(`Error processing image: ${error}`);
    } else {
      console.log(`Successfully processed. Image info = ${info}`);
    }
  });
}

console.log("Hello world");
//Get user specified image-url
//store
//manipulate
//store a new copy

const imageUrl = await validateInput();
const fetchedImage = await fetchImage(imageUrl);
const savedImageInfo = await saveImage(fetchedImage);
processImage(savedImageInfo);
