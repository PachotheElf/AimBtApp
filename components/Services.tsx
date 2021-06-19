import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
import {
  ScrollView, StatusBar, StyleSheet, Text, View
} from 'react-native';
import { Device, Service } from 'react-native-ble-plx';
import { Card } from "react-native-elements";
import { useDispatch } from 'react-redux';
import { ble } from '../BleManager';
import { resolveUUID } from '../common_functions';
import { addLog } from '../reducers/bleReducer';
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
   const dispatch = useDispatch();
   const {deviceId: deviceId} = route.params;
   const [services, setServices] = useState<Array<Service>>([])
   const [lastError, setLastError] = useState<string>();
  useEffect(()=>{
    (async ()=>{
      try{
        dispatch(addLog({deviceId:deviceId, log:`Querying services...`}))
        const svcList = await ble.servicesForDevice(deviceId)
        dispatch(addLog({deviceId:deviceId, log:`Services available: ${svcList.reduce((acc, svc)=>{
          return acc + "\n\t\t└>" +resolveUUID(svc.uuid, "service");
        },"")}`}))
        setServices(svcList);
        setLastError(undefined);
      }catch(err){
        dispatch(addLog({deviceId:deviceId, log:err.message}))
        setLastError("Error: " + err.message);
      }
    })();
  },[])

  return (
    <ScrollView style={styles.container}>
      {
        !lastError ? services.map(service=>(
          <SvcCard key={service.id} service={service} navigation={navigation}/>
        ))
        : <Text>{lastError}</Text>
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