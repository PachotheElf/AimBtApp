import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
import {
  ScrollView, StatusBar, StyleSheet, Text, View
} from 'react-native';
import { Device, Service } from 'react-native-ble-plx';
import { Card } from "react-native-elements";
import { ble } from '../BleManager';
import { RootStackParamList } from '../types';
import SvcCard from './SvcCard';

type ServicesRouteProp = RouteProp<RootStackParamList, 'Services'>;

type ServicesNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Services'
>;
type Props = {
  route: ServicesRouteProp;
  navigation: ServicesNavigationProp;
};

 const Services  = ({route, navigation}:Props)=>{
   const {deviceId: deviceId} = route.params;
   const [services, setServices] = useState<Array<Service>>([])
  useEffect(()=>{
    (async ()=>{
      try{
        const svcList = await ble.servicesForDevice(deviceId)
        setServices(svcList);
      }catch(err){
        console.log(JSON.stringify(err, null, 2));
      }
    })();
  },[])

  return (
    <ScrollView style={styles.container}>
      {
        services.map(service=>(
          <SvcCard key={service.id} service={service} navigation={navigation}/>
        ))
      }
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  container: {
  flex: 1
  },
});
 export default Services;