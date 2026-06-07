import { useCallback, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Image
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../api/api";

const API_URL = "http://192.168.1.121:3000";

function iconeTipo(tipo: string) {
    const mapa: any = {
        ASSALTO_ROUBO: "🚨",
        ATIVIDADE_SUSPEITA: "👀",
        FALTA_ILUMINACAO: "💡",
        ALAGAMENTO: "🌊",
        VIA_INTRANSITAVEL: "🚧",
        QUEDA_ENERGIA: "⚡",
        FALTA_AGUA: "🚰",
        OUTROS: "📍"
    };

    return mapa[tipo] || "📍";
}

export default function MeusAlertasScreen() {
    const [alertas, setAlertas] = useState<any[]>([]);
    const [carregando, setCarregando] = useState(true);

    useFocusEffect(
        useCallback(() => {
            carregarMeusAlertas();
        }, [])
    );

    async function carregarMeusAlertas() {
        try {
            setCarregando(true);
            const token = await AsyncStorage.getItem("token");

            const resposta = await api.get("/usuarios/me/alertas", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setAlertas(resposta.data);
        } catch {
            Alert.alert("Erro", "Não foi possível carregar seus alertas.");
        } finally {
            setCarregando(false);
        }
    }

    async function resolverAlerta(id: number) {
        try {
            const token = await AsyncStorage.getItem("token");

            await api.patch(`/alertas/${id}/resolver`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            Alert.alert("Sucesso", "Alerta marcado como resolvido.");
            carregarMeusAlertas();
        } catch {
            Alert.alert("Erro", "Não foi possível resolver o alerta.");
        }
    }

    async function excluirAlerta(id: number) {
        Alert.alert(
            "Excluir alerta",
            "Tem certeza que deseja excluir este alerta?",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Excluir",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const token = await AsyncStorage.getItem("token");

                            await api.delete(`/alertas/${id}`, {
                                headers: {
                                    Authorization: `Bearer ${token}`
                                }
                            });

                            Alert.alert("Sucesso", "Alerta excluído.");
                            carregarMeusAlertas();
                        } catch {
                            Alert.alert("Erro", "Não foi possível excluir o alerta.");
                        }
                    }
                }
            ]
        );
    }

    if (carregando) {
        return (
            <View style={styles.centralizado}>
                <ActivityIndicator size="large" color="#2563eb" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.titulo}>Meus Alertas</Text>

            <FlatList
                data={alertas}
                keyExtractor={(item) => String(item.id)}
                ListEmptyComponent={
                    <Text style={styles.vazio}>Você ainda não criou alertas.</Text>
                }
                renderItem={({ item }) => {
                    const foto = item.foto_url ? `${API_URL}${item.foto_url}` : null;

                    return (
                        <View style={styles.card}>
                            {foto && (
                                <Image source={{ uri: foto }} style={styles.foto} />
                            )}

                            <Text style={styles.tipo}>
                                {iconeTipo(item.tipo)} {item.tipo?.replaceAll("_", " ")}
                            </Text>

                            <Text style={styles.descricao}>{item.descricao}</Text>

                            <Text style={styles.data}>
                                {new Date(item.criado_em).toLocaleString("pt-BR")}
                            </Text>

                            <Text style={styles.status}>
                                Status: {item.status || "ativo"} · ✅ {item.confirmacoes || 0} · ❌ {item.discordancias || 0}
                            </Text>

                            <TouchableOpacity
                                style={styles.botaoDetalhes}
                                onPress={() =>
                                    router.push({
                                        pathname: "/detalhe-alerta",
                                        params: item
                                    } as any)
                                }
                            >
                                <Text style={styles.textoBotao}>Ver Detalhes</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.botaoEditar}
                                onPress={() =>
                                    router.push({
                                        pathname: "/editar-alerta",
                                        params: item
                                    } as any)
                                }
                            >
                                <Text style={styles.textoBotao}>Editar</Text>
                            </TouchableOpacity>

                            {item.status !== "resolvido" && (
                                <TouchableOpacity
                                    style={styles.botaoResolver}
                                    onPress={() => resolverAlerta(item.id)}
                                >
                                    <Text style={styles.textoBotao}>
                                        Marcar como Resolvido
                                    </Text>
                                </TouchableOpacity>
                            )}

                            <TouchableOpacity
                                style={styles.botaoExcluir}
                                onPress={() => excluirAlerta(item.id)}
                            >
                                <Text style={styles.textoBotao}>Excluir</Text>
                            </TouchableOpacity>
                        </View>
                    );
                }}
            />

            <TouchableOpacity style={styles.voltar} onPress={() => router.back()}>
                <Text style={styles.textoVoltar}>Voltar</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    centralizado: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f8fafc"
    },
    container: {
        flex: 1,
        backgroundColor: "#f8fafc",
        padding: 20,
        paddingTop: 50
    },
    titulo: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#0f172a",
        textAlign: "center",
        marginBottom: 20
    },
    card: {
        backgroundColor: "#ffffff",
        padding: 16,
        borderRadius: 18,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: "#e2e8f0",
        elevation: 2
    },
    foto: {
        width: "100%",
        height: 160,
        borderRadius: 14,
        marginBottom: 12
    },
    tipo: {
        fontWeight: "bold",
        color: "#dc2626",
        fontSize: 16
    },
    descricao: {
        color: "#334155",
        marginTop: 6
    },
    data: {
        color: "#64748b",
        marginTop: 8,
        fontSize: 13
    },
    status: {
        color: "#2563eb",
        fontWeight: "bold",
        marginTop: 6
    },
    botaoDetalhes: {
        backgroundColor: "#2563eb",
        padding: 12,
        borderRadius: 10,
        alignItems: "center",
        marginTop: 12
    },
    botaoEditar: {
        backgroundColor: "#16a34a",
        padding: 12,
        borderRadius: 10,
        alignItems: "center",
        marginTop: 8
    },
    botaoResolver: {
        backgroundColor: "#0f766e",
        padding: 12,
        borderRadius: 10,
        alignItems: "center",
        marginTop: 8
    },
    botaoExcluir: {
        backgroundColor: "#dc2626",
        padding: 12,
        borderRadius: 10,
        alignItems: "center",
        marginTop: 8
    },
    textoBotao: {
        color: "#ffffff",
        fontWeight: "bold"
    },
    voltar: {
        padding: 14,
        alignItems: "center"
    },
    textoVoltar: {
        color: "#2563eb",
        fontWeight: "bold"
    },
    vazio: {
        textAlign: "center",
        color: "#64748b",
        marginTop: 40
    }
});