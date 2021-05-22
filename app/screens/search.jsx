import FeatherIcon from 'react-native-vector-icons/Feather';
import { connect } from 'react-redux';
import { getPlaces } from '../google-maps-api/places';
import { useHistory } from 'react-router';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import { getDistance } from '../google-maps-api/distance';
import { orderCoords } from '../services/generalFn'
import { locationsManager } from '../redux-store/locations-reducer';
import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableNativeFeedback, View } from 'react-native';

const Search = ({location: {state: {active_point, inputVal}}, locations, locationsManager}) => {
    
    const [value, setValue]     = useState(inputVal);
    const [options, setOptions] = useState([]);

    const History = useHistory();
    
    useEffect(() => {
        let mounted = true;
        if(mounted) (async () => {
            if(!value) return setOptions([]);
            const places = await getPlaces(value.replace(/ +/g, '%20'));
            const { user_location } = locations;

            if(places.length) for (let place of places) {
                const { geometry: { location } } = place;
                const { distance: { value } }    = await getDistance(orderCoords(location), orderCoords(user_location));
                place.distatce = (value / 1000).toFixed();
            }
            setOptions(places);
        })();
        return () => { mounted = false };
    }, [value]);

    return(
        <View style={{flex: 1}}>
            <View style={styles.inputContainer}>
                <TouchableNativeFeedback>
                    <FeatherIcon
                        name="arrow-left-circle"
                        size={25}
                        style={{}}
                        onPress={() => History.goBack()}
                    />
                </TouchableNativeFeedback>
                <TextInput 
                    placeholder="Search a place..."
                    style={styles.input}
                    onChangeText={setValue}
                    value={value}
                />
                <TouchableNativeFeedback>
                    <FeatherIcon
                        name="x-circle"
                        size={25}
                        style={{display: value ? 'flex' : 'none'}}
                        onPress={() => setValue('')}
                    />
                </TouchableNativeFeedback>
            </View>
            <ScrollView style={styles.options}>
                {options.map((option, i) => {
                    const { name, formatted_address, distatce, geometry: { location } } = option;
                    return (<TouchableNativeFeedback
                        key={i}
                        onPress={() => {
                            locationsManager(active_point, location)
                            History.push({pathname: '/map', state: {active_point}})
                        }}
                    >
                        <View style={styles.option}>
                            <View style={styles.markerIconContainer}>
                                <FontAwesomeIcon name="map-marker" size={30}/>
                                {distatce ? <Text style={styles.distance}>{distatce + ' km'}</Text>: null}
                            </View>
                            <ScrollView style={{width: 100}}>
                                <Text style={styles.optionName}>{name}</Text>
                                <Text style={styles.optionAddress}>{formatted_address}</Text>
                            </ScrollView>
                        </View>
                    </TouchableNativeFeedback>)
                })}
                <View style={{height: 70}} />
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    inputContainer: {
        top: 40,
        marginLeft: '5%',
        marginRight: '5%',
        paddingRight: 10,
        paddingLeft: 10,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 1)', 
        shadowColor: 'silver',
        shadowRadius: 6,
        shadowOffset: {height: 0, width: 2},
        elevation: 5,
        borderRadius: 25,
        height: 45,
        width: '90%',
        margin: 5,
    },
    input: {
        flex: 1,
        color: '#000', 
        paddingRight: 10,
        paddingLeft: 10,
    },
    options: {
        top: 60
    },
    option: {
        width: '90%',
        margin: 5,
        marginLeft: '5%',
        marginRight: '5%',
        padding: 20,
        borderRadius: 10,
        borderColor: '#ddd',
        borderWidth: 1,
        borderStyle: 'solid',
        flexDirection: 'row',
        alignItems: 'center'
        
    },
    markerIconContainer: {
        alignItems: 'center',
        marginRight: 20,
    },
    distance: {
        fontWeight: 'bold'
    },
    optionName: {
        fontWeight: 'bold',
        marginBottom: 5,
    },
    optionAddress: {
    }
});

const mapStaeToProps = state => ({locations: state.locations})
const mapDispatchToProps = dispatch => ({locationsManager: (type, location) => dispatch(locationsManager(type, location))})

export default connect(mapStaeToProps, mapDispatchToProps)(Search);