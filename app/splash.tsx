import { View, Text, ActivityIndicator } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

export default function Splash() {
  const router = useRouter();

  useEffect(() => {
    const prepare = async () => {
      try {
        await SplashScreen.preventAutoHideAsync();
        
        await new Promise(resolve => setTimeout(resolve, 5000));
        await SplashScreen.hideAsync();
        
        router.replace("/(tabs)");
      } catch (error) {
        console.warn("Error en el splash:", error);
      }
    };  

    prepare();
  }, [router]);

  return (
    <View className="flex-1 justify-center items-center bg-white">
      <Image 
        source={require("../assets/cne.png")} 
        style={{ width: 200, height: 200 }} 
        contentFit="contain"
      />
      <Text className="text-xl mt-4 font-bold">VOTACIONES 2025</Text>
      <ActivityIndicator size="large" color="#000ff" className="mt-4" />
    </View>
  );
}