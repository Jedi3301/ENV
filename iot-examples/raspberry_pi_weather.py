#!/usr/bin/env python3
"""
Raspberry Pi Weather Monitoring System (Supabase version)

Sensors:
- DHT22 (Temperature & Humidity) - GPIO Pin 4
- BMP280 (Pressure & Altitude) - I2C

Data sent to Supabase:
- temperature_dht (°C)
- humidity (%)
- pressure (hPa)
- altitude (m)

Sends data every 30 seconds
"""

import time
import json
import requests
import board
import adafruit_dht
import adafruit_bmp280

# ------------------------
# Supabase Configuration
# ------------------------
SUPABASE_URL = "https://izyamdtwnoaatqoqgjra.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6eWFtZHR3bm9hYXRxb3FnanJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyOTk5NzMsImV4cCI6MjA3NTg3NTk3M30.Q02RRT4oLS7YVdry-6P_aWjVeb9ntoQ20K9p81iF7Zg"
TABLE_NAME = "weather_data"

# ------------------------
# Initialize sensors
# ------------------------
print("Initializing sensors...")
dht_device = adafruit_dht.DHT22(board.D4, use_pulseio=False)
i2c = board.I2C()
bmp280 = adafruit_bmp280.Adafruit_BMP280_I2C(i2c, address=0x76)

# Calibrate sea level pressure for altitude calculation
bmp280.sea_level_pressure = 1013.25

print("✓ Sensors initialized!")
print("=" * 60)
print("RASPBERRY PI WEATHER MONITORING SYSTEM - SUPABASE")
print("=" * 60)
print(f"Supabase URL: {SUPABASE_URL}")
print(f"Table: {TABLE_NAME}")
print(f"Data transmission: Every 30 seconds")
print("=" * 60)
print()

def read_sensors_with_retry(retries=5, delay=2):
    """Read sensors with retry logic for DHT22 reliability"""
    for attempt in range(retries):
        try:
            # Read DHT22 (can be temperamental)
            temperature = dht_device.temperature
            humidity = dht_device.humidity
            
            # Read BMP280 (more reliable)
            pressure = bmp280.pressure
            altitude = bmp280.altitude
            
            # Validate readings
            if temperature is not None and humidity is not None:
                return {
                    'temperature_dht': round(temperature, 1),
                    'humidity': round(humidity, 1),
                    'pressure': round(pressure, 2),
                    'altitude': round(altitude, 1)
                }
            else:
                print(f"⚠ Retry {attempt + 1}/{retries} - Invalid sensor reading")
                time.sleep(delay)
                
        except RuntimeError as error:
            print(f"⚠ DHT22 error (attempt {attempt + 1}/{retries}): {error.args[0]}")
            time.sleep(delay)
        except Exception as error:
            print(f"❌ Sensor error: {error}")
            time.sleep(delay)
    
    print("❌ Failed to read sensors after all retries")
    return None

def print_data(data):
    """Print sensor data to console with quality indicators"""
    if data:
        print("\n" + "=" * 60)
        print("WEATHER READINGS")
        print("=" * 60)
        
        # Temperature
        temp = data['temperature_dht']
        print(f"🌡️  Temperature: {temp}°C", end="")
        if temp < 10:
            print(" (Cold)")
        elif temp < 25:
            print(" (Comfortable)")
        elif temp < 35:
            print(" (Warm)")
        else:
            print(" (Hot)")
        
        # Humidity
        humidity = data['humidity']
        print(f"💧 Humidity: {humidity}%", end="")
        if humidity < 30:
            print(" (Dry)")
        elif humidity < 60:
            print(" (Comfortable)")
        else:
            print(" (Humid)")
        
        # Pressure
        pressure = data['pressure']
        print(f"🎚️  Pressure: {pressure} hPa", end="")
        if pressure < 1000:
            print(" (Low - Storm likely)")
        elif pressure < 1013:
            print(" (Below normal)")
        elif pressure < 1020:
            print(" (Normal)")
        else:
            print(" (High - Clear weather)")
        
        # Altitude
        print(f"⛰️  Altitude: {data['altitude']} m")
        print("=" * 60)

def send_to_supabase(data):
    """Send data to Supabase REST API"""
    if not data:
        return False
    
    url = f"{SUPABASE_URL}/rest/v1/{TABLE_NAME}"
    headers = {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}',
        'Prefer': 'return=minimal'
    }
    
    try:
        print("📡 Sending to Supabase...", end=" ")
        response = requests.post(url, json=data, headers=headers, timeout=10)
        
        if response.status_code in [200, 201]:
            print("✅ Success!")
            return True
        else:
            print(f"❌ Error {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except requests.exceptions.Timeout:
        print("❌ Request timeout")
        return False
    except requests.exceptions.ConnectionError:
        print("❌ Connection error")
        return False
    except Exception as e:
        print(f"❌ Exception: {e}")
        return False

def main():
    """Main monitoring loop"""
    print("🚀 Weather Monitoring System Started")
    print("📊 Sending data every 30 seconds...")
    print("⌨️  Press Ctrl+C to stop\n")
    
    cycle_count = 0
    success_count = 0
    
    try:
        while True:
            cycle_count += 1
            print(f"\n📍 Cycle #{cycle_count}")
            
            # Read sensors with retry logic
            data = read_sensors_with_retry()
            
            if data:
                # Print data with quality indicators
                print_data(data)
                
                # Send to Supabase
                if send_to_supabase(data):
                    success_count += 1
                
                # Print statistics
                success_rate = (success_count / cycle_count) * 100
                print(f"📈 Success Rate: {success_rate:.1f}% ({success_count}/{cycle_count})")
            else:
                print("⚠️  Skipping cycle due to sensor read failure")
            
            # Wait 30 seconds before next reading
            print(f"\n⏳ Waiting 30 seconds until next reading...")
            print("-" * 60)
            time.sleep(30)
            
    except KeyboardInterrupt:
        print("\n\n" + "=" * 60)
        print("🛑 Program stopped by user")
        print("=" * 60)
        print(f"📊 Final Statistics:")
        print(f"   Total Cycles: {cycle_count}")
        print(f"   Successful Transmissions: {success_count}")
        if cycle_count > 0:
            print(f"   Success Rate: {(success_count / cycle_count) * 100:.1f}%")
        print("=" * 60)
    except Exception as e:
        print(f"\n❌ Fatal error: {e}")
    finally:
        print("🔌 Cleaning up sensors...")
        try:
            dht_device.exit()
        except:
            pass
        print("✓ Cleanup complete")

if __name__ == "__main__":
    main()
