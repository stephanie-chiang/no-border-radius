import * as path from "path";
import fs from "fs";
import sharp from "sharp";

export function extractFileName(response) {
    const imageUrl = response.url;
    const regex = /\/([\w\d\-_']+)\.(jpe?g|gif|png|avif|tiff|svg|webp)$/i;
    const matches = imageUrl.match(regex)
    return matches && matches[1] ? matches[1] : console.error("No matches found", matches);
}

export function getFileExtension(response) {
    const imageUrl = response.url;
    const regex = /\/([\w\d\-_']+)\.(jpe?g|gif|png|avif|tiff|svg|webp)$/i;
    const matches = imageUrl.match(regex)
    return matches && matches[2] ? matches[2] : console.error("No matches found", matches);
}

export function buildOutputPath(inputPath, outputDirectoryPath) {
    const {name, ext} = path.parse(inputPath);
    console.log(path.parse(inputPath));
    return path.join(outputDirectoryPath, `${name}_resized${ext}`);
}

export function isImage(fetchResponse) {
    return fetchResponse.headers.get("Content-Type").startsWith("image");
}

export async function transformImageWithSharp(inputPath, outputPath, borderRadius) {

    const image = sharp(inputPath);
    const {width, height} = await image.metadata();

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
        .destroy();
}

