import { orderCoords } from '../services/generalFn';
import { getDistance } from './distance';
import { google_api_key } from '../config.json';

export const getDirections = async (start, end) => {
    try {
        const url   = `https://maps.googleapis.com/maps/api/directions/json?origin=${start}&destination=${end}&mode=transit&key=${google_api_key}`;
        const resp  = await fetch(url);
        const respJ = await resp.json();

        if(respJ.status === 'ZERO_RESULTS') return {status: 'ZERO_RESULTS'};
        
        const {routes: [{legs: [{steps}]}]} = respJ;
        const newSteps = [];
        let bike = {}; 

        for(let step of steps) {
            if(step.travel_mode === 'WALKING') {
                bike = {start: step.start_location, ...bike, end: step.end_location};
            } else {
                if(step.transit_details.line.short_name < 100) {
                    bike = {start: step.start_location, ...bike, end: step.end_location};
                } else {
                    const { distance: { value } } = await getDistance(orderCoords(step.start_location), orderCoords(step.end_location));
                    if(value / 1000 > 10) {
                        if(bike.start) {
                            newSteps.push(await getNewDirections(orderCoords(bike.start), orderCoords(bike.end), 'bicycling'));
                            bike = {};
                        }
                        newSteps.push(await getNewDirections(orderCoords(step.start_location), orderCoords(step.end_location), 'transit'));
                    }
                }
            }
        };
        if(bike.start) newSteps.push(await getNewDirections(orderCoords(bike.start), orderCoords(bike.end), 'bicycling'));
        
        return newSteps;
    } catch(err) { 
        console.log(err) 
    }
}

const getNewDirections = async (start, end, mode) => {
    try {
        const url   = `https://maps.googleapis.com/maps/api/directions/json?origin=${start}&destination=${end}&mode=${mode}&key=${google_api_key}`;
        const resp  = await fetch(url);
        const respJ = await resp.json();
        return respJ;
    } catch(err) {
        console.log(err) 
    }
}
