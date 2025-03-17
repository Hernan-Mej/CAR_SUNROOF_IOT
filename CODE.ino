#include <WiFi.h> // Incluye la biblioteca para manejar la conexión WiFi
#include <WebSocketsServer.h> // Incluye la biblioteca para manejar el servidor WebSocket
#include <ArduinoJson.h> // Incluye la biblioteca para manejar JSON
#include <Servo.h> // Incluye la biblioteca para manejar el servo motor

// Configuración de la red WiFi
const char* ssid = "TU_SSID"; // Nombre de la red WiFi
const char* password = "TU_PASSWORD"; // Contraseña de la red WiFi

// Configuración del WebSocket
WebSocketsServer webSocket = WebSocketsServer(81); // Crea un servidor WebSocket en el puerto 81

// Configuración del servo motor
Servo sunroofServo; // Crea un objeto para controlar el servo motor
const int servoPin = 18; // Pin al que está conectado el servo motor

// Configuración de la fotocelda
const int photocellPin = 34; // Pin al que está conectada la fotocelda
const int lightThresholdLow = 300; // Umbral de luz baja
const int lightThresholdHigh = 700; // Umbral de luz alta

// Estado del sunroof
String sunroofState = "closed"; // Estado inicial del sunroof (cerrado)

void setup() {
  Serial.begin(115200); // Inicia la comunicación serial a 115200 baudios

  // Conexión a la red WiFi
  WiFi.begin(ssid, password); // Inicia la conexión a la red WiFi con el nombre y la contraseña proporcionados
  while (WiFi.status() != WL_CONNECTED) { // Espera hasta que el ESP32 se conecte a la red WiFi
    delay(1000); // Espera 1 segundo
    Serial.println("Conectando a WiFi..."); // Imprime un mensaje en la consola indicando que se está conectando a la WiFi
  }
  Serial.println("Conectado a WiFi"); // Imprime un mensaje en la consola indicando que se ha conectado a la WiFi

  // Iniciar el servidor WebSocket
  webSocket.begin(); // Inicia el servidor WebSocket
  webSocket.onEvent(webSocketEvent); // Define la función que manejará los eventos del WebSocket
  Serial.println("Servidor WebSocket iniciado en el puerto 81"); // Imprime un mensaje en la consola indicando que el servidor WebSocket ha iniciado

  // Configuración del servo motor
  sunroofServo.attach(servoPin); // Conecta el servo motor al pin especificado
  sunroofServo.write(0); // Inicialmente cierra el sunroof (posición 0 grados)
}

void loop() {
  // Manejar eventos del WebSocket
  webSocket.loop(); // Llama a la función que maneja los eventos del WebSocket

  // Leer el valor de la fotocelda
  int lightValue = analogRead(photocellPin); // Lee el valor de la fotocelda
  Serial.printf("Valor de la fotocelda: %d\n", lightValue); // Imprime el valor de la fotocelda en la consola

  // Verificar si la luz está en el rango tenue
  if (lightValue > lightThresholdLow && lightValue < lightThresholdHigh) { // Verifica si el valor de la luz está en el rango tenue
    // La luz está en el rango tenue, alterar el estado del sunroof
    if (sunroofState == "closed") {
      handleOpenSunroof(); // Abre el sunroof si está cerrado
    } else if (sunroofState == "opened") {
      handleCloseSunroof(); // Cierra el sunroof si está abierto
    }
  }
}

void webSocketEvent(uint8_t num, WStype_t type, uint8_t * payload, size_t length) {
  switch (type) {
    case WStype_DISCONNECTED: // Caso cuando el cliente se desconecta
      Serial.printf("[%u] Desconectado!\n", num); // Imprime un mensaje indicando que el cliente se ha desconectado
      break;
    case WStype_CONNECTED: { // Caso cuando el cliente se conecta
      IPAddress ip = webSocket.remoteIP(num); // Obtiene la dirección IP del cliente conectado
      Serial.printf("[%u] Conectado desde %s\n", num, ip.toString().c_str()); // Imprime un mensaje indicando que el cliente se ha conectado desde una dirección IP específica
      // Enviar el estado actual del sunroof al cliente conectado
      sendSunroofState(num, sunroofState); // Envía el estado actual del sunroof al cliente conectado
      break;
    }
    case WStype_TEXT: { // Caso cuando se recibe un mensaje de texto
      Serial.printf("[%u] Mensaje recibido: %s\n", num, payload); // Imprime el mensaje recibido en la consola
      // Parsear el mensaje JSON recibido
      StaticJsonDocument<200> doc; // Crea un documento JSON estático con un tamaño de 200 bytes
      DeserializationError error = deserializeJson(doc, payload); // Deserializa el mensaje JSON recibido
      if (error) { // Si hay un error al deserializar el JSON
        Serial.println("Error al parsear JSON"); // Imprime un mensaje de error en la consola
        return; // Sale de la función
      }
      // Obtener el estado del sunroof del mensaje
      const char* state = doc["sunroofState"]; // Obtiene el valor del estado del sunroof del mensaje JSON
      if (state) { // Si el estado del sunroof está presente en el mensaje
        sunroofState = String(state); // Actualiza el estado del sunroof
        Serial.printf("Estado del sunroof: %s\n", sunroofState.c_str()); // Imprime el nuevo estado del sunroof en la consola
        // Controlar el servo motor basado en el estado del sunroof
        controlSunroofServo(sunroofState); // Llama a la función para controlar el servo motor basado en el estado del sunroof
        // Enviar el estado del sunroof al cliente conectado
        sendSunroofState(num, sunroofState); // Envía el estado del sunroof al cliente conectado
      }
      break;
    }
    default:
      break;
  }
}

void handleOpenSunroof() {
  sunroofState = "opening"; // Cambia el estado del sunroof a "opening"
  controlSunroofServo(sunroofState); // Controla el servo motor para abrir el sunroof
  sendSunroofStateToClient(); // Envía el estado del sunroof al cliente conectado
}

void handleCloseSunroof() {
  sunroofState = "closing"; // Cambia el estado del sunroof a "closing"
  controlSunroofServo(sunroofState); // Controla el servo motor para cerrar el sunroof
  sendSunroofStateToClient(); // Envía el estado del sunroof al cliente conectado
}

void controlSunroofServo(String state) {
  if (state == "opening") { // Si el estado del sunroof es "opening" (abriendo)
    sunroofServo.write(90); // Mueve el servo motor a 90 grados (abrir el sunroof)
    sunroofState = "opened"; // Cambia el estado del sunroof a "opened"
  } else if (state == "closing") { // Si el estado del sunroof es "closing" (cerrando)
    sunroofServo.write(0); // Mueve el servo motor a 0 grados (cerrar el sunroof)
    sunroofState = "closed"; // Cambia el estado del sunroof a "closed"
  }
}

void sendSunroofState(uint8_t num, String state) {
  StaticJsonDocument<200> doc; // Crea un documento JSON estático con un tamaño de 200 bytes
  doc["sunroofState"] = state; // Asigna el estado del sunroof al documento JSON
  String jsonString; // Crea una cadena para almacenar el JSON serializado
  serializeJson(doc, jsonString); // Serializa el documento JSON a una cadena
  webSocket.sendTXT(num, jsonString); // Envía la cadena JSON al cliente especificado
}

void sendSunroofStateToClient() {
  StaticJsonDocument<200> doc; // Crea un documento JSON estático con un tamaño de 200 bytes
  doc["sunroofState"] = sunroofState; // Asigna el estado del sunroof al documento JSON
  String jsonString; // Crea una cadena para almacenar el JSON serializado
  serializeJson(doc, jsonString); // Serializa el documento JSON a una cadena
  webSocket.broadcastTXT(jsonString); // Envía la cadena JSON al cliente conectado
}