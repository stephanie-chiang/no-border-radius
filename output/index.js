import 'url';
import 'sharp';
import readline from 'readline';

console.log("Hello world");

//Get user specified image-url
//store
//manipulate
//store a new copy

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

//https://mycomicrelief.wordpress.com/wp-content/uploads/2024/07/calvin-and-hobbes-1-2.jpg
async function validateInput() {
  const answer = await getUserInput();
  // const regex = /[(http(s)?):\/\/www{0,3}\.?\w\d@:%._\+~#=]{2,256}\.[\w]{2,6}\b([-\w\d@:%_\+.~#?&\/\/=]*\.jpg|JPG|gif|GIF|png|PNG|avif|AVIF|tiff|TIFF|svg|SVG)/
  // const regex = /[\w\d\W\D]{2,256}\.(jpg|gif|png|avif|tiff|svg)$/i;
  const regex = /^https?:\/\/[^\s?#]+\.(jpe?g|gif|png|avif|tiff|svg)(\?[^\s]*)?$/i;
  const isMatch = regex.test(answer);
  console.log("OK =", isMatch, answer);
  return isMatch ? answer : validateInput();
}
validateInput();
