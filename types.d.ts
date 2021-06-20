import { Dispatch } from "react";
import { Device } from "react-native-ble-plx";
import { Action } from "redux";

type RootStackParamList = {
    Home:undefined,
    Services:{deviceId:string},
    Characteristics:{deviceId:string, serviceUUID:string},
    Logs:{deviceId:string},
    ExamineData:{data:string}
}