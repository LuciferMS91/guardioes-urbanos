import { useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SplashScreen() {
    useEffect(() => {
        verificarLogin();
    }, []);

    async function verificarLogin() {
        const token = await AsyncStorage.getItem("token");

        setTimeout(() => {
            if (token) {
                router.replace("/mapa");
            } else {
                router.replace("/login");
            }
        }, 1500);
    }

    return (
        <View style={styles.container}>
            <Text style={styles.logo}>Guardiões Urbanos</Text>
            <Text style={styles.subtitulo}>Segurança colaborativa</Text>
            <ActivityIndicator size="large" color="#2563eb" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8fafc",
        alignItems: "center",
        justifyContent: "center",
        padding: 24
    },
    logo: {
        fontSize: 30,
        fontWeight: "bold",
        color: "#0f172a",
        marginBottom: 8
    },
    subtitulo: {
        fontSize: 16,
        color: "#64748b",
        marginBottom: 32
    }
});