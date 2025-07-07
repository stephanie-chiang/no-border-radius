import { getAndValidateUserInput } from './userInput';
import { fetchImage } from './fetchImage';
import { saveImage, processImage } from './processImage';

console.log("Hello world");
console.log("This application will create rounded borders for images that you specify from a web address. \n" +
    "The image must be in a valid image format for this to work.");

async function main() {
    let run = true;

    while (run === true) {

        const imageUrl = await getAndValidateUserInput();

        if (!imageUrl) {
            console.log(`Problem fetching your specified image. `)
            continue;
        }

        const fetchResponse = await fetchImage(imageUrl);
        if (!fetchResponse) {
           console.log(`Problem with fetch request.`) ;
           continue;
        }


        const inputImagePath = await saveImage(fetchResponse);
        console.log(`Problem fetching image.`);

        if (!inputImagePath) {
            continue;
        }



        const result = await processImage(inputImagePath);
        console.log(`Result/output path = ${result}`);
        if (!result) {
            console.log(`Problem processing image.`)
            continue;
        }
        console.log(`program ending...`)
        run = false;
    }

}

main();
