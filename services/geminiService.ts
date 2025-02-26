import { GoogleGenerativeAI, TextPart, InlineDataPart } from "@google/generative-ai";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import mime from "mime";

const API_KEY = "AIzaSyBaT2BMho3zY14j68Us0V8aXxPmpZr7T2c"; 

const genAI = new GoogleGenerativeAI(API_KEY);

// Estructura para almacenar mensajes con sus roles
interface ChatMessage {
  role: 'user' | 'model';
  parts: (TextPart | InlineDataPart)[];
}

// Almacenamiento para el historial de conversación
let conversationHistory: ChatMessage[] = [];

// Función para obtener información del archivo en base64
async function getFileData(file: any) {
  if (!file) {
    return null;
  }

  try {
    const fileUri = file.uri;
    const fileName = file.name || '';
    const mimeType = mime.getType(fileName) || "application/octet-stream";

    const fileBase64 = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    return {
      data: fileBase64,
      mimeType
    };
  } catch (error) {
    console.error("Error reading file:", error);
    return null;
  }
}

// Función principal para obtener respuestas de Gemini con memoria
export const getGeminiResponse = async (userMessage: string, file?: any) => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro-latest",
    });

    // Iniciar una sesión de chat para mantener el historial
    const chat = model.startChat({
      history: conversationHistory,
      generationConfig: {
        maxOutputTokens: 1000,
      },
    });

    // Crear el contenido del mensaje del usuario
    let userContent: (TextPart | InlineDataPart)[] = [];

    // Si hay un archivo, procesarlo primero
    if (file) {
      const fileData = await getFileData(file);
      if (fileData) {
        userContent.push({
          inlineData: {
            mimeType: fileData.mimeType,
            data: fileData.data
          }
        } as InlineDataPart);
      }
    }

    // Añadir el texto del mensaje
    userContent.push({ text: userMessage } as TextPart);

    // Enviar el mensaje y obtener la respuesta
    const result = await chat.sendMessage(userContent);
    const response = await result.response;
    const responseText = response.text();

    // Actualizar el historial de conversación
    conversationHistory.push({
      role: 'user',
      parts: userContent
    });

    conversationHistory.push({
      role: 'model',
      parts: [{ text: responseText } as TextPart]
    });

    // Limitar el tamaño del historial para evitar tokens excesivos (opcional)
    if (conversationHistory.length > 20) {
      conversationHistory = conversationHistory.slice(conversationHistory.length - 20);
    }

    return responseText;

  } catch (error: any) {
    console.error("Error with Gemini API:", error);
    throw new Error(error.message || "Error inesperado al procesar la solicitud");
  }
};

// Función para reiniciar el historial de conversación
export const resetConversation = () => {
  conversationHistory = [];
};

// Función para obtener el historial actual (útil para depuración)
export const getConversationHistory = () => {
  return conversationHistory;
};
