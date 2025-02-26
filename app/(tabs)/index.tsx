import {
  View,
  Text,
  TextInput,
  Button,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from "react-native";
import { useState, useRef, useEffect } from "react";
import {
  getGeminiResponse,
  resetConversation,
} from "../../services/geminiService";
import * as DocumentPicker from "expo-document-picker";
import Markdown from "react-native-markdown-display";
import { Clipboard } from "react-native";

import "../../global.css";

const ChatScreen = () => {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<
    { user: string; bot: string }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<any>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  //// Función para copiar al portapapeles
  const handleCopyToClipboard = (text: string) => {
    Clipboard.setString(text);
    Alert.alert(
      "¡Texto copiado!",
      "El contenido ha sido copiado al portapapeles."
    );
  };

  // Función para enviar mensajes
  const handleSend = async () => {
    if (!message.trim() && !file) {
      Alert.alert(
        "Error",
        "Por favor, escribe un mensaje o selecciona un archivo"
      );
      return;
    }

    try {
      const userMessage = message;
      setChatHistory((prev) => [
        ...prev,
        { user: userMessage, bot: "Escribiendo..." },
      ]);
      setMessage("");
      setLoading(true);

      const botResponse = await getGeminiResponse(userMessage, file);

      setChatHistory((prev) => {
        const updatedHistory = [...prev];
        updatedHistory[updatedHistory.length - 1].bot = botResponse;
        return updatedHistory;
      });

      setFile(null);
    } catch (error: any) {
      console.error("Error al enviar mensaje:", error);
      Alert.alert(
        "Error",
        error.message || "Hubo un error al procesar tu mensaje"
      );

      setChatHistory((prev) => {
        const updatedHistory = [...prev];
        updatedHistory[updatedHistory.length - 1].bot = `Error: ${
          error.message || "No se pudo procesar el mensaje"
        }`;
        return updatedHistory;
      });
    } finally {
      setLoading(false);
    }
  };

  // Función para seleccionar archivos
  const handleFileSelect = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["image/*", "application/pdf", "text/plain"],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedFile = result.assets[0];
        setFile(selectedFile);
        Alert.alert("Éxito", `Archivo seleccionado: ${selectedFile.name}`);
      }
    } catch (error) {
      console.error("Error al seleccionar archivo:", error);
      Alert.alert(
        "Error",
        "Solo se permiten archivos de imagen (JPG, PNG, WEBP), PDF o texto plano"
      );
    }
  };

  // Función para reiniciar la conversación
  const handleResetConversation = () => {
    Alert.alert(
      "Reiniciar conversación",
      "¿Estás seguro de que quieres borrar todo el historial de esta conversación?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Reiniciar",
          onPress: () => {
            resetConversation();
            setChatHistory([]);
            Alert.alert("Éxito", "La conversación ha sido reiniciada");
          },
          style: "destructive",
        },
      ]
    );
  };

  // Auto-scroll al final cuando hay nuevos mensajes
  useEffect(() => {
    if (chatHistory.length > 0) {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }
  }, [chatHistory]);

  return (
    <View className="flex-1">
      {/* Header con título y botón de reinicio */}
      <View className="flex-row justify-between items-center p-4 bg-blue-500">
        <Text className="text-white text-lg font-bold">Asistente IA</Text>
        <TouchableOpacity
          onPress={handleResetConversation}
          className="bg-red-500 px-3 py-1 rounded-full"
        >
          <Text className="text-white">Nueva Conversación</Text>
        </TouchableOpacity>
      </View>

      {/* Área de chat */}
      <ScrollView
        ref={scrollViewRef}
        className="flex-1 p-4"
        onContentSizeChange={() =>
          scrollViewRef.current?.scrollToEnd({ animated: true })
        }
      >
        {chatHistory.length === 0 ? (
          <View className="items-center justify-center h-40">
            <Text className="text-gray-500 text-center">
              ¡Hola! Soy tu asistente AI. Ahora puedo recordar nuestra
              conversación completa.
            </Text>
          </View>
        ) : (
          chatHistory.map((chat, index) => (
            <View key={index} className="mb-4">
              <View className="bg-blue-100 p-3 rounded-t-lg rounded-br-lg mb-2 self-end max-w-[80%]">
                <Text className="text-black">{chat.user}</Text>
                {index === chatHistory.length - 1 && file && (
                  <Text className="text-gray-600 italic mt-1">
                    Archivo: {file.name}
                  </Text>
                )}
              </View>
              <View className="bg-gray-200 p-3 rounded-t-lg rounded-bl-lg max-w-[80%]">
                <TouchableOpacity
                  onPress={() => handleCopyToClipboard(chat.bot)}
                >
                  <Text selectable={true}>
                    {/* Mostrar el contenido Markdown como texto */}
                    <Markdown>{chat.bot}</Markdown>
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        {loading && (
          <View className="items-center py-4">
            <ActivityIndicator size="large" color="#4B5563" />
            <Text className="text-gray-500 mt-2">Pensando...</Text>
          </View>
        )}
      </ScrollView>

      {/* Área de entrada de mensajes */}
      <View className="border-t border-gray-200 p-4">
        {file && (
          <View className="mb-2 flex-row items-center justify-between bg-blue-50 p-2 rounded">
            <Text className="text-sm text-blue-600 flex-1">{file.name}</Text>
            <TouchableOpacity
              onPress={() => setFile(null)}
              className="bg-red-500 p-1 rounded-full ml-2"
            >
              <Text className="text-white px-2">X</Text>
            </TouchableOpacity>
          </View>
        )}

        <View className="flex-row items-center">
          <TextInput
            className="flex-1 border border-gray-300 rounded-l-lg p-3 bg-white"
            value={message}
            onChangeText={setMessage}
            placeholder="Escribe un mensaje"
            multiline
          />
          <TouchableOpacity
            onPress={handleFileSelect}
            className="bg-gray-200 p-3 border-t border-r border-b border-gray-300"
          >
            <Text>📎</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSend}
            className="bg-blue-500 p-3 rounded-r-lg"
            disabled={loading}
          >
            <Text className="text-white">📤</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default ChatScreen;
