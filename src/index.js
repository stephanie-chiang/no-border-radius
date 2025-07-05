import { getAndValidateUserInput } from './userInput';
import { fetchImage } from './fetchImage';
import { saveImage, processImage } from './processImage';

console.log("Hello world");
console.log("This program runs as a loop. Hit CTRL+C or COMMAND+D to exit.");

async function main() {
    let run = true;

    while (run === true) {

        const imageUrl = await getAndValidateUserInput();

        if (!imageUrl) {
            console.log(`Problem fetching image at `)
            continue;
        }

        const fetchResponse = await fetchImage(imageUrl);
        if (!fetchResponse) {
           console.log(`Just checking the fetch response is ${fetchResponse}`) ;
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
            console.log(`checking if result goes here...`)
            continue;
        }
        run = false;
    }

}

main();
