import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
import {
  ScrollView, StatusBar, StyleSheet, Text, View, TouchableOpacity
} from 'react-native';
import { Characteristic, Descriptor, Service } from 'react-native-ble-plx';
import { Card } from "react-native-elements";
import { ble } from '../BleManager';
import { RootStackParamList } from '../types';
import char_uuids from '../assets/bluetooth-numbers-database/characteristic_uuids.json'
import descriptor_uuids from '../assets/bluetooth-numbers-database/descriptor_uuids.json'

type ServicesNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Services'
>;

type CharacteristicsNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Characteristics'
>;

type Props = {
  characteristic: Characteristic;
  navigation:CharacteristicsNavigationProp;
};
type Descriptor_uuid = typeof descriptor_uuids;
type Char_uuid = typeof char_uuids;
function resolveUUID(uuid:string, src:Descriptor_uuid|Char_uuid){
  const suuid = uuid.slice(4,8);
  const svc = src.find(service=>{
      return service.uuid.toUpperCase() == uuid.toUpperCase() || service.uuid.toUpperCase() == suuid.toUpperCase();
  })
  return svc? svc.name : uuid;
}


const CharCard = ({characteristic, navigation}:Props)=>{
  const [descriptors, setDescriptors] = useState<Array<Descriptor>>([]);
  useEffect(()=>{
    
    (async ()=>{
      try{
        const descriptors = await characteristic.descriptors();
        setDescriptors(descriptors);
        console.log(descriptors);
      }catch(err){
        console.log(JSON.stringify(err, null, 2))
      }
    })();
  },[])

  return (
      <Card>
        <Card.Title>{resolveUUID(characteristic.uuid, char_uuids)}</Card.Title>
        <Card.Divider/>
        <Text>{descriptors.length > 0 ? 'Descriptors:' : 'No descriptors available'}</Text>
        {
          descriptors.map(descriptor=>(
            <Text key={descriptor.id}>{resolveUUID(descriptor.uuid, descriptor_uuids)}</Text>
          ))
        }
      </Card>
  )
}

export default CharCard;