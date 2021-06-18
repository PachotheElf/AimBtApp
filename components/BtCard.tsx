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
import { editBleDevice, BleDeviceState, BleService, BleState, setScanning } from "../reducers/bleReducer";

const BtCard = ({bleDeviceState, bleState}:{bleDeviceState:BleDeviceState, bleState:BleState})=>{
    const dispatch = useDispatch();
    const [connect, setConnect] = useState(false);
    const [connectState, setConnectState] = useState("Disconnected");

    useEffect(()=>{
        
        const onDisconnectSub = ble.onDeviceDisconnected(bleDeviceState.id, (err, device)=>{
            setConnectState("Disconnected!");
            setConnect(false);
        })
        return ()=>{onDisconnectSub.remove()};
    })
    const tryConnect = (newConnectState:boolean)=>{
        setConnect(newConnectState);
        
        if(newConnectState){
            if(bleState.scanning){
                ble.stopDeviceScan();
                dispatch(setScanning(false));
            }
            
            console.log("Connecting to", bleDeviceState.id);
            setConnectState("Connecting...")
            ble.connectToDevice(bleDeviceState.id)
            .then((data)=>{
                
                setConnectState("Connected!")
                console.log("Connected to: ", {...data})
                ble.discoverAllServicesAndCharacteristicsForDevice(bleDeviceState.id)
                .then((data)=>{
                    console.log("Services and chars:", {...data})
                    ble.servicesForDevice(bleDeviceState.id)
                    .then((services)=>{
                        console.log("Services:", services)
                        dispatch(editBleDevice({
                            id:bleDeviceState.id,
                            services:services.map<BleService>(svc=>{
                                return {
                                    id:svc.id,
                                    isPrimary:svc.isPrimary,
                                    uuid:svc.uuid,
                                }
                            })
                        }))
                    })
                })
                .catch(err=>{
                    console.log("Failed to discover: ", JSON.stringify(err));
                })
            }).catch(err=>{
                console.log("Failed to connect: ", JSON.stringify(err));
                setConnectState("Failed to connect")
                setConnect(false);
            })
        }else{
            setConnectState("Disconnected!")
            ble.cancelDeviceConnection(bleDeviceState.id).catch(console.log);
        }
    }
    return(
        <Card>
            <Card.Title>{bleDeviceState.name ? bleDeviceState.name : bleDeviceState.id}</Card.Title>
            <Card.Divider/>
            <View style={styles.cardText}>
                <Text>{bleDeviceState.id}</Text>
                <Text>{connectState}</Text>
            </View>
            <View style={styles.cardText}>
                <Text>rssi: {bleDeviceState.rssi? `${bleDeviceState.rssi}dbi` : 'N/A'}</Text>
                <Text>mtu: {bleDeviceState.mtu? bleDeviceState.mtu : 'N/A'}</Text>
            </View>
            <Button
                title={connect?'Disconnect':'Connect'}
                onPress={()=>{tryConnect(!connect)}}/>
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