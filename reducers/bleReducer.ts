import { createSlice } from "@reduxjs/toolkit";

export interface BleState{
    devices:Array<BleDeviceState>;
    scanning:boolean
}
export interface BleService{
    id:number;
    isPrimary:boolean;
    uuid:string;
}
export interface BleDeviceState{
    id:string;
    name?:string;
    mtu?:number;
    rssi?:number;
    services?:Array<BleService>
}
const initialState:BleState={
    devices:[],
    scanning:false
};
interface Action<K=any>{
    type:string,
    payload:K|undefined
}

const bleSlice = createSlice({
    name:"Bluetooth",
    initialState:initialState,
    reducers:{
        addBleDevice:(state, newDevice?:Action<BleDeviceState>)=>{
            if(!newDevice || !newDevice.payload || !newDevice.payload.id) return state;
            const found = state.devices.find(device=>{
                return device.id == newDevice.payload?.id
            })
            if(!found){
                state.devices=[...state.devices, {...newDevice.payload}];
            }
        },
        editBleDevice:(state, newDevice:Action<BleDeviceState>)=>{
            if(!newDevice || !newDevice.payload || !newDevice.payload.id) return state;
            const foundIndex = state.devices.findIndex(device=>{
                return device.id == newDevice.payload?.id
            })
            if(foundIndex >= 0){
                const mergedState = {...state.devices[foundIndex], ...newDevice.payload};
                if(mergedState != state.devices[foundIndex])
                    state.devices[foundIndex] = {...state.devices[foundIndex], ...newDevice.payload};
            }
        },
        clearBleDevices:(state)=>{
            state.devices = [];
        },
        setScanning:(state, value?:Action<boolean>)=>{
            state.scanning = !!(value?.payload);
        }
    }
})

export const {addBleDevice, editBleDevice, clearBleDevices, setScanning} = bleSlice.actions;

export default bleSlice.reducer;