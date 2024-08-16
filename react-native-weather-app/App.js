import { StatusBar } from "expo-status-bar";
import { Dimensions, ScrollView, StyleSheet, Text, View, ActivityIndicator } from "react-native";
import React, { useState, useEffect } from "react";
import * as Location from "expo-location";
import { WEATHER_API_KEY } from "@env";
import { Fontisto } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const weatherOptions = {
  Clouds: {
    iconName: "cloudy",
    gradient: ["#757F9A", "#D7DDE8"],
    title: "Cloudy",
    subtitle: "Perfect day for a cup of coffee",
  },
  Clear: {
    iconName: "day-sunny",
    gradient: ["#56CCF2", "#2F80ED"],
    title: "Sunny",
    subtitle: "It's a beautiful day outside",
  },
  Atmosphere: {
    iconName: "cloudy-gusts",
    gradient: ["#3E5151", "#DECBA4"],
    title: "Dusty",
    subtitle: "You might want to stay inside",
  },
  Snow: {
    iconName: "snow",
    gradient: ["#E6DADA", "#274046"],
    title: "Snowy",
    subtitle: "Do you want to build a snowman?",
  },
  Rain: {
    iconName: "rains",
    gradient: ["#000046", "#1CB5E0"],
    title: "Rainy",
    subtitle: "Don't forget your umbrella",
  },
  Drizzle: {
    iconName: "rain",
    gradient: ["#4CA1AF", "#C4E0E5"],
    title: "Drizzly",
    subtitle: "Might need a light jacket",
  },
  Thunderstorm: {
    iconName: "lightning",
    gradient: ["#373B44", "#4286f4"],
    title: "Thunderstorm",
    subtitle: "Stay safe indoors",
  },
};

export default function App() {
  const [city, setCity] = useState("Loading...");
  const [forecast, setForecast] = useState(null);

  const ask = async () => {
    try {
      const { granted } = await Location.requestForegroundPermissionsAsync();
      if (!granted) {
        setCity("Permission not granted");
        return;
      }

      const {
        coords: { latitude, longitude },
      } = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
      const location = await Location.reverseGeocodeAsync({ latitude, longitude });
      setCity(location[0].region + " " + location[0].district);

      const forecastResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${WEATHER_API_KEY}&units=metric`
      );
      const forecastJson = await forecastResponse.json();
      setForecast(forecastJson.list.filter((item, index) => index % 8 === 0));
    } catch (error) {
      console.error("Error in ask function:", error);
      setCity("Error getting location");
    }
  };

  useEffect(() => {
    ask();
  }, []);

  if (!forecast) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  return (
    <ScrollView pagingEnabled horizontal showsHorizontalScrollIndicator={false}>
      {forecast.map((day, index) => {
        const weather = weatherOptions[day.weather[0].main] || weatherOptions.Clear;
        return (
          <LinearGradient key={index} colors={weather.gradient} style={styles.container}>
            <StatusBar style="light" />
            <View style={styles.cityContainer}>
              <Text style={styles.cityName}>{city}</Text>
            </View>
            <View style={styles.weatherContainer}>
              <Fontisto name={weather.iconName} size={144} color="white" />
              <View style={styles.tempContainer}>
                <Text style={styles.temp}>{day.main.temp.toFixed(1)}°</Text>
                <Text style={styles.description}>{day.weather[0].main}</Text>
              </View>
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.title}>{weather.title}</Text>
              <Text style={styles.subtitle}>{weather.subtitle}</Text>
            </View>
            <Text style={styles.tinyText}>{new Date(day.dt * 1000).toLocaleDateString()}</Text>
          </LinearGradient>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: SCREEN_WIDTH,
  },
  cityContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  cityName: {
    fontSize: 38,
    fontWeight: "500",
    color: "white",
  },
  weatherContainer: {
    flex: 3,
    justifyContent: "center",
    alignItems: "center",
  },
  tempContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  temp: {
    fontSize: 78,
    fontWeight: "600",
    color: "white",
  },
  description: {
    fontSize: 24,
    color: "white",
    marginLeft: 10,
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 44,
    fontWeight: "600",
    color: "white",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 24,
    fontWeight: "400",
    color: "white",
  },
  tinyText: {
    fontSize: 20,
    color: "white",
    textAlign: "center",
    marginBottom: 20,
  },
});
