import { validateInput } from './userInput';
import { fetchImage } from './fetchImage';
import { saveImage, processImage } from './processImage';

console.log("Hello world");
//Get user specified image-url
//store
//manipulate
//store a new copy

const imageUrl = await validateInput();

const fetchedImage = await fetchImage(imageUrl);

const savedImageInfo = await saveImage(fetchedImage);

processImage(savedImageInfo);





