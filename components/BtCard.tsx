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
import { InteractionManager } from "react-native";

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
    const [connectOnCreate, setConnectOnCreate] = useState(false);
    const [connect, setConnect] = useState(false);
    const [connecting, setConnecting] = useState(false);
    const [connected, setConnected] = useState(false);
    const [connectState, setConnectState] = useState("Disconnected");
    const [device, setDevice] = useState<Device>();
    const [services, setServices] = useState<number>(0);
    

    function tryConnect(){
        setConnect(!connect);
    }

    function navigateLogs(){
        navigation.navigate("Logs", {deviceId:bleDevice.id})
    }

    function navigateServices(){
        navigation.navigate('Services', {deviceId:bleDevice.id})
    }

    useEffect(()=>{
        let isMounted = true;
        ble.devices([bleDevice.id]).then(devices=>{
            const found = devices.find(dvc=>{ return dvc.id == bleDevice.id})
            if(found && isMounted) setDevice(found);
        });
        return ()=>{isMounted = false;}
    }, [])

    useEffect(()=>{
        let isMounted = true;
        if(!connectOnCreate){
            setConnectOnCreate(true);
            return;
        }
        if(connecting || connected){
            //console.log(`Disconnecting from ${bleDevice.id}...`)
            ble.cancelDeviceConnection(bleDevice.id)
            .then(device=>{
                isMounted&&setConnected(false);
                isMounted&&setConnecting(false);
                isMounted&&setConnectState("Disconnected");
                dispatch(addLog({deviceId:bleDevice.id, log:`Disconnected from ${bleDevice.id}`}))
            })
            .catch(err=>{
                dispatch(addLog({deviceId:bleDevice.id, log:err.message}))
                //console.log(JSON.stringify(err, null, 2))
            })
            return;
        }
        dispatch(setScanning(false));
        isMounted&&setConnecting(true);
        isMounted&&setConnectState("Connecting...")
        //console.log(`Connecting to ${bleDevice.id}...`);
        dispatch(addLog({deviceId:bleDevice.id, log:`Connecting to ${bleDevice.id}...`}))
        ble.isDeviceConnected(bleDevice.id)
        .then(async isConnected=>{
            if(isConnected){
                isMounted&&setConnecting(false);
                isMounted&&setConnected(true);
                isMounted&&setConnectState("Connected!");
                return;
            }
            try{
                const device = await ble.connectToDevice(bleDevice.id, {timeout:10000})
                //console.log(`Connected to ${device.id}!`);
                dispatch(addLog({deviceId:bleDevice.id, log:`Connected to ${bleDevice.id}!`}))
                isMounted&&setConnecting(false);
                isMounted&&setConnected(true);
                isMounted&&setConnectState("Connected!");
                dispatch(addLog({deviceId:bleDevice.id, log:`Discovering services and characteristics...`}))
                await device.discoverAllServicesAndCharacteristics();
                dispatch(addLog({deviceId:bleDevice.id, log:`Services and characteristics discovered!`}))
                const serviceAmount = (await device.services()).length
                dispatch(addLog({deviceId:bleDevice.id, log:`${serviceAmount} service${serviceAmount == 1 ? '' : 's'} available.`}))
                setServices(serviceAmount)
            }
            catch(err){
                dispatch(addLog({deviceId:bleDevice.id, log:err.message}))
                //console.log(JSON.stringify(err, null, 2))
                isMounted&&setConnected(false);
                isMounted&&setConnecting(false);
                isMounted&&setConnectState("Disconnected");
            }
        })
        return ()=>{isMounted = false}
    }, [connect])
    return(
        <Card>
            <Card.Title>{bleDevice.name ? bleDevice.name : bleDevice.id}</Card.Title>
            <Card.Divider/>
            <Text># Services in device: {services}</Text>
            <View style={styles.cardText}>
                <Button title="Logs" disabled={!bleDevice.logs || bleDevice.logs.length <= 0} onPress={navigateLogs}/>
                <Button title="Services" disabled={services <= 0} onPress={navigateServices}/>
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
                onPress={tryConnect}/>
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