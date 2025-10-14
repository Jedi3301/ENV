# Environmental Monitoring System (EMS)

[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-green.svg)](https://supabase.com/)
[![IoT](https://img.shields.io/badge/IoT-ESP32%20%7C%20Raspberry%20Pi-orange.svg)](https://www.espressif.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A comprehensive real-time environmental monitoring system featuring IoT device integration, live data visualization, and modern admin dashboard. Monitor weather conditions, air quality, and water quality from multiple sensors with beautiful charts and real-time updates.

---

## 🌟 **Features**

### 🎯 Core Functionality
- **Real-time Data Visualization**: Live charts with auto-updating data streams
- **Multi-Sensor Support**: Weather, Air Quality, Water Quality monitoring
- **IoT Integration**: ESP32 and Raspberry Pi device compatibility
- **User Authentication**: Secure login/registration with Supabase Auth
- **Admin Dashboard**: Real-time device monitoring and data management
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile

### 📊 Monitoring Systems

#### 🌤️ Weather Station
- Temperature (DHT22 sensor)
- Humidity
- Atmospheric Pressure (BMP280 sensor)
- Altitude
- Real-time quality indicators

#### 💨 Air Quality Monitor
- Noise Level (dB with MAX9814 microphone)
- PM2.5 & PM10 (Particulate Matter)
- CO2 Levels (MQ-135 sensor)
- Carbon Monoxide (MQ-7 sensor)
- Smoke Detection (MQ-2 sensor)

#### 💧 Water Quality Monitor
- TDS (Total Dissolved Solids)
- Turbidity (Water Clarity)
- pH Level
- Conductivity

### 👨‍💼 Admin Features
- **Device Monitor**: Real-time device status tracking (active/inactive)
- **User Management**: View and manage user accounts and roles
- **Data Editor**: Full CRUD operations on sensor data
- **Statistics Dashboard**: Device counts and activity overview

---

## 🚀 **Quick Start**

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Supabase account
- IoT devices (optional for testing)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd final

# Install dependencies
npm install

# Start the development server
npm start
```

The application will open at `http://localhost:3000`

---

## ⚙️ **Configuration**

### 1. Supabase Setup

#### Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note your **Project URL** and **Anon Key**

#### Database Tables
Run these SQL queries in Supabase SQL Editor:

```sql
-- Weather Data Table
CREATE TABLE weather_data (
  id SERIAL PRIMARY KEY,
  temperature_dht DECIMAL(5,2),
  humidity DECIMAL(5,2),
  pressure DECIMAL(7,2),
  altitude DECIMAL(7,2),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Air Quality Data Table
CREATE TABLE air_quality_data (
  id SERIAL PRIMARY KEY,
  noise_level DECIMAL(5,2),
  nqi VARCHAR(20),
  pm25 DECIMAL(6,2),
  pm10 DECIMAL(6,2),
  co2 DECIMAL(7,2),
  co DECIMAL(6,2),
  mq7 DECIMAL(7,2),
  smoke DECIMAL(6,2),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Water Quality Data Table
CREATE TABLE water_quality_data (
  id SERIAL PRIMARY KEY,
  tds DECIMAL(7,2),
  turbidity DECIMAL(6,2),
  ph_level DECIMAL(4,2),
  conductivity DECIMAL(7,2),
  created_at TIMESTAMP DEFAULT NOW()
);

-- User Profiles Table
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Row Level Security (RLS) Policies

```sql
-- Enable RLS
ALTER TABLE weather_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE air_quality_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE water_quality_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (for IoT devices)
CREATE POLICY "Allow IoT devices to insert"
ON weather_data FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow IoT devices to insert"
ON air_quality_data FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow IoT devices to insert"
ON water_quality_data FOR INSERT
WITH CHECK (true);

-- Allow authenticated users to read
CREATE POLICY "Users can read data"
ON weather_data FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Users can read data"
ON air_quality_data FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Users can read data"
ON water_quality_data FOR SELECT
USING (auth.role() = 'authenticated');

-- User profiles policies
CREATE POLICY "Users can read own profile"
ON user_profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
ON user_profiles FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON user_profiles FOR UPDATE
USING (auth.uid() = id);

-- Admin can read all profiles
CREATE POLICY "Admins can read all profiles"
ON user_profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);
```

#### Database Trigger (Auto-create user profiles)
Run this to automatically create user profiles when users register:

```sql
-- Function to create user profile automatically
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, role, created_at)
  VALUES (NEW.id, NEW.email, 'user', NOW())
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users table
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

### 2. React Application Setup

#### Update Supabase Credentials
Edit `src/services/supabaseClient.js`:

```javascript
const supabaseUrl = 'https://izyamdtwnoaatqoqgjra.supabase.co';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY_HERE';
```

### 3. Create Admin Account

```bash
# Register a new user through the app
# Then run this SQL in Supabase:
UPDATE user_profiles
SET role = 'admin'
WHERE email = 'your-email@example.com';
```

---

## 🔌 **IoT Device Setup**

### Hardware Required

#### 🌤️ Raspberry Pi Weather Station
- Raspberry Pi (3/4/Zero W)
- DHT22 Temperature & Humidity Sensor
- BMP280 Pressure & Altitude Sensor
- Jumper wires

#### 💨 ESP32 Air Quality Monitor
- ESP32 Development Board
- MAX9814 Microphone Module
- MQ-135 Gas Sensor (CO2)
- MQ-7 Gas Sensor (CO)
- MQ-2 Gas Sensor (Smoke)

#### 💧 ESP32 Water Quality Monitor
- ESP32 Development Board
- TDS Sensor
- Turbidity Sensor
- DS18B20 Temperature Sensor
- 4.7kΩ Resistor

### Wiring Diagrams

#### Raspberry Pi Weather Station
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

#### ESP32 Air Quality
```
MAX9814:    VCC→3.3V, GND→GND, OUT→GPIO34
MQ-135:     VCC→5V, GND→GND, AO→GPIO35
MQ-7:       VCC→5V, GND→GND, AO→GPIO32
MQ-2:       VCC→5V, GND→GND, AO→GPIO25
```

#### ESP32 Water Quality
```
TDS Sensor:       VCC→5V, GND→GND, Signal→GPIO34
Turbidity:        VCC→5V, GND→GND, Signal→GPIO35
DS18B20:          VCC→3.3V, GND→GND, DATA→GPIO4
                  (+ 4.7kΩ resistor between VCC and DATA)
```

### Software Installation

#### Raspberry Pi
```bash
# Update system
sudo apt-get update && sudo apt-get upgrade

# Enable I2C
sudo raspi-config
# Interface Options → I2C → Enable

# Install dependencies
pip3 install adafruit-circuitpython-dht
pip3 install adafruit-circuitpython-bmp280
pip3 install requests

# Transfer and run
scp iot-examples/raspberry_pi_weather.py pi@<IP>:~/
python3 raspberry_pi_weather.py
```

#### ESP32 (Both Air and Water)
1. Install [Arduino IDE](https://www.arduino.cc/en/software)
2. Add ESP32 board support:
   - File → Preferences → Additional Board Manager URLs
   - Add: `https://dl.espressif.com/dl/package_esp32_index.json`
   - Tools → Board Manager → Install "ESP32"
3. Install libraries:
   - `ArduinoJson`
   - `OneWire` (Water Quality)
   - `DallasTemperature` (Water Quality)
4. Update WiFi credentials in `.ino` files
5. Upload to ESP32

### Configuration Files

All IoT code is in the `iot-examples/` folder:
- `esp32_air_quality.ino` - Air quality monitor
- `esp32_water_quality.ino` - Water quality monitor  
- `raspberry_pi_weather.py` - Weather station

**Update WiFi credentials in each file:**
```cpp
// ESP32
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
```

**Supabase credentials are already configured!**

---

## 📁 **Project Structure**

```
final/
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   ├── Login.jsx          # User login component
│   │   │   ├── Register.jsx       # User registration
│   │   │   └── AdminLogin.jsx     # Admin login page
│   │   ├── dashboard/
│   │   │   ├── Dashboard.jsx      # Main dashboard with charts
│   │   │   ├── SystemCard.jsx     # Individual sensor cards
│   │   │   └── ExpandedCard.jsx   # Detailed card view
│   │   ├── charts/
│   │   │   ├── LineChart.jsx      # Time-series charts
│   │   │   ├── BarChart.jsx       # Bar graphs
│   │   │   └── DialGauge.jsx      # Circular gauges
│   │   └── admin/
│   │       ├── AdminPanel.jsx     # Admin dashboard container
│   │       ├── DeviceMonitor.jsx  # Real-time device status
│   │       ├── UserList.jsx       # User management
│   │       └── DataEditor.jsx     # Sensor data CRUD
│   ├── services/
│   │   ├── supabaseClient.js      # Supabase configuration
│   │   ├── authService.js         # Authentication service
│   │   └── dataService.js         # Data fetching service
│   ├── styles/
│   │   ├── auth.css              # Authentication styles
│   │   ├── dashboard.css         # Dashboard styles
│   │   ├── charts.css            # Chart styles
│   │   └── admin.css             # Admin panel styles
│   ├── App.jsx                   # Main application component
│   ├── App.css                   # Global styles
│   └── index.js                  # Application entry point
├── iot-examples/
│   ├── esp32_air_quality.ino     # Air quality monitor code
│   ├── esp32_water_quality.ino   # Water quality monitor code
│   └── raspberry_pi_weather.py   # Weather station code
├── public/
│   └── index.html                # HTML template
└── package.json                  # Dependencies
```

---

## 🎨 **User Interface**

### Design Theme
- **Dark Mode**: Modern purple-blue gradient backgrounds
- **Glassmorphism**: Semi-transparent cards with backdrop blur
- **Smooth Animations**: Fade-in, slide-in, and hover effects
- **Color Scheme**:
  - Background: `#0f0c29 → #302b63 → #24243e`
  - Primary: `#6366f1` (Indigo)
  - Accent: `#8b5cf6` (Purple)
  - Success: `#22c55e` (Green)
  - Warning: `#fbbf24` (Amber)
  - Error: `#ef4444` (Red)

### Components

#### Dashboard Cards
- Real-time sensor data display
- Color-coded status indicators
- Expandable detailed views
- Auto-refresh every 5 seconds

#### Charts
- **Line Charts**: Temperature, humidity, pressure trends
- **Bar Charts**: Comparative sensor readings
- **Dial Gauges**: Real-time value displays with color zones

#### Admin Panel
- **Device Monitor**: Live device status with 10-second refresh
- **User Management**: Role-based access control
- **Data Editor**: Tabbed interface for Weather/Air/Water data

---

## 🔍 **Troubleshooting**

### Common Issues

#### Application Won't Start
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm start
```

#### Database Connection Errors
- Verify Supabase URL and anon key in `supabaseClient.js`
- Check RLS policies are correctly configured
- Ensure tables exist with correct names

#### IoT Device Not Sending Data
- **WiFi Issues**: Verify SSID/password, use 2.4GHz network
- **Serial Monitor**: Check for error messages (115200 baud)
- **Supabase**: Confirm credentials and table names
- **Power**: Ensure adequate power supply for sensors

#### Device Shows "Inactive"
- Devices are "inactive" if no data received in 5 minutes
- Check device power and WiFi connection
- Verify correct Supabase table names
- Check serial output for errors

#### Charts Not Displaying
- Ensure data exists in database tables
- Check browser console for JavaScript errors
- Verify user is authenticated
- Try refreshing the page

---

## 📊 **Data Flow Architecture**

```
IoT Devices (ESP32/Raspberry Pi)
         ↓
   [Read Sensors]
         ↓
   [Format JSON]
         ↓
  [HTTP POST Request]
         ↓
Supabase REST API (30-second intervals)
         ↓
PostgreSQL Database
         ↓
React Dashboard (Real-time subscriptions)
         ↓
Chart.js Visualization
         ↓
User Interface
```

---

## 🧪 **Development**

### Available Scripts

```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Eject configuration (one-way operation)
npm run eject
```

### Adding New Sensor Types

1. **Create Database Table**:
```sql
CREATE TABLE new_sensor_data (
  id SERIAL PRIMARY KEY,
  sensor_value DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT NOW()
);
```

2. **Add Component**: Create new chart component in `src/components/charts/`

3. **Update Dashboard**: Add new `SystemCard` in `Dashboard.jsx`

4. **IoT Code**: Create device code in `iot-examples/`

---

## 🔐 **Security**

### Authentication
- Supabase Auth with JWT tokens
- Row Level Security (RLS) policies
- Role-based access control (user/admin)
- Secure password hashing

### Best Practices
- Keep Supabase anon key secure (never commit to public repos)
- Use environment variables for production
- Regular database backups
- Monitor device activity for anomalies

---

## 📈 **Performance**

### Optimization Features
- Real-time Supabase subscriptions (no polling overhead)
- Efficient React component rendering
- Chart data limiting (last 20 readings)
- Lazy loading of admin components
- CSS animations using GPU acceleration

### Resource Usage
- **IoT Devices**: ~30KB per HTTP POST (every 30 seconds)
- **React App**: ~2MB initial load, <100KB subsequent updates
- **Database**: ~500 bytes per sensor reading

---

## 🚧 **Roadmap**

### Planned Features
- [ ] Push notifications for device alerts
- [ ] Historical data export (CSV/JSON)
- [ ] Advanced analytics and trends
- [ ] Multi-language support
- [ ] Mobile app (React Native)
- [ ] Device configuration via dashboard
- [ ] Custom alert thresholds
- [ ] Data aggregation and reports

---

## 🤝 **Contributing**

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Guidelines
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 **License**

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 📧 **Support**

For issues, questions, or contributions:
- Open an issue on GitHub
- Check existing documentation
- Review troubleshooting section

---

## 🎉 **Acknowledgments**

- **React Team** - Amazing UI library
- **Supabase** - Excellent backend platform
- **Chart.js** - Beautiful charting library
- **ESP32/Raspberry Pi Communities** - Hardware support
- **Open Source Contributors** - For all the libraries used

---

## 📝 **Changelog**

### Version 2.0 (Latest)
- ✅ Complete UI dark theme redesign
- ✅ Admin dashboard modernization
- ✅ Real-time device monitoring
- ✅ IoT code migration to Supabase
- ✅ Enhanced data visualization
- ✅ Improved error handling
- ✅ Mobile responsive design

### Version 1.0
- Initial release with basic monitoring
- Weather, Air, and Water quality sensors
- User authentication
- Basic charts and dashboard

---

**Built with ❤️ for environmental monitoring**
