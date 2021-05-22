import { google_api_key } from '../config.json';

export const getPlaces = async (address) => {
    try {
        const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?inputtype=textquery&input=${address}&key=${google_api_key}`;
        const resp = await fetch(url);
        const { results } = await resp.json();
        return results;
    } catch(err) { 
        console.log(err) 
    }
}