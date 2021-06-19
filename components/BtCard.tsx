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
import { BleDeviceState, BleService, BleState, setScanning } from "../reducers/bleReducer";
import service_uuids from '../assets/bluetooth-numbers-database/service_uuids.json'
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

function resolveSvcUUID(uuid:string){
    const svc = service_uuids.find(service=>{
        return service.uuid.toUpperCase() == uuid.toUpperCase();
    })
    return svc? svc.name : uuid;
}

const BtCard = ({bleDevice, navigation}:Props)=>{
    const dispatch = useDispatch();
    const [connect, setConnect] = useState(false);
    const [connecting, setConnecting] = useState(false);
    const [connected, setConnected] = useState(false);
    const [connectState, setConnectState] = useState("Disconnected");
    const [device, setDevice] = useState<Device>();

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
                    setConnecting(false);
                    setConnected(true);
                    setConnectState("Connected!");
                    await device.discoverAllServicesAndCharacteristics()
                    const services = await device.services()
                    console.log(`${device.id} services:`, services)
                }
                catch(err){
                    console.log(JSON.stringify(err, null, 2))
                }
            })
            
        }else{
            if(connecting || connected){
                console.log(`Disconnecting from ${bleDevice.id}...`)
                ble.cancelDeviceConnection(bleDevice.id)
                .then(device=>{
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
            <View style={styles.cardText}>
                <Button title="Logs" disabled={!connected} onPress={()=>{}}/>
                <Button title="Services" disabled={!connected} onPress={()=>{ device && navigation.navigate('Services', {id:device.id})}}/>
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