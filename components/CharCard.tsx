import { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Button, TextInput } from 'react-native';
import base64 from 'react-native-base64';
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
  const [readData, setReadData] = useState<string>("")
  const [writeableData, setWriteableData] = useState<string>("")

  function isWriteable(){
    return characteristic.isWritableWithResponse || characteristic.isWritableWithoutResponse;
  }

  async function writeData(data:string){
    if(!isWriteable()) return;
    try{
      dispatch(addLog({deviceId:characteristic.deviceID, log:`Writing '${writeableData}' to characteristic '${resolveUUID(characteristic.uuid, "characteristic")}' in service '${resolveUUID(characteristic.serviceUUID, "service")}'`}))
      if(characteristic.isWritableWithResponse){
        await characteristic.writeWithResponse(base64.encode(data))
      }else{
        await characteristic.writeWithoutResponse(base64.encode(data));
      }
      dispatch(addLog({deviceId:characteristic.deviceID, log:`Write to characteristic '${resolveUUID(characteristic.uuid, "characteristic")}' in service '${resolveUUID(characteristic.serviceUUID, "service")}' succeeded!`}))
    }catch(err){
      dispatch(addLog({deviceId:characteristic.deviceID, log:err.message}))
    }
  }

  async function doRead(){
    if(!characteristic.isReadable) return;
    try{
      dispatch(addLog({deviceId:characteristic.deviceID, log:`Reading from characteristic '${resolveUUID(characteristic.uuid, "characteristic")}' in service '${resolveUUID(characteristic.serviceUUID, "service")}'`}))

      await characteristic.read();
      console.log(characteristic);

      if(!characteristic.value) return;
      const decodedData = base64.decode(characteristic.value);
      dispatch(addLog({deviceId:characteristic.deviceID, log:`Read '${decodedData}' to characteristic '${resolveUUID(characteristic.uuid, "characteristic")}' in service '${resolveUUID(characteristic.serviceUUID, "service")}' succeeded!`}))
      
      setReadData(decodedData);
    }catch(err){
      dispatch(addLog({deviceId:characteristic.deviceID, log:err.message}))
    }
  }
  
  function startWrite(){
    writeData(writeableData);
  }

  function startRead(){}
  
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
        <View style={styles.cardText}>
          <Text>Writeable: {isWriteable() ? 'Yes' : 'No'}</Text>
          {isWriteable()&&<TextInput style={styles.textInput} placeholder="Data to write" onChangeText={setWriteableData}/>}
          <Button title="Write" disabled={!isWriteable()} onPress={startWrite}/>
        </View>
        <View style={{...styles.cardText}}>
          <Text>With response: {characteristic.isWritableWithResponse ? 'Yes' : 'No'}</Text>
          <Text>Without response: {characteristic.isWritableWithoutResponse ? 'Yes' : 'No'}</Text>
        </View>
        <View style={styles.separator}/>
        <View style={styles.cardText}>
          <Text>Readable: {characteristic.isReadable ? 'Yes' : 'No'}</Text>
          <Button title="Read" disabled={!characteristic.isReadable} onPress={doRead}/>
        </View>
        {
          characteristic.isReadable&&<View style={styles.cardText}>
            <Text>Preview:</Text>
            <Text numberOfLines={1}>{readData}</Text>
            <Button title="Examine" disabled={!readData} onPress={()=>{}}/>
          </View>
        }
        <View style={styles.separator}/>
        <Text>{descriptors.length > 0 ? 'Descriptors:' : 'No descriptors available'}</Text>
        {
          descriptors.map(descriptor=>(
            <Text key={descriptor.id}>{resolveUUID(descriptor.uuid, "descriptor")}</Text>
          ))
        }
      </Card>
  )
}

const styles=StyleSheet.create({
  cardText: {
      flexDirection:'row',
      flex: 1,
      alignItems:'center',
      justifyContent:'space-between'
  },
  separator:{
    marginVertical:5,
    borderBottomWidth:1,
    borderColor:"#EEE"
  },
  textInput:{
    flex:1,
    marginHorizontal:2
  }
})

export default CharCard;