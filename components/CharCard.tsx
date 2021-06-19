import { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
import { Text } from 'react-native';
import { Characteristic, Descriptor } from 'react-native-ble-plx';
import { Card } from "react-native-elements";
import { useDispatch } from 'react-redux';
import { resolveUUID } from '../common_functions';
import { addLog } from '../reducers/bleReducer';
import { RootStackParamList } from '../types';

type CharacteristicsNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Characteristics'
>;

type Props = {
  characteristic: Characteristic;
  navigation:CharacteristicsNavigationProp;
};


const CharCard = ({characteristic, navigation}:Props)=>{
  const dispatch = useDispatch();
  const [descriptors, setDescriptors] = useState<Array<Descriptor>>([]);
  useEffect(()=>{
    let isMounted = true;
    (async ()=>{
      try{
        dispatch(addLog({deviceId:characteristic.deviceID, log:`Getting descriptors for characteristic '${resolveUUID(characteristic.uuid, "characteristic")}' in service '${resolveUUID(characteristic.serviceUUID, "service")}'`}))
        const descList = await characteristic.descriptors();
        
        dispatch(addLog({deviceId:characteristic.deviceID, log:`Descriptors for characteristic '${resolveUUID(characteristic.uuid, "characteristic")}' in service '${resolveUUID(characteristic.serviceUUID, "service")}': ${descList.reduce((acc, desc, index)=>{
          return acc + "\n\t\t└>" + resolveUUID(desc.uuid, "descriptor");
        },"")}`}))
        isMounted&&setDescriptors(descList);
        //console.log(descriptors);
      }catch(err){
        dispatch(addLog({deviceId:characteristic.deviceID, log:"Error: " + err.message}))
        //console.log(JSON.stringify(err, null, 2))
      }
    })();
    return ()=>{isMounted = false}
  },[])

  return (
      <Card>
        <Card.Title>{resolveUUID(characteristic.uuid, "characteristic")}</Card.Title>
        <Card.Divider/>
        <Text>{descriptors.length > 0 ? 'Descriptors:' : 'No descriptors available'}</Text>
        {
          descriptors.map(descriptor=>(
            <Text key={descriptor.id}>{resolveUUID(descriptor.uuid, "descriptor")}</Text>
          ))
        }
      </Card>
  )
}

export default CharCard;