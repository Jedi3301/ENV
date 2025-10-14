/*
 * ESP32 Water Quality Monitoring System (Supabase version)
 * 
 * Sensors:
 * - TDS Sensor (Total Dissolved Solids) - Pin 34
 * - Turbidity Sensor - Pin 35
 * - DS18B20 Temperature Sensor - Pin 4 (OneWire)
 * - pH Level (calculated/simulated)
 * - Conductivity (derived from TDS)
 * 
 * Sends JSON to Supabase REST API table: water_quality_data
 * Data sent every 30 seconds (matches weather station timing)
 */

#include <OneWire.h>
#include <DallasTemperature.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// ------------------------
// WiFi Configuration
// ------------------------
const char* ssid = "YOUR_WIFI_SSID";          // Change this to your WiFi name
const char* password = "YOUR_WIFI_PASSWORD";  // Change this to your WiFi password

// ------------------------
// Supabase Configuration
// ------------------------
const char* supabaseUrl = "https://izyamdtwnoaatqoqgjra.supabase.co";
const char* supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6eWFtZHR3bm9hYXRxb3FnanJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQwOTU2NjksImV4cCI6MjA0OTY3MTY2OX0.SG_3c70O0G5sVuiLDxJbwzeDf2HJoIy78aPxONW-FeI";

// ------------------------
// Sensor Pin Configuration
// ------------------------
const int tdsPin = 34;
const int turbidityPin = 35;
#define ONE_WIRE_BUS 4

// ------------------------
// TDS Sensor Configuration
// ------------------------
const int tdsAnalogResolution = 4095;  // 12-bit ADC
const float vRef = 3.3;
const float tdsCalibrationFactor = 0.4;

// ------------------------
// Turbidity Sensor Configuration
// ------------------------
#define ADC_RESOLUTION 4095.0
#define ADC_VOLTAGE 3.3

// ------------------------
// Temperature Sensor (DS18B20) Setup
// ------------------------
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);

// ------------------------
// Function Prototypes
// ------------------------
float readTDS();
float readTurbidity();
float calculatePH();
float calculateConductivity(float tds);
bool sendToSupabase(float tds, float turbidity, float ph, float conductivity);

void setup() {
  Serial.begin(115200);
  analogReadResolution(12);  // Set ADC to 12-bit resolution
  delay(1000);
  
  Serial.println("========================================");
  Serial.println("ESP32 Water Quality Monitor - Supabase");
  Serial.println("========================================");
  
  // Initialize sensors
  sensors.begin();
  pinMode(tdsPin, INPUT);
  pinMode(turbidityPin, INPUT);
  
  Serial.println("Sensors initialized!");

  // Connect to WiFi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println();
    Serial.println("✓ WiFi connected!");
    Serial.print("IP address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println();
    Serial.println("✗ WiFi connection failed!");
    Serial.println("Please check your WiFi credentials and try again.");
  }
  
  Serial.println("========================================");
  Serial.println("Starting water quality monitoring...");
  Serial.println("Data will be sent every 30 seconds");
  Serial.println("========================================\n");
  delay(2000);
}

void loop() {
  Serial.println("========== WATER QUALITY READINGS ==========");
  
  // ------------------------
  // Read TDS (Total Dissolved Solids)
  // ------------------------
  float tdsValue = readTDS();
  Serial.printf("TDS: %.1f ppm", tdsValue);
  if (tdsValue < 300) {
    Serial.println(" (Excellent)");
  } else if (tdsValue < 600) {
    Serial.println(" (Good)");
  } else if (tdsValue < 900) {
    Serial.println(" (Fair)");
  } else {
    Serial.println(" (Poor)");
  }
  
  // ------------------------
  // Read Turbidity
  // ------------------------
  float turbidityNTU = readTurbidity();
  Serial.printf("Turbidity: %.1f NTU", turbidityNTU);
  if (turbidityNTU < 1) {
    Serial.println(" (Excellent)");
  } else if (turbidityNTU < 5) {
    Serial.println(" (Good)");
  } else if (turbidityNTU < 10) {
    Serial.println(" (Fair)");
  } else {
    Serial.println(" (Poor)");
  }
  
  // ------------------------
  // Calculate pH Level
  // ------------------------
  float phValue = calculatePH();
  Serial.printf("pH Level: %.1f", phValue);
  if (phValue >= 6.5 && phValue <= 8.5) {
    Serial.println(" (Safe)");
  } else {
    Serial.println(" (Outside safe range)");
  }
  
  // ------------------------
  // Calculate Conductivity (derived from TDS)
  // ------------------------
  float conductivity = calculateConductivity(tdsValue);
  Serial.printf("Conductivity: %.1f μS/cm\n", conductivity);
  
  // ------------------------
  // Send Data to Supabase
  // ------------------------
  if (WiFi.status() == WL_CONNECTED) {
    bool success = sendToSupabase(tdsValue, turbidityNTU, phValue, conductivity);
    
    if (success) {
      Serial.println("✓ Data sent to Supabase successfully!");
    } else {
      Serial.println("✗ Failed to send data - will retry next cycle");
    }
  } else {
    Serial.println("✗ WiFi disconnected - attempting reconnection");
    WiFi.reconnect();
  }
  
  Serial.println("==========================================\n");
  
  // Wait 30 seconds before next reading (matches weather station)
  delay(30000);
}

// ------------------------
// Read TDS Sensor
// ------------------------
float readTDS() {
  int tdsAnalog = analogRead(tdsPin);
  float tdsVoltage = (tdsAnalog / (float)tdsAnalogResolution) * vRef;
  
  // TDS calculation formula (temperature compensated at 25°C)
  float tdsValue = (133.42 * tdsVoltage * tdsVoltage * tdsVoltage 
                   - 255.86 * tdsVoltage * tdsVoltage 
                   + 857.39 * tdsVoltage) * tdsCalibrationFactor;
  
  // Ensure non-negative
  if (tdsValue < 0) tdsValue = 0;
  
  return tdsValue;
}

// ------------------------
// Read Turbidity Sensor
// ------------------------
float readTurbidity() {
  int turbidityRaw = analogRead(turbidityPin);
  float turbidityVoltage = turbidityRaw * (ADC_VOLTAGE / ADC_RESOLUTION);
  
  // Convert to NTU (Nephelometric Turbidity Units)
  // Formula depends on your specific turbidity sensor
  float turbidityNTU = ((float)turbidityRaw / 700.0) * 10.0;
  
  // Ensure non-negative
  if (turbidityNTU < 0) turbidityNTU = 0;
  
  return turbidityNTU;
}

// ------------------------
// Calculate pH Level
// ------------------------
float calculatePH() {
  // If you have a pH sensor connected to an analog pin, read it here
  // For simulation/testing, return a value in safe drinking water range
  
  // Generate realistic pH value (6.8 - 7.4 for good water)
  float phValue = 6.8 + ((float)random(0, 601) / 1000.0);
  
  return phValue;
}

// ------------------------
// Calculate Conductivity from TDS
// ------------------------
float calculateConductivity(float tds) {
  // Conductivity (μS/cm) is approximately 2x TDS (ppm)
  // This is a general approximation for most water samples
  return tds * 2.0;
}

// ------------------------
// Send Data to Supabase
// ------------------------
bool sendToSupabase(float tds, float turbidity, float ph, float conductivity) {
  HTTPClient http;
  
  // Construct Supabase REST API endpoint
  String url = String(supabaseUrl) + "/rest/v1/water_quality_data";
  
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("apikey", supabaseKey);
  http.addHeader("Authorization", String("Bearer ") + supabaseKey);
  http.addHeader("Prefer", "return=minimal");
  
  // Create JSON payload
  DynamicJsonDocument doc(512);
  doc["tds"] = round(tds * 10) / 10.0;                  // Round to 1 decimal
  doc["turbidity"] = round(turbidity * 10) / 10.0;      // Round to 1 decimal
  doc["ph_level"] = round(ph * 10) / 10.0;              // Round to 1 decimal
  doc["conductivity"] = round(conductivity * 10) / 10.0; // Round to 1 decimal
  
  String payload;
  serializeJson(doc, payload);
  
  Serial.println("Sending to Supabase...");
  Serial.println("Payload: " + payload);
  
  // Send POST request
  int httpResponseCode = http.POST(payload);
  
  if (httpResponseCode == 201 || httpResponseCode == 200) {
    Serial.println("✅ Supabase Response Code: " + String(httpResponseCode));
    http.end();
    return true;
  } else {
    Serial.println("❌ HTTP Error Code: " + String(httpResponseCode));
    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.println("Response: " + response);
    }
    http.end();
    return false;
  }
}
