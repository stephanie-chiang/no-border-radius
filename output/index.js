import readline from 'readline';
import sharp from 'sharp';
import dotenv from 'dotenv';
import * as path from 'path';
import fs from 'fs';
import { fileTypeFromBuffer } from 'file-type';

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

async function fetchImage(imageUrl) {
  const response = await fetch(imageUrl);
  if (response.status != 200) {
    throw new Error(`Problem fetching image: ${error}`);
  }
  return response;
}

dotenv.config();
function extractFileName(response) {
  const imageUrl = response.url;
  const regex = /\/([\w\d]+)\.(jpe?g|gif|png|avif|tiff|svg|webp)$/i;
  const matches = imageUrl.match(regex);
  return matches && matches[1] ? matches[1] : console.error("No matches found", matches);
}
function buildImageFileNameAndPath(imageName, fileType) {
  return path.join(process.env.IMAGE_INPUT_PATH, `${imageName}.${fileType.ext}`);
}

dotenv.config();
async function saveImage(fetchResponse) {
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
  if (!fs.existsSync(savedImageInfo.destinationFilePath)) {
    console.error(`Error: not input file at ${savedImageInfo.destinationFilePath}`);
    return;
  }
  console.log("input path", savedImageInfo.destinationFilePath);
  // const inputPath = path.join(__dirname, process.env.IMAGE_INPUT_PATH, "");
  const resolvedPath = path.resolve(savedImageInfo.destinationFilePath).replace(/\\/g, "/");
  console.log("resolved path: ", resolvedPath);
  // console.log("joined input path = ", inputPath);
  sharp(resolvedPath).resize(300, 300, {
    fit: sharp.fit.fill
  }).toFile(path.join(process.env.IMAGE_OUTPUT_PATH, savedImageInfo.imageName + "_resized" + ".jpg"), (error, info) => {
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
