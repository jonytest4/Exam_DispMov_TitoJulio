import { Stack } from "expo-router";
import { View } from "react-native";
import { StatusBar } from "expo-status-bar";

const RootLoyout = () => {
  return (
    <View className="flex-1">
      <StatusBar style="auto" />
      {/*Forzar llamado a mi splash Screen */}
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="index"
          options={{
            animation: "none",
          }}
          redirect={true}
        />
        <Stack.Screen
          name="splash"
          options={{
            animation: "none",
          }}
        />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </View>
  );
};

export default RootLoyout;
