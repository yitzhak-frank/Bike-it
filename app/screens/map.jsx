import { connect } from 'react-redux';
import * as Location from 'expo-location';
import AntDesignIcon from 'react-native-vector-icons/AntDesign';
import { useHistory } from 'react-router';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import MapViewDirections from 'react-native-maps-directions';
import { getDirections } from '../google-maps-api/directions';
import { google_api_key } from '../config.json';
import MapView, { Polyline } from 'react-native-maps';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { getAddressFromCoords } from '../google-maps-api/goecode';
import { orderCoords, toTitleCase } from '../services/generalFn'
import React, { useEffect, useState } from 'react';
import { locationsManager, USER_LOCATION } from '../redux-store/locations-reducer';
import { StyleSheet, Text, TextInput, View } from 'react-native';

const Map = ({location: {state: {active_point}}, locations, locationsManager }) => {
    
    const [trip, setTrip]                   = useState({});
    const [routes, setRoutes]               = useState([])
    const [markers, setMarkers]             = useState([]);
    const [inputsVal, setInputsVal]         = useState({});
    const [addresses, setAddresses]         = useState({});
    const [initialRegion, setInitialRegion] = useState({});
    const [preventMarker, setPreventMarker] = useState(false);
    const [activeMarker, setActiveMarker]   = useState({title: 'Destination', description: 'Destination'});

    const History = useHistory();

    useEffect(() => {
        const { user_location: { latitude, longitude }, [active_point]: { lat, lng } } = locations;
        setInitialRegion({latitude, longitude, latitudeDelta: 0.0922, longitudeDelta: 0.0421});
        setTrip({...trip, ['origin']: trip.origin || { latitude, longitude }, [active_point]: {latitude: lat, longitude: lng}});
    }, []);

    useEffect(() => {
        Object.keys(addresses).forEach(address => {
            let { user_location } = locations, address_name;
            addresses[address].length ? { formatted_address: address_name } = addresses[address][0] : address_name = 'Unknown address';
            setInputsVal({
                ...inputsVal, 
                [address]: Object.values(trip[address]).join() === Object.values(user_location).join() ? 'Your location' : address_name
            });
        });
    }, [addresses]);

    useEffect(() => {
        let mounted = true;
        if(mounted) markers.forEach(async marker => {
            const address = await getAddressFromCoords(orderCoords(marker.coordinate));
            if(mounted) setAddresses({...addresses, [marker.title.toLowerCase()]: address});
        });
        return () => { mounted = false };
    }, [markers]);

    useEffect(() => {
        let mounted = true;
        setMarkers(Object.keys(trip).map(point => (
            {title: toTitleCase(point), description: toTitleCase(point), coordinate: trip[point]}
        )));
        if(mounted) (async () => {
            const routes = await getDirections(orderCoords(trip.origin), orderCoords(trip.destination));
            if(routes.status === 'ZERO_RESULTS') return;
            if(mounted) setRoutes(routes)
            console.log(routes)
        })();
        return () => { mounted = false };
    }, [trip]);

    const changePoint = ({nativeEvent: {coordinate}}, title) => {
        locationsManager(title.toLowerCase(), coordinate);
        setTrip({...trip, [title.toLowerCase()]: coordinate});
    }

    return(
        <>
        <Text style={styles.txt}> Touch the map to set {activeMarker.title.toLowerCase()} point </Text>
        <AntDesignIcon 
            name="swap" 
            size={25} 
            style={styles.swapTxt} 
            onPress={() => {
                setPreventMarker(true);
                setActiveMarker({
                    title: activeMarker.title === 'Destination' ? 'Origin' : 'Destination', 
                    description: activeMarker.title === 'Destination' ? 'Origin' : 'Destination'
                });
            }}
        />

        <View style={styles.topContainer}>
            <View style={styles.directionIcon}>
                <AntDesignIcon name="downcircle" size={20} />
                <MaterialCommunityIcon name="ray-start-arrow" size={30} style={[{transform: [{rotate: '90deg'}]}]} />
                <FontAwesomeIcon name="map-marker" size={30} />
            </View>
            <View style={styles.inputsContainer}>
                <TextInput 
                    placeholder="Start Point..." 
                    style={styles.input}
                    value={inputsVal.origin}
                    onFocus={() => {
                        setActiveMarker({title: 'Origin', description: 'Origin'});
                        History.push({pathname: '/search', state: {active_point: 'origin', inputVal: inputsVal.origin}});
                    }}
                />
                <TextInput 
                    placeholder="Destination..." 
                    style={styles.input}
                    value={inputsVal.destination}
                    onFocus={() => {
                        setActiveMarker({title: 'Destination', description: 'Destination'});
                        History.push({pathname: '/search', state: {active_point: 'destination', inputVal: inputsVal.destination}});
                    }}
                />
            </View>
            <AntDesignIcon 
                name="swap" 
                size={25} 
                color="#000"
                style={[styles.swapTrip, {transform: [{rotate: '90deg'}]}]}
                onPress={() => {
                    setPreventMarker(true);
                    setTrip({ origin: trip.destination, destination: trip.origin })
                }}
            />
        </View>

        {initialRegion.latitude ? <MapView 
            showsUserLocation={true}
            showsMyLocationButton={true}
            followsUserLocation={true}
            style={{flex: 1}}
            initialRegion={initialRegion}
            onUserLocationChange={
                ({nativeEvent: {coordinate: {latitude, longitude}}}) => {
                    setInitialRegion({...initialRegion, latitude, longitude});
                    locationsManager(USER_LOCATION, {latitude, longitude});
                }
            }
            onPress={(e) => !preventMarker ? changePoint(e, activeMarker.title): setPreventMarker(false)}
        >
            {markers.map(marker => <MapView.Marker
                key={marker.title}
                title={marker.title}
                coordinate={marker.coordinate}
                description={marker.description}
            />)}

            {routes.length ? routes.map((route, i) => {
                const {routes: [{legs: [{start_location, end_location, travel_mode}]}]} = route;
                return <MapViewDirections
                    key={i}
                    origin={{latitude: start_location.lat, longitude: start_location.lng}}
                    destination={{latitude: end_location.lat, longitude: end_location.lng}}
                    apikey={google_api_key}
                    strokeWidth={4}
                    strokeColor="#38f"
                    mode={travel_mode}
                />}) 
            : null}

        </MapView>
        : <MapView style={{flex: 1}}/>}
        </>
    );
}

const styles = StyleSheet.create({
    txt: {
        textAlign: 'center',
        position: 'absolute',
        top: 35,
        zIndex: 2,
        width: '100%',
        fontWeight: 'bold',
        color: 'white',
        textShadowColor: '#000',
        textShadowRadius: 16,
        
    },
    swapTxt: {
        position: 'absolute',
        top: 33,
        right: '5%',
        zIndex: 2,
        color: 'white',
        textShadowColor: '#000',
        textShadowRadius: 16,
    },
    swapTrip: {
        zIndex: 2,
        alignSelf: 'center',
    },
    topContainer: {
        position: 'absolute',
        top: 60,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-evenly'
    },
    inputsContainer: {
        alignItems: 'center'
    },
    input: {
        backgroundColor: 'rgba(255, 255, 255, 1)', 
        color: '#000', 
        paddingLeft: 10, 
        paddingRight: 10,
        shadowColor: 'black',
        shadowRadius: 6,
        shadowOffset: {height: 0, width: 2},
        elevation: 1,
        zIndex: 3,
        borderRadius: 5,
        height: 45,
        width: 250,
        margin: 5
    },
    directionIcon: {
        zIndex: 2,
        justifyContent: 'center',
        alignItems: 'center'
    }
})

const mapStaeToProps = state => ({locations: state.locations});
const mapDispatchToProps = dispatch => ({locationsManager: (type, location) => dispatch(locationsManager(type, location))})

export default connect(mapStaeToProps, mapDispatchToProps)(Map);