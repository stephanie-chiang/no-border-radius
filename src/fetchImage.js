export async function fetchImage(imageUrl) {
    const response = await fetch(imageUrl);
    if (response.status !== 200) {
        console.log(`Error status: ${response.status}`);

        if (response.body && !response.body.locked){
            await response.body.cancel();
        }
        return;
    }
    return response;
}