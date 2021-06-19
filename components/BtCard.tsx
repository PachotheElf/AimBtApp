import React, { useEffect, useState } from "react";
import {
    Button,
    Text,
    View,
    StyleSheet
} from 'react-native';
import { Card } from "react-native-elements";
import { useDispatch } from "react-redux";
import { ble } from "../BleManager";
import { addLog, BleDeviceState, BleService, BleState, setScanning } from "../reducers/bleReducer";
import { Device } from "react-native-ble-plx";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types";

type HomeNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Home'
>;
type Props = {
  navigation: HomeNavigationProp;
  bleDevice:BleDeviceState;
};

const BtCard = ({bleDevice, navigation}:Props)=>{
    const dispatch = useDispatch();
    const [connect, setConnect] = useState(false);
    const [connecting, setConnecting] = useState(false);
    const [connected, setConnected] = useState(false);
    const [connectState, setConnectState] = useState("Disconnected");
    const [device, setDevice] = useState<Device>();
    const [services, setServices] = useState<number>(0);

    useEffect(()=>{

        ble.devices([bleDevice.id]).then(devices=>{
            const found = devices.find(dvc=>{ return dvc.id == bleDevice.id})
            if(found) setDevice(found);
        })
        
        const onDisconnectSub = ble.onDeviceDisconnected(bleDevice.id, (err, device)=>{
            if(err){
                console.log(err);
                return;
            }
            console.log(`Disconnected from ${device? device.id: ''}`)
            dispatch(addLog({deviceId:bleDevice.id, log:`Disconnected from ${device? device.id: ''}`}))
            setConnectState("Disconnected!");
            setConnecting(false);
            setConnected(false);
        })
        return ()=>{onDisconnectSub.remove()};
    })

    useEffect(()=>{
        (async ()=>{
            const isConnected = await device?.isConnected();
            setConnected(!!isConnected);
            connecting && isConnected && setConnecting(false);
        })();
    }, [device])

    useEffect(()=>{
        if(connect){
            if(connecting || connected) return;
            dispatch(setScanning(false));
            setConnecting(true);
            setConnectState("Connecting...")
            console.log(`Connecting to ${bleDevice.id}...`);
            dispatch(addLog({deviceId:bleDevice.id, log:`Connecting to ${bleDevice.id}...`}))
            ble.isDeviceConnected(bleDevice.id)
            .then(async isConnected=>{
                if(isConnected){
                    setConnecting(false);
                    setConnected(true);
                    setConnectState("Connected!");
                    return;
                }
                try{
                    const device = await ble.connectToDevice(bleDevice.id, {timeout:10000})
                    console.log(`Connected to ${device.id}!`);
                    dispatch(addLog({deviceId:bleDevice.id, log:`Connected to ${bleDevice.id}!`}))
                    setConnecting(false);
                    setConnected(true);
                    setConnectState("Connected!");
                    dispatch(addLog({deviceId:bleDevice.id, log:`Discovering all services and characteristics...`}))
                    await device.discoverAllServicesAndCharacteristics();
                    dispatch(addLog({deviceId:bleDevice.id, log:`Services and characteristics discovered!`}))
                    setServices((await device.services()).length)
                }
                catch(err){
                    console.log(JSON.stringify(err, null, 2))
                    setConnected(false);
                    setConnecting(false);
                    setConnectState("Disconnected");
                }
            })
            
        }else{
            if(connecting || connected){
                console.log(`Disconnecting from ${bleDevice.id}...`)
                ble.cancelDeviceConnection(bleDevice.id)
                .then(device=>{
                    setConnected(false);
                    setConnecting(false);
                    setConnectState("Disconnected");
                })
                .catch(err=>{
                    console.log(JSON.stringify(err, null, 2))
                })
            }
        }
    }, [connect])
    return(
        <Card>
            <Card.Title>{bleDevice.name ? bleDevice.name : bleDevice.id}</Card.Title>
            <Card.Divider/>
            <Text># Services in device: {services}</Text>
            <View style={styles.cardText}>
                <Button title="Logs" disabled={!bleDevice.logs || bleDevice.logs.length <= 0} onPress={()=>{navigation.navigate("Logs", {deviceId:bleDevice.id})}}/>
                <Button title="Services" disabled={services <= 0} onPress={()=>{ navigation.navigate('Services', {deviceId:bleDevice.id})}}/>
            </View>
            <View style={styles.cardText}>
                <Text>{bleDevice.id}</Text>
                <Text>{connectState}</Text>
            </View>
            <View style={styles.cardText}>
                <Text>rssi: {bleDevice.rssi? `${bleDevice.rssi}dbi` : 'N/A'}</Text>
                <Text>mtu: {bleDevice.mtu? bleDevice.mtu : 'N/A'}</Text>
            </View>
            <Button
                title={connecting || connected?'Disconnect':'Connect'}
                onPress={()=>{setConnect(!(connecting || connected))}}/>
        </Card>
    );
}

const styles=StyleSheet.create({
    cardText: {
        flexDirection:'row',
        flex: 1,
        justifyContent:'space-between'
    },
  })

export default BtCard;