import readline from 'readline';
import sharp from 'sharp';
import dotenv from 'dotenv';
import * as path from 'path';
import fsPromises from 'fs/promises';
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
  return await resolveInput("Input the url of your image: ");
}
async function getAndValidateUserInput() {
  const answer = await getUserInput();
  const regex = /^https?:\/\/[^\s?#]+\.(jpe?g|gif|png|avif|tiff|svg|webp)([^?\s]*)?$/i;
  const isMatch = regex.test(answer);
  if (!isMatch) {
    console.log("Oops! Your input appears invalid. Only images with file-ending " + "jpg, png, gig, avif, tiff, svg and webp are accepted. \n");
    return;
  }
  return answer;
}

async function fetchImage(imageUrl) {
  const response = await fetch(imageUrl);
  if (response.status !== 200) {
    console.log(`Error status: ${response.status}`);
    return;
  }
  return response;
}

function extractFileName(response) {
  const imageUrl = response.url;
  const regex = /\/([\w\d\-_']+)\.(jpe?g|gif|png|avif|tiff|svg|webp)$/i;
  const matches = imageUrl.match(regex);
  return matches && matches[1] ? matches[1] : console.error("No matches found", matches);
}
function getFileExtension(response) {
  const imageUrl = response.url;
  const regex = /\/([\w\d\-_']+)\.(jpe?g|gif|png|avif|tiff|svg|webp)$/i;
  const matches = imageUrl.match(regex);
  return matches && matches[2] ? matches[2] : console.error("No matches found", matches);
}
function buildOutputPath(inputPath, outputDirectoryPath) {
  const {
    name,
    ext
  } = path.parse(inputPath);
  console.log(path.parse(inputPath));
  return path.join(outputDirectoryPath, `${name}_resized${ext}`);
}
function isImage(fetchResponse) {
  return fetchResponse.headers.get("Content-Type").startsWith("image");
}
async function transformImageWithSharp(inputPath, outputPath, borderRadius) {
  const image = sharp(inputPath);
  const {
    width,
    height
  } = await image.metadata();
  const roundedCorners = Buffer.from(`<svg><rect x="0" y="0" width="${width / 2}" height="${height / 2}" rx="${borderRadius}" ry="${borderRadius}" fill="red"/></svg>`);
  image.resize(Math.round(width / 2), Math.round(height / 2), {
    fit: sharp.fit.contain
  }).composite([{
    input: roundedCorners,
    blend: "dest-in"
  }]).toFile(outputPath, (error, info) => {
    if (error) {
      console.error(`Error processing your image: ${error}. \n`);
      console.error(`Please try again. \n`);
    } else {
      console.log(`Successfully processed. \n`);
      console.log(`Image info = ${info.format}, width ${info.width}, heigh ${info.height}`);
    }
  }).destroy();
}

dotenv.config();
async function saveImage(fetchResponse) {
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
async function processImage(inputPath) {
  if (!fs.existsSync(inputPath)) {
    console.error(`Error: no input file at ${inputPath}`);
    return;
  }
  const outputPath = buildOutputPath(inputPath, process.env.IMAGE_OUTPUT_PATH);
  console.log(`New output path is: ${outputPath}`);
  const borderRadius = 30;
  await transformImageWithSharp(inputPath, outputPath, borderRadius);
  if (!fs.existsSync(outputPath)) {
    return;
  }
  return outputPath;
}

console.log("Hello world");
console.log("This program runs as a loop. Hit CTRL+C or COMMAND+D to exit.");
async function main() {
  let run = true;
  while (run === true) {
    const imageUrl = await getAndValidateUserInput();
    if (!imageUrl) {
      console.log(`Problem fetching image at `);
      continue;
    }
    const fetchResponse = await fetchImage(imageUrl);
    if (!fetchResponse) {
      console.log(`Just checking the fetch response is ${fetchResponse}`);
      continue;
    }
    const inputImagePath = await saveImage(fetchResponse);
    console.log(`Input path = ${inputImagePath}. if undefined, should break while loop...`);
    if (!inputImagePath) {
      continue;
    }
    const result = await processImage(inputImagePath);
    console.log(`Result/output path = ${result}`);
    if (!result) {
      console.log(`checking if result goes here...`);
      continue;
    }
    run = false;
  }
}
main();
