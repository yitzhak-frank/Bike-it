import { google_api_key } from '../config.json';

export const getDistance = async (start, end) => {
    try {
        const url = `https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=${start}&destinations=${end}&key=${google_api_key}`;
        
        const resp = await fetch(url);
        const { rows: [{ elements: [result] }] } = await resp.json();

        return result;
    } catch(err) { 
        console.log(err) 
    }
}