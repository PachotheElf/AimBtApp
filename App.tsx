
 import { RouteProp } from '@react-navigation/native';
 import { StackNavigationProp } from '@react-navigation/stack';
 import React, { Dispatch, useEffect } from 'react';
 import {
   Button,
   View,
   ScrollView, StatusBar, StyleSheet, Text
 } from 'react-native';
 import {
   Header
 } from 'react-native-elements';
 import { connect, useDispatch } from 'react-redux';
 import { ble } from './BleManager';

 import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Action } from 'redux';
import Home from './components/Home';
import { RootStackParamList } from './types';
import { addBleDevice, BleState, clearBleDevices, setScanning } from './reducers/bleReducer';
import Services from './components/Services';
import Characteristics from './components/Characteristics'
import Logs from './components/Logs';


export const RootStack = createStackNavigator<RootStackParamList>();

 const App  = ({bleState, dispatch}:{bleState:BleState, dispatch:Dispatch<Action>})=>{

  function setScan(scanState:boolean){
    dispatch(setScanning(scanState));
    if(scanState){
      console.log("Scan started.");
      dispatch(clearBleDevices());
      ble.startDeviceScan(null, null, (err, device)=>{
        if(err){
          console.log(err);
          return;
        }
        if(!device){
          console.log("No device after scan.")
          return;
        }
        dispatch(addBleDevice({
          id:device.id,
          name:device.name,
          rssi:device.rssi,
          mtu:device.mtu,
          manufacturer:device.manufacturerData
        }));
      })
    }else{
      console.log("Scan stopped.");
      ble.stopDeviceScan();
    }
  }

  return (
    <NavigationContainer>
      <RootStack.Navigator initialRouteName="Home">
        <RootStack.Screen 
          name="Home"
          component={Home}
          options={{
            title:"AimBtApp",
            headerRight:()=><Button 
            title={bleState.scanning?'Stop':'Scan'}
            onPress={()=>{setScan(!bleState.scanning)}}/>
          }}
        />
        <RootStack.Screen
          name="Services"
          component={Services}/>
        <RootStack.Screen
          name="Characteristics"
          component={Characteristics}/>
        <RootStack.Screen
          name="Logs"
          component={Logs}/>
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

 export default connect(state=>({...state}))(App);
