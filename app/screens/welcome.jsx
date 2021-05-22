import React, { useState } from 'react';
import { ImageBackground, StyleSheet, Text, View } from "react-native";
import { useHistory } from 'react-router';
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';

const Welcome = () => {

    const History = useHistory();

    return(
        <>
        <ImageBackground
            source={require('../../assets/bg.jpeg')}
            style={styles.bgImg}
        >
            <View style={styles.cover}>
                <Text style={styles.heading}>Welcome</Text>
            </View>
        </ImageBackground>
        <View style={styles.iconContainer}>
            <FontAwesome5Icon 
                name="search-location" 
                onPress={() => History.push({pathname: '/search', state: {active_point: 'destination'}})}
                size={180}
                style={styles.searchIcon}
            />
        </View>
        </>
    )
}

const styles = StyleSheet.create({
    bgImg: {
        height: 300, 
        width: '100%', 
        alignSelf: 'flex-end', 
        resizeMode: 'cover'
    },
    cover: {
        flex: 1, 
        justifyContent: 'flex-end', 
        alignItems: 'center', 
        backgroundColor: 'rgba(0,0,0,0.5)'
    },
    heading: {
        color: '#fff', 
        fontSize: 40, 
        fontWeight: "100", 
        textShadowColor: 'black', 
        textShadowRadius: 15, 
        padding: 20
    },
    iconContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#eee'
    },
    searchIcon: {
        color: '#eee',
        textShadowColor: 'black',
        textShadowRadius: 16,
        elevation: 5,
    }
})

export default Welcome;