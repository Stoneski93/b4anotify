import { registerRootComponent } from "expo";

import App from "./App";
import "localstorage-polyfill";

const PARSE_APP_ID = "";
const PARSE_KEY = "";
const PARSE_SERVER_URL = "https://parseapi.back4app.com/";

import * as Parse from "parse";
import AsyncStorage from "@react-native-async-storage/async-storage";

const initializeParse = () => {
  Parse.setAsyncStorage(AsyncStorage);
  Parse.initialize(PARSE_APP_ID, PARSE_KEY);
  Parse.serverURL = PARSE_SERVER_URL;
};

initializeParse();
// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately

registerRootComponent(App);
