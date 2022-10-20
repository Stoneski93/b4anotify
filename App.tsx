import {
  Button,
  EventSubscription,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import * as Parse from "parse";

const channelId = "guideChannel";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>("");
  const [notification, setNotification] =
    useState<Notifications.Notification | null>(null);
  const notificationListener = useRef();
  const responseListener = useRef<any>();

  useEffect(() => {
    registerForPushNotificationsAsync().then((token) => {
      setExpoPushToken(token);
      setupInstallation(token);
    });

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
        console.log({ notification });
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(response);
      });

    return () => {
      Notifications.removeNotificationSubscription(
        notificationListener.current
      );
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "space-around",
      }}
    >
      <Text>Your expo push token: {expoPushToken}</Text>
      <View style={{ alignItems: "center", justifyContent: "center" }}>
        <Text>
          Title: {notification && notification.request.content.title}{" "}
        </Text>
        <Text>Body: {notification && notification.request.content.body}</Text>
        <Text>
          Data:{" "}
          {notification && JSON.stringify(notification.request.content.data)}
        </Text>
      </View>
      <Button
        title="Press to schedule a notification"
        onPress={() => {
          Parse.Cloud.run("pushsample");
        }}
      />
    </View>
  );
}

async function schedulePushNotification() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "You've got mail! 📬",
      body: "Here is the notification body",
      data: { data: "goes here" },
    },
    trigger: { seconds: 2 },
  });
}

async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      console.log("Failed to get push token for push notification!");
      return;
    }
    token = (await Notifications.getDevicePushTokenAsync()).data;
    console.log({ token });
  } else {
    console.log("Must use physical device for Push Notifications");
  }

  return token;
}

const setupInstallation = async (token: string) => {
  try {
    const installationId = await Parse._getInstallationId();

    const Installation = new Parse.Installation();
    // Make sure to change any needed value from the following
    Installation.set("deviceType", Platform.OS !== "ios" ? "android" : "ios");
    Installation.set("pushType", Platform.OS !== "ios" ? "gcm" : "apn");
    Installation.set("GCMSenderId", ""); // TODO: Put sende id
    Installation.set("appIdentifier", "com.stoneski.back4appnotifications");
    Installation.set("parseVersion", "4.5.0");
    Installation.set("appName", "Wimt");
    Installation.set("appVersion", "1.0");
    Installation.set("localeIdentifier", "pl-PL");
    Installation.set("badge", 0); // Set initial notification badge number
    Installation.set("timeZone", "");
    Installation.set("installationId", installationId);
    Installation.set("channels", [channelId]);
    Installation.set("deviceToken", token);
    await Installation.save();
    console.log(`Created new Parse Installation ${Installation}`);
  } catch (error) {
    console.log(error.message);
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
