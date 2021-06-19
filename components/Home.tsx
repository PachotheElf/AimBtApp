import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { Dispatch, useEffect } from 'react';
import {
  ScrollView, StatusBar, StyleSheet, Text, View
} from 'react-native';
import { connect } from 'react-redux';
import { Action } from 'redux';
import BtCard from '../components/BtCard';
import { BleState } from '../reducers/bleReducer';
import { RootStackParamList } from '../types';

type HomeRouteProp = RouteProp<RootStackParamList, 'Home'>;

type HomeNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Home'
>;
type Props = {
  route: HomeRouteProp;
  navigation: HomeNavigationProp;
  bleState:BleState;
  dispatch:Dispatch<Action>;
};

 const Home  = ({bleState, dispatch, navigation}:Props)=>{
  useEffect(()=>{
    console.log(JSON.stringify(bleState, undefined, 2));
  },[bleState.devices])

  return (
    <View style={styles.container}>
      <Text>Devices found: {bleState.devices.length}</Text>
      <ScrollView>
        {
          bleState.devices.map(device=><BtCard key={device.id} bleDevice={device} navigation={navigation}/>)
        }
      </ScrollView>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
  flex: 1,
  },
});
 export default connect(state=>({...state}))(Home);