/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

 import React, { Dispatch, useState } from 'react';
import { useEffect } from 'react';
import {
  Button,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  StatusBar,
  Text
} from 'react-native';
import { BleManager, Device } from 'react-native-ble-plx';
import {
  Header
} from 'react-native-elements';
import { connect } from 'react-redux';
import { Action } from 'redux';
import { addBleDevice, setScanning, BleState, clearBleDevices } from './reducers/bleReducer';
import BtCard from './components/BtCard';
import { ble } from './BleManager';


 const App  = ({bleState, dispatch}:{bleState:BleState, dispatch:Dispatch<Action>})=>{

  useEffect(()=>{
    console.log(JSON.stringify(bleState, undefined, 2));
  },[bleState.devices])
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
    <SafeAreaView style={styles.container}>
      <Header 
      leftComponent={{text:"BT App", style:{
        fontWeight:'bold',
        color:'#ddd',
      }}}
      rightComponent={
        <Button 
          title={bleState.scanning?'Stop':'Scan'}
          onPress={()=>{setScan(!bleState.scanning)}}/>
      }/>
      <Text>Devices found: {bleState.devices.length}</Text>
      <ScrollView>
        {
          bleState.devices.map(device=><BtCard key={device.id} bleDevice={device} bleState={bleState}/>)
        }
      </ScrollView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
  flex: 1,
  paddingTop: StatusBar.currentHeight,
  },
});

 const mapStateToProps:(state:any)=>any = (state) => ({
  ...state,
});
 export default connect(mapStateToProps)(App);
