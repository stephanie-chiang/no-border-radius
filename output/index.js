import readline from 'readline';
import dotenv from 'dotenv';
import fs from 'fs';
import { fileTypeFromBuffer } from 'file-type';
import * as path from 'path';
import sharp from 'sharp';

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

// export function buildImageFileNameAndPath(imageName, fileType) {
//     return path.join(process.env.IMAGE_INPUT_PATH, `${imageName}.${fileType.ext}`);
// }

function buildImageFileName(imageName, fileType) {
  const outputFileName = `${imageName}.${fileType.ext}`;
  const destinationFilePath = path.join(process.env.IMAGE_INPUT_PATH, outputFileName);
  return destinationFilePath;
}

dotenv.config();
async function fetchImage(imageUrl) {
  const response = await fetch(imageUrl);
  if (response.status != 200) {
    throw new Error(`Problem fetching image: ${error}`);
  }
  return response;
}

dotenv.config();
async function saveImage(fetchResponse) {
  const arrayBuffer = await fetchResponse.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const fileType = await fileTypeFromBuffer(buffer);
  try {
    if (fileType.ext) {
      const imageName = extractFileName(fetchResponse);
      const destinationFilePath = buildImageFileName(imageName, fileType);
      console.log("SaveImage - destination file path: ", destinationFilePath);
      fs.createWriteStream(destinationFilePath).write(buffer);
      console.log(`Success! Your ${fileType.ext} image is now copied to ${destinationFilePath}`);
      return {
        "imageName": imageName,
        "destinationFilePath": destinationFilePath,
        "ext": fileType.ext
      };
    }
  } catch (error) {
    console.error("Error writing occurred", error.message);
  }
}
function processImage(savedImageInfo) {
  const inputPath = path.resolve(savedImageInfo.destinationFilePath);
  if (!fs.existsSync(inputPath)) {
    console.error(`Error: no input file at ${inputPath}`);
    return;
  }
  const resolvedPath = inputPath.replaceAll("\\", "/");
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
