import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ScrollView,
    Alert
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../api/api";

const API_URL = "http://192.168.1.121:3000";

export default function DetalheAlertaScreen() {
    const params = useLocalSearchParams();

    const fotoUrl = params.foto_url
        ? `${API_URL}${params.foto_url}`
        : null;

    async function confirmar() {
        try {
            const token = await AsyncStorage.getItem("token");

            await api.post(
                `/alertas/${params.id}/confirmar`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            Alert.alert("Sucesso", "Você confirmou este alerta.");
        } catch {
            Alert.alert("Erro", "Não foi possível confirmar o alerta.");
        }
    }

    async function discordar() {
        try {
            const token = await AsyncStorage.getItem("token");

            await api.post(
                `/alertas/${params.id}/discordar`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            Alert.alert("Sucesso", "Sua discordância foi registrada.");
        } catch {
            Alert.alert("Erro", "Não foi possível registrar discordância.");
        }
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.titulo}>Detalhes do Alerta</Text>

            <View style={styles.card}>
                <Text style={styles.tipo}>
                    {String(params.tipo).replaceAll("_", " ")}
                </Text>

                {fotoUrl && (
                    <Image source={{ uri: fotoUrl }} style={styles.foto} />
                )}

                <Text style={styles.label}>Descrição</Text>
                <Text style={styles.valor}>{params.descricao}</Text>

                <Text style={styles.label}>Status</Text>
                <Text style={styles.status}>{params.status || "ativo"}</Text>

                <Text style={styles.label}>Confirmações</Text>
                <Text style={styles.valor}>
                    ✅ {params.confirmacoes || 0} confirmações
                </Text>

                <Text style={styles.valor}>
                    ❌ {params.discordancias || 0} discordâncias
                </Text>

                <Text style={styles.label}>Anônimo</Text>
                <Text style={styles.valor}>
                    {String(params.anonimo) === "true" ? "Sim" : "Não"}
                </Text>

                <Text style={styles.label}>Data e hora</Text>
                <Text style={styles.valor}>
                    {params.criado_em
                        ? new Date(String(params.criado_em)).toLocaleString("pt-BR")
                        : "Não informado"}
                </Text>

                <Text style={styles.label}>Localização</Text>
                <Text style={styles.valor}>
                    Latitude: {params.latitude}{"\n"}
                    Longitude: {params.longitude}
                </Text>
            </View>

            <TouchableOpacity style={styles.botaoConfirmar} onPress={confirmar}>
                <Text style={styles.textoBotao}>Confirmar Alerta</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.botaoDiscordar} onPress={discordar}>
                <Text style={styles.textoBotao}>Discordar</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.botao}
                onPress={() =>
                    router.push({
                        pathname: "/comentarios",
                        params: {
                            id: params.id,
                            tipo: params.tipo,
                            descricao: params.descricao
                        }
                    } as any)
                }
            >
                <Text style={styles.textoBotao}>Comentários</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.botaoEditar}
                onPress={() =>
                    router.push({
                        pathname: "/editar-alerta",
                        params
                    } as any)
                }
            >
                <Text style={styles.textoBotao}>Editar Alerta</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.voltar} onPress={() => router.back()}>
                <Text style={styles.textoVoltar}>Voltar</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: "#f8fafc",
        padding: 24,
        justifyContent: "center"
    },
    titulo: {
        fontSize: 28,
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
    tipo: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#dc2626",
        marginBottom: 12
    },
    foto: {
        width: "100%",
        height: 220,
        borderRadius: 12,
        marginBottom: 16
    },
    label: {
        marginTop: 12,
        fontWeight: "bold",
        color: "#64748b"
    },
    valor: {
        marginTop: 4,
        color: "#0f172a",
        fontSize: 16
    },
    status: {
        marginTop: 4,
        color: "#2563eb",
        fontSize: 16,
        fontWeight: "bold"
    },
    botaoConfirmar: {
        backgroundColor: "#16a34a",
        padding: 15,
        borderRadius: 12,
        alignItems: "center",
        marginTop: 20
    },
    botaoDiscordar: {
        backgroundColor: "#f97316",
        padding: 15,
        borderRadius: 12,
        alignItems: "center",
        marginTop: 10
    },
    botao: {
        backgroundColor: "#2563eb",
        padding: 15,
        borderRadius: 12,
        alignItems: "center",
        marginTop: 10
    },
    botaoEditar: {
        backgroundColor: "#0f766e",
        padding: 15,
        borderRadius: 12,
        alignItems: "center",
        marginTop: 10
    },
    textoBotao: {
        color: "#ffffff",
        fontWeight: "bold"
    },
    voltar: {
        padding: 16,
        alignItems: "center"
    },
    textoVoltar: {
        color: "#2563eb",
        fontWeight: "bold"
    }
});