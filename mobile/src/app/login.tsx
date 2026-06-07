import { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert
} from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../api/api";

export default function LoginScreen() {
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [carregando, setCarregando] = useState(false);

    async function entrar() {
        if (!email || !senha) {
            Alert.alert("Atenção", "Informe email e senha.");
            return;
        }

        try {
            setCarregando(true);

            const resposta = await api.post("/auth/login", {
                email,
                senha
            });

            await AsyncStorage.setItem("token", resposta.data.token);

            router.replace("/mapa");

        } catch (erro: any) {
    const mensagem =
        erro.response?.data?.erro ||
        erro.message ||
        "Não foi possível fazer login.";

    Alert.alert("Erro", mensagem);
} finally {
    setCarregando(false);
}
    }

    return (
        <View style={styles.container}>
            <Text style={styles.titulo}>Guardiões Urbanos</Text>
            <Text style={styles.subtitulo}>Entre na sua conta</Text>

            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
            />

            <TextInput
                style={styles.input}
                placeholder="Senha"
                value={senha}
                onChangeText={setSenha}
                secureTextEntry
            />

            <TouchableOpacity style={styles.botao} onPress={entrar}>
                <Text style={styles.textoBotao}>
                    {carregando ? "Entrando..." : "Entrar"}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push("/cadastro")}>
                <Text style={styles.link}>Criar uma conta</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8fafc",
        padding: 24,
        justifyContent: "center"
    },
    titulo: {
        fontSize: 30,
        fontWeight: "bold",
        color: "#0f172a",
        textAlign: "center"
    },
    subtitulo: {
        fontSize: 16,
        color: "#64748b",
        textAlign: "center",
        marginBottom: 32
    },
    input: {
        backgroundColor: "#fff",
        padding: 14,
        borderRadius: 10,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#cbd5e1"
    },
    botao: {
        backgroundColor: "#2563eb",
        padding: 15,
        borderRadius: 10,
        alignItems: "center",
        marginTop: 8
    },
    textoBotao: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16
    },
    link: {
        textAlign: "center",
        color: "#2563eb",
        marginTop: 20,
        fontWeight: "bold"
    }
});