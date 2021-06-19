import { RouteProp } from "@react-navigation/native";
import React, { Dispatch, useEffect, useState } from "react";
import {
  Text,
  ScrollView,
  StyleSheet
} from 'react-native';
import { connect } from "react-redux";
import { Action } from "redux";
import { BleState } from "../reducers/bleReducer";
import { RootStackParamList } from "../types";


type HomeRouteProp = RouteProp<RootStackParamList, 'Logs'>;
type Props = {
  route: HomeRouteProp;
  bleState:BleState,
  dispatch:Dispatch<Action>
};

const Logs = ({route, bleState}:Props)=>{
  const {deviceId} = route.params;
  const [logs, setLogs] = useState<Array<string>>([]);
  useEffect(()=>{
    const device = bleState.devices.find(device=>{
      return device.id == deviceId;
    })
    if(!device || !device.logs) return;
    setLogs(device.logs)
  },[bleState]) 
  return(
    <ScrollView style={styles.container}>
      {
        logs.map((log, index)=>(
          <Text key={index}>{log}</Text>
        ))
      }
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
  flex: 1,
  },
});

export default connect((state)=>({...state}))(Logs);