import axios from "axios";

function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getByLink(linkApi, apiKey, ms = 0) {
    axios.defaults.headers.common['X-API-KEY'] = apiKey;
    try {
        await delay(ms)
            return (await axios.get(linkApi)).data;

    } catch (e) {
        console.log(e)
    }
}
