import { getAndValidateInput } from './userInput';
import { fetchImage } from './fetchImage';
import { saveImage, processImage } from './processImage';

console.log("Hello world");

export async function main() {
    const imageUrl = await getAndValidateInput();

    const fetchedImage = await fetchImage(imageUrl);

    const inputImagePath = await saveImage(fetchedImage);

    if (inputImagePath) {
        await processImage(inputImagePath);
    }
    else {
        return main;
    }

}

main();
