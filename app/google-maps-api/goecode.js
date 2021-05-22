import { google_api_key } from '../config.json';

export const getAddressFromCoords = async (coords) => {
    try {
        const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coords}&key=${google_api_key}`;
        const resp = await fetch(url);
        const { results } = await resp.json();
        return results;
    } catch(err) { 
        console.log(err) 
    }
}