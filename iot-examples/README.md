# IoT Device Code - Environmental Monitoring System

This folder contains production-ready IoT device code for the Environmental Monitoring System. All devices are configured to send data directly to Supabase.

---

## 📁 **Files**

- `esp32_air_quality.ino` - ESP32 air quality monitor (MQ sensors, MAX9814 microphone)
- `esp32_water_quality.ino` - ESP32 water quality monitor (TDS, Turbidity, DS18B20)
- `raspberry_pi_weather.py` - Raspberry Pi weather station (DHT22, BMP280)

---

## 🌤️ **1. Raspberry Pi Weather Station**

### Hardware
- **Sensors**: DHT22 (temp/humidity), BMP280 (pressure/altitude)
- **Data Frequency**: Every 30 seconds
- **Table**: `weather_data`

### Wiring
```
DHT22:
  VCC → 3.3V (Pin 1)
  DATA → GPIO 4 (Pin 7)
  GND → Ground (Pin 6)

BMP280 (I2C):
  VCC → 3.3V (Pin 1)
  GND → Ground (Pin 6)
  SCL → GPIO 3 (Pin 5)
  SDA → GPIO 2 (Pin 3)
```

### Setup
```bash
# Enable I2C
sudo raspi-config
# Interface Options → I2C → Enable

# Install dependencies
pip3 install adafruit-circuitpython-dht
pip3 install adafruit-circuitpython-bmp280
pip3 install requests

# Run
python3 raspberry_pi_weather.py
```

### Data Sent
- `temperature_dht` (°C)
- `humidity` (%)
- `pressure` (hPa)
- `altitude` (m)

---

## 💨 **2. ESP32 Air Quality Monitor**

### Hardware
- **Sensors**: MAX9814 (noise), MQ-135 (CO2/PM), MQ-7 (CO), MQ-2 (smoke)
- **Data Frequency**: Every 30 seconds
- **Table**: `air_quality_data`

### Wiring
```
MAX9814:  VCC→3.3V, GND→GND, OUT→GPIO34
MQ-135:   VCC→5V, GND→GND, AO→GPIO35
MQ-7:     VCC→5V, GND→GND, AO→GPIO32
MQ-2:     VCC→5V, GND→GND, AO→GPIO25
```

### Setup
1. Install [Arduino IDE](https://www.arduino.cc/en/software)
2. Add ESP32 support:
   - File → Preferences
   - Add URL: `https://dl.espressif.com/dl/package_esp32_index.json`
   - Tools → Board Manager → Install "ESP32"
3. Install `ArduinoJson` library
4. Update WiFi credentials in `esp32_air_quality.ino`
5. Upload to ESP32

### Data Sent
- `noise_level` (dB)
- `nqi` (Noise Quality Index)
- `pm25`, `pm10` (µg/m³)
- `co2` (ppm)
- `co`, `mq7` (ppm/raw)
- `smoke` (units)

---

## 💧 **3. ESP32 Water Quality Monitor**

### Hardware
- **Sensors**: TDS, Turbidity, DS18B20 (temperature)
- **Data Frequency**: Every 30 seconds
- **Table**: `water_quality_data`

### Wiring
```
TDS Sensor:    VCC→5V, GND→GND, Signal→GPIO34
Turbidity:     VCC→5V, GND→GND, Signal→GPIO35
DS18B20:       VCC→3.3V, GND→GND, DATA→GPIO4
               (+ 4.7kΩ resistor between VCC and DATA)
```

### Setup
1. Arduino IDE with ESP32 support (see Air Quality setup)
2. Install libraries: `OneWire`, `DallasTemperature`, `ArduinoJson`
3. Update WiFi credentials in `esp32_water_quality.ino`
4. Upload to ESP32

### Data Sent
- `tds` (ppm)
- `turbidity` (NTU)
- `ph_level` (0-14)
- `conductivity` (µS/cm)

---

## ⚙️ **Configuration**

### WiFi Credentials (Required)
Update in each `.ino` file:
```cpp
const char* ssid = "YOUR_WIFI_SSID";        // ← Change this
const char* password = "YOUR_WIFI_PASSWORD"; // ← Change this
```

### Supabase (Pre-configured)
Supabase URL and key are already set:
```cpp
// ESP32
String supabaseUrl = "https://izyamdtwnoaatqoqgjra.supabase.co";
String supabaseKey = "eyJhbGciOiJI..."; // Full key in code
```

```python
# Raspberry Pi
SUPABASE_URL = "https://izyamdtwnoaatqoqgjra.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJI..." # Full key in code
```

**Note**: Only WiFi credentials need to be updated!

---

## 🧪 **Testing**

### Serial Monitor (ESP32)
```
Tools → Serial Monitor → Set baud rate to 115200

Expected Output:
✓ WiFi connected!
📡 Sending data to Supabase...
✅ Success! Response: 201
```

### Console Output (Raspberry Pi)
```bash
python3 raspberry_pi_weather.py

Expected Output:
✓ WiFi connected
🌡️ Temperature: 24.5°C (Comfortable)
💧 Humidity: 55% (Comfortable)
📡 Sending to Supabase... ✅ Success!
```

### Verify in Dashboard
1. Open React app at `http://localhost:3000`
2. Login as admin
3. Go to Admin Panel → Device Monitor
4. Check device status (should show "Active")
5. View data in Data Management tab

---

## 🔧 **Troubleshooting**

### ESP32 Upload Failed
- Try different USB cable (charge-only cables won't work)
- Hold BOOT button while uploading
- Install CP210x or CH340 drivers

### WiFi Connection Failed
- Ensure using 2.4GHz WiFi (ESP32 doesn't support 5GHz)
- Double-check SSID and password (case-sensitive)
- Check WiFi signal strength

### No Data in Dashboard
- Check serial monitor for error messages
- Verify Supabase URL and key are correct
- Ensure tables exist in Supabase
- Check RLS policies allow anonymous inserts

### Sensor Readings Zero/Incorrect
- Allow MQ sensors to warm up (24-48 hours for accuracy)
- Check wiring connections
- Verify power supply (5V for most sensors)
- Test individual sensors with Serial.println()

---

## 📊 **Data Flow**

```
IoT Device → Read Sensors (every 30 seconds)
     ↓
Format JSON payload
     ↓
HTTP POST to Supabase REST API
     ↓
PostgreSQL Database (Supabase)
     ↓
React Dashboard (Real-time)
     ↓
Admin Device Monitor
```

---

## 📝 **Notes**

- **Timing**: All devices send data every 30 seconds
- **Encryption**: Data is sent over HTTPS (TLS encryption)
- **Authentication**: Uses Supabase anon key (pre-configured)
- **Retry Logic**: Built-in WiFi reconnection and sensor retry mechanisms
- **Error Handling**: Comprehensive error messages in serial output

---

**For detailed hardware setup and troubleshooting, see the main README.md** \
  -H "Authorization: Bearer your-anon-key" \
  -H "Content-Type: application/json" \
  -d '{"tds": 150.5, "turbidity": 5.2, "ph_level": 7.1, "conductivity": 450.3}'
```

## Troubleshooting

### ESP32 not connecting to WiFi
- Check WiFi credentials
- Ensure WiFi is 2.4GHz (ESP32 doesn't support 5GHz)
- Check WiFi signal strength

### Data not appearing in Supabase
- Verify Supabase URL and key
- Check Row Level Security policies
- Ensure table names match exactly
- Check Serial Monitor for error messages

### Sensor readings are incorrect
- Check sensor wiring
- Verify sensor power supply (3.3V or 5V)
- Calibrate sensors if needed
- Check for loose connections

## Data Format Reference

### Weather Data
```json
{
  "temperature_dht": 25.5,
  "humidity": 65.0,
  "pressure": 1013.25,
  "altitude": 100.5
}
```

### Air Quality Data
```json
{
  "noise_level": 46.34,
  "nqi": "Low",
  "pm25": 9.3,
  "pm10": 10.6,
  "co2": 616,
  "co": 52,
  "mq7": 2150,
  "smoke": 0.0
}
```

### Water Quality Data
```json
{
  "tds": 150.5,
  "turbidity": 5.2,
  "ph_level": 7.1,
  "conductivity": 450.3
}
```
