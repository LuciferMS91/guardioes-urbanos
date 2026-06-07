import { useCallback, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator
} from "react-native";
import { router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../api/api";

export default function PerfilScreen() {
    const [usuario, setUsuario] = useState<any>(null);
    const [carregando, setCarregando] = useState(true);

    useFocusEffect(
        useCallback(() => {
            carregarPerfil();
        }, [])
    );

    async function carregarPerfil() {
        try {
            setCarregando(true);

            const token = await AsyncStorage.getItem("token");

            const resposta = await api.get("/usuarios/me", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setUsuario(resposta.data);
        } catch {
            Alert.alert("Erro", "Não foi possível carregar o perfil.");
        } finally {
            setCarregando(false);
        }
    }

    async function sair() {
        await AsyncStorage.removeItem("token");
        router.replace("/login");
    }

    if (carregando) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#2563eb" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.titulo}>Meu Perfil</Text>

            <View style={styles.card}>
                <Text style={styles.label}>Nome</Text>
                <Text style={styles.valor}>{usuario?.nome}</Text>

                <Text style={styles.label}>Email</Text>
                <Text style={styles.valor}>{usuario?.email}</Text>

                <Text style={styles.label}>Telefone</Text>
                <Text style={styles.valor}>
                    {usuario?.telefone || "Não informado"}
                </Text>

                <Text style={styles.label}>Conta criada em</Text>
                <Text style={styles.valor}>
                    {usuario?.criado_em
                        ? new Date(usuario.criado_em).toLocaleDateString("pt-BR")
                        : "Não informado"}
                </Text>
            </View>

            <TouchableOpacity style={styles.botaoSair} onPress={sair}>
                <Text style={styles.textoBotao}>Sair da conta</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.botaoVoltar}
                onPress={() => router.back()}
            >
                <Text style={styles.textoVoltar}>Voltar</Text>
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
        textAlign: "center",
        marginBottom: 24
    },
    card: {
        backgroundColor: "#ffffff",
        padding: 20,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "#e2e8f0"
    },
    label: {
        fontSize: 14,
        color: "#64748b",
        fontWeight: "bold",
        marginTop: 12
    },
    valor: {
        fontSize: 17,
        color: "#0f172a",
        marginTop: 4
    },
    botaoSair: {
        backgroundColor: "#dc2626",
        padding: 16,
        borderRadius: 12,
        alignItems: "center",
        marginTop: 24
    },
    textoBotao: {
        color: "#ffffff",
        fontWeight: "bold",
        fontSize: 16
    },
    botaoVoltar: {
        alignItems: "center",
        padding: 16
    },
    textoVoltar: {
        color: "#2563eb",
        fontWeight: "bold"
    }
});