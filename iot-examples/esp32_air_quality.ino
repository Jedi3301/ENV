/*
 * ESP32 Air & Noise Quality Monitoring System (Supabase version)
 *
 * Sensors:
 * - MAX9814 microphone (Noise)
 * - MQ-135 (CO2 / PM2.5 / PM10)
 * - MQ-7 (CO)
 * - MQ-2 (Smoke)
 *
 * Sends JSON to Supabase REST API table: air_quality_data
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <math.h>

// ------------------------
// WiFi Configuration
// ------------------------
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// ------------------------
// Supabase Configuration
// ------------------------
const char* supabaseUrl = "https://izyamdtwnoaatqoqgjra.supabase.co";
const char* supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6eWFtZHR3bm9hYXRxb3FnanJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQwOTU2NjksImV4cCI6MjA0OTY3MTY2OX0.SG_3c70O0G5sVuiLDxJbwzeDf2HJoIy78aPxONW-FeI";

// ------------------------
// Sensor Pins
// ------------------------
#define MIC_PIN 34
#define MQ135_PIN 35
#define MQ7_PIN 32
#define MQ2_PIN 25

#define SAMPLE_WINDOW 50  // 50 ms for noise measurement

// ------------------------
// Function Prototypes
// ------------------------
void readSensors(float &noiseDb, String &nqi, float &pm25, float &pm10, float &co2, float &co, int &mq7Value, float &smoke);
bool sendToSupabase(float noiseDb, String nqi, float pm25, float pm10, float co2, float co, int mq7Value, float smoke);

void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("=== ESP32 Air & Noise Monitor (Supabase) ===");

  // Connect to WiFi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\n✅ WiFi connected!");
  Serial.println("IP Address: " + String(WiFi.localIP()));
}

void loop() {
  float noiseDb, pm25, pm10, co2, co, smoke;
  int mq7Value;
  String nqi;

  // Read sensors
  readSensors(noiseDb, nqi, pm25, pm10, co2, co, mq7Value, smoke);

  // Print locally
  Serial.println("=== Air & Noise Data ===");
  Serial.printf("Noise: %.2f dB | NQI: %s\n", noiseDb, nqi.c_str());
  Serial.printf("PM2.5: %.1f µg/m³ | PM10: %.1f µg/m³\n", pm25, pm10);
  Serial.printf("CO2: %.0f ppm | CO: %.1f ppm | MQ7: %d | Smoke: %.1f\n", co2, co, mq7Value, smoke);
  Serial.println("=========================");

  // Send to Supabase
  if (WiFi.status() == WL_CONNECTED) {
    bool success = sendToSupabase(noiseDb, nqi, pm25, pm10, co2, co, mq7Value, smoke);
    if (success) Serial.println("✓ Data sent to Supabase successfully!");
    else Serial.println("✗ Failed to send data!");
  } else {
    Serial.println("✗ WiFi disconnected. Reconnecting...");
    WiFi.reconnect();
  }

  delay(30000); // send every 30 seconds
}

void readSensors(float &noiseDb, String &nqi, float &pm25, float &pm10, float &co2, float &co, int &mq7Value, float &smoke) {
  // --- Noise measurement ---
  unsigned long startMillis = millis();
  unsigned int signalMax = 0;
  unsigned int signalMin = 4095;

  while (millis() - startMillis < SAMPLE_WINDOW) {
    int sample = analogRead(MIC_PIN);
    if (sample < 4095) {
      if (sample > signalMax) signalMax = sample;
      if (sample < signalMin) signalMin = sample;
    }
  }

  unsigned int peakToPeak = signalMax - signalMin;
  double volts = (peakToPeak * 3.3) / 4095.0;
  noiseDb = 20 * log10(volts / 0.00631);
  if (noiseDb < 0) noiseDb = 0;

  if (noiseDb <= 55) nqi = "Low";
  else if (noiseDb <= 75) nqi = "Medium";
  else nqi = "High";

  // --- MQ sensors ---
  int mq135 = analogRead(MQ135_PIN);
  mq7Value = analogRead(MQ7_PIN);
  int mq2 = analogRead(MQ2_PIN);

  pm25 = map(mq135, 0, 4095, 0, 500) / 10.0;
  pm10 = map(mq135, 0, 4095, 0, 1000) / 10.0;
  co2 = map(mq135, 0, 4095, 300, 2000);
  co = map(mq7Value, 0, 4095, 0, 1000) / 10.0;
  smoke = map(mq2, 0, 4095, 0, 1000) / 10.0;
}

bool sendToSupabase(float noiseDb, String nqi, float pm25, float pm10, float co2, float co, int mq7Value, float smoke) {
  HTTPClient http;
  
  // Build the full URL for the air_quality_data table
  String url = String(supabaseUrl) + "/rest/v1/air_quality_data";
  
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("apikey", supabaseKey);
  http.addHeader("Authorization", String("Bearer ") + supabaseKey);
  http.addHeader("Prefer", "return=minimal");

  StaticJsonDocument<512> doc;
  doc["noise_level"] = round(noiseDb * 10) / 10.0;
  doc["nqi"] = nqi;
  doc["pm25"] = round(pm25 * 10) / 10.0;
  doc["pm10"] = round(pm10 * 10) / 10.0;
  doc["co2"] = round(co2 * 10) / 10.0;
  doc["co"] = round(co * 10) / 10.0;
  doc["mq7"] = mq7Value;
  doc["smoke"] = round(smoke * 10) / 10.0;

  String payload;
  serializeJson(doc, payload);

  int httpCode = http.POST(payload);
  http.end();

  return (httpCode == 200 || httpCode == 201);
}
