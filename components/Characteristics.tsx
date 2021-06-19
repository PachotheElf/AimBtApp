import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet
} from 'react-native';
import { Characteristic } from "react-native-ble-plx";
import { useDispatch } from "react-redux";
import { ble } from "../BleManager";
import { addLog } from "../reducers/bleReducer";
import { RootStackParamList } from "../types";
import CharCard from "./CharCard";

type CharacteristicsRouteProp = RouteProp<RootStackParamList, 'Characteristics'>;

type CharacteristicsNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Characteristics'
>;
type Props = {
  route: CharacteristicsRouteProp;
  navigation: CharacteristicsNavigationProp;
};

const Characteristics = ({route, navigation}:Props)=>{
  const dispatch = useDispatch();
  const {deviceId, serviceUUID} = route.params;
  const [services, setServices] = useState<Array<Characteristic>>([])
  useEffect(()=>{
    (async ()=>{
      try{
        const svcList = await ble.characteristicsForDevice(deviceId,serviceUUID)
        setServices(svcList);
      }catch(err){
        dispatch(addLog({deviceId:deviceId, log:`Error: ${err.message}`}))
        //console.log(JSON.stringify(err, null, 2));
      }
    })();
  },[])

  return (
    <ScrollView style={styles.container}>
      {
        services.map(service=>(
          <CharCard key={service.id} characteristic={service} navigation={navigation}/>
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

export default Characteristics;