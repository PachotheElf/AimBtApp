import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React from "react";
import {
  Image, StyleSheet, Text, View
} from 'react-native';
import { RootStackParamList } from "../types";

type ExamineDataRouteProp = RouteProp<RootStackParamList, 'ExamineData'>;

type ExamineDataNavigationProp = StackNavigationProp<
  RootStackParamList,
  'ExamineData'
>;
type Props = {
  route: ExamineDataRouteProp;
  navigation: ExamineDataNavigationProp;
};

const regex = /^https?:\/\/(?:[a-z0-9\-]+\.)+[a-z]{2,6}(?:\/[^/#?]+)+\.(?:jpg|gif|png)$/;
const ExamineData = ({route, navigation}:Props)=>{
  const {data} = route.params;
  function isJpgUri(){
    const test = new RegExp(regex, "i")
    return test.test(data);
  }
  return (
    <View style={styles.container}>
        {isJpgUri()?<Image style={styles.image} source={{uri:data}}/>
        :<Text>{data}</Text>}
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent:"center",
    alignItems:"center",
    width:"100%",
    height:"100%"
  },
  image:{
    height:"50%",
    width:"50%"
  }
});

export default ExamineData;