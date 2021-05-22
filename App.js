import Map from './app/screens/map';
import React from 'react';
import store from './app/redux-store/store';
import Search from './app/screens/search';
import Welcome from './app/screens/welcome';
import { Provider } from "react-redux";
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { getUserLocation } from './app/redux-store/locations-reducer';
import { StyleSheet, View, Text} from 'react-native';
import { NativeRouter, Route, Redirect } from "react-router-native";


export default function App() {
  
  useEffect(() => {(async () => await store.dispatch(getUserLocation()))()}, []);

  return (
    <Provider store={store}>
      <NativeRouter>
        <View style={styles.container}>
          <Route path={'/home'} exact component={Welcome}/>
          <Route path={'/map'} exact component={Map}/>
          <Route path={'/search'} exact component={Search}/>
          <Route path="/" exact><Redirect to="/home"/></Route>
          <StatusBar style="dark" />
        </View>
      </NativeRouter>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
});
