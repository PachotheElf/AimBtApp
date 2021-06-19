import { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { Characteristic, Service } from 'react-native-ble-plx';
import { Card } from "react-native-elements";
import { useDispatch } from 'react-redux';
import { resolveUUID } from '../common_functions';
import { addLog } from '../reducers/bleReducer';
import { RootStackParamList } from '../types';

type ServicesNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Services'
>;

type Props = {
  service: Service;
  navigation:ServicesNavigationProp;
};

const SvcCard = ({service, navigation}:Props)=>{
  const [characteristics, setCharacteristics] = useState<Array<Characteristic>>([]);
  const dispatch = useDispatch();

  useEffect(()=>{
    (async ()=>{
      try{
        dispatch(addLog({deviceId:service.deviceID, log:`Getting characteristics for service ${resolveUUID(service.uuid, "service")}`}))
        const charList = await service.characteristics();
        dispatch(addLog({deviceId:service.deviceID, log:`Characteristics for service '${resolveUUID(service.uuid, "service")}': ${charList.reduce((acc, chara, index)=>{
          return acc + "\n\t\t└>" + resolveUUID(chara.uuid, "characteristic");
        },"")}`}))
        setCharacteristics(charList);
        //console.log(charList);
      }catch(err){
        dispatch(addLog({deviceId:service.deviceID, log:`Error: ${err.message}`}))
        //console.log(JSON.stringify(err, null, 2))
      }
    })();
  },[])

  return (
    <TouchableOpacity onPress={()=>{navigation.navigate('Characteristics', {deviceId:service.deviceID, serviceUUID:service.uuid})}}>
      <Card>
        <Card.Title>{resolveUUID(service.uuid, "service")}</Card.Title>
        <Card.Divider/>
        <Text>{characteristics.length > 0 ? 'Characteristics in service:' : 'No characteristics in service!'}</Text>
        {
          characteristics.map(characteristic=>(
            <Text key={characteristic.id}>{resolveUUID(characteristic.uuid, "characteristic")}</Text>
          ))
        }
      </Card>
    </TouchableOpacity>
  )
}

export default SvcCard;