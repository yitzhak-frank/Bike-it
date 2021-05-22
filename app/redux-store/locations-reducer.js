import * as Location from 'expo-location';

export const ORIGIN = 'origin', DESTINATION = 'destination', USER_LOCATION = 'user_location';

const initLocationsState = { origin: {}, destination: {}, user_location: {}, error: undefined };

export const locationsRrducer = (state = initLocationsState, action) => {
    switch(action.type) {
        case ORIGIN:        return { ...state, origin:        action.payload };
        case DESTINATION:   return { ...state, destination:   action.payload };
        case USER_LOCATION: return { ...state, user_location: action.payload };
        default:            return state;
    }
}

export const getUserLocation = () => {
    return async (dispatch) => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if(status !== 'granted') await Location.requestForegroundPermissionsAsync();
            
            const { coords: { latitude, longitude } } = await Location.getCurrentPositionAsync({});
            dispatch({type: USER_LOCATION, payload: { latitude, longitude }});
        } catch(error) {
            dispatch({type: USER_LOCATION, payload: {}, error});
        }

    }
}

export const locationsManager = (type, payload) => ({type, payload});