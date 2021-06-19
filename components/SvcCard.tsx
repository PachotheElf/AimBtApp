import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
import {
  ScrollView, StatusBar, StyleSheet, Text, View, TouchableOpacity
} from 'react-native';
import { Characteristic, Service } from 'react-native-ble-plx';
import { Card } from "react-native-elements";
import { ble } from '../BleManager';
import { RootStackParamList } from '../types';
import service_uuids from '../assets/bluetooth-numbers-database/service_uuids.json'
import char_uuids from '../assets/bluetooth-numbers-database/characteristic_uuids.json'

type ServicesNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Services'
>;

type Props = {
  service: Service;
  navigation:ServicesNavigationProp;
};
type Svc_uuid = typeof service_uuids;
type Char_uuid = typeof char_uuids;
function resolveUUID(uuid:string, src:Svc_uuid|Char_uuid){
  const suuid = uuid.slice(4,8);
  const svc = src.find(service=>{
      return service.uuid.toUpperCase() == uuid.toUpperCase() || service.uuid.toUpperCase() == suuid.toUpperCase();
  })
  return svc? svc.name : uuid;
}


const SvcCard = ({service, navigation}:Props)=>{
  const [characteristics, setCharacteristics] = useState<Array<Characteristic>>([]);
  useEffect(()=>{
    
    (async ()=>{
      try{
        const charList = await service.characteristics();
        setCharacteristics(charList);
        console.log(charList);
      }catch(err){
        console.log(JSON.stringify(err, null, 2))
      }
    })();
  },[])

  return (
    <TouchableOpacity onPress={()=>{navigation.navigate('Characteristics', {deviceId:service.deviceID, serviceUUID:service.uuid})}}>
      <Card>
        <Card.Title>{resolveUUID(service.uuid, service_uuids)}</Card.Title>
        <Card.Divider/>
        <Text>{characteristics.length > 0 ? 'Characteristics in service:' : 'No characteristics in service!'}</Text>
        {
          characteristics.map(characteristic=>(
            <Text key={characteristic.id}>{resolveUUID(characteristic.uuid, char_uuids)}</Text>
          ))
        }
      </Card>
    </TouchableOpacity>
  )
}

export default SvcCard;