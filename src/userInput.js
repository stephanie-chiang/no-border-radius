import readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '>',
})

function resolveInput(urlPrompter) {
    return new Promise(resolve => {
        rl.question(urlPrompter, resolve)
    })
}

async function getUserInput() {
    const answer = await resolveInput("Input the url of your image: ");
    return answer;
}

export async function getAndValidateInput() {
    const answer = await getUserInput();
    const regex = /^https?:\/\/[^\s?#]+\.(jpe?g|gif|png|avif|tiff|svg|webp)([^?\s]*)?$/i;
    const isMatch = regex.test(answer);
    if (!isMatch) {
        console.log("Oops! Your input appears invalid. Only images with file-ending " +
            "jpg, png, gig, avif, tiff, svg and webp are accepted. \n")
        return getAndValidateInput();
    }
    return answer;
}