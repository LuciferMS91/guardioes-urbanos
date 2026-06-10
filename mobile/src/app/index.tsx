import { useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Image } from "react-native";
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
            <Image
                source={require("../../assets/images/logo-transparente.png")}
                style={styles.logo}
                resizeMode="contain"
                accessibilityLabel="Guardiões Urbanos"
            />
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
        width: 220,
        height: 220,
        marginBottom: 12
    },
    subtitulo: {
        fontSize: 16,
        color: "#64748b",
        marginBottom: 32
    }
});
