import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
import {
  ScrollView, StatusBar, StyleSheet, Text, View
} from 'react-native';
import { Service } from 'react-native-ble-plx';
import { Card } from "react-native-elements";
import { ble } from '../BleManager';
import { RootStackParamList } from '../types';

type HomeRouteProp = RouteProp<RootStackParamList, 'Services'>;

type HomeNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Services'
>;
type Props = {
  route: HomeRouteProp;
  navigation: HomeNavigationProp;
};

 const Services  = ({route, navigation}:Props)=>{
   const {id} = route.params;
   const [connect, setConnect] = useState(false);
   const [connecting, setConnecting] = useState(false);
   const [connected, setConnected] = useState(false);
   const [connectState, setConnectState] = useState("Disconnected");
   const [services, setServices] = useState<Array<Service>>([])
  useEffect(()=>{
    (async ()=>{
      const isConnected = await ble.isDeviceConnected(id);
      setConnected(!!isConnected);
      connecting && isConnected && setConnecting(false);
    })();
  },[])

  return (
    <View style={styles.container}>
      <Text>Services found: {services.length}</Text>
      <ScrollView>
        {
          services.map(service=>(
          <Card>
            <Card.Title>{service.id}</Card.Title>
            <Card.Divider/>
          </Card>))
        }
      </ScrollView>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
  flex: 1,
  paddingTop: StatusBar.currentHeight,
  },
});
 export default Services;