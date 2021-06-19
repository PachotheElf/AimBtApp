import { Dispatch } from "react";
import { Device } from "react-native-ble-plx";
import { Action } from "redux";

type RootStackParamList = {
    Home:undefined,
    Services:{id:string}
}