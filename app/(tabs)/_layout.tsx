//Contenedor para las pantallas dentro de tabs
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function TabsLayout(){
    return(
        <Tabs>
            <Tabs.Screen 
                name="index"
                options={{
                    title: "ChatBot",
                    tabBarIcon: ({color, size}) => (
                        <Ionicons name="chatbubbles" color={color} size={size} />
                    )
                }}
            />
            <Tabs.Screen 
                name="grafico"
                options={{
                    title: "Gráfica Votaciones",
                    tabBarIcon: ({color, size}) => (
                        <Ionicons name="information-circle" color={color} size={size} />
                    )
                }}
            />
        </Tabs>
    );
}