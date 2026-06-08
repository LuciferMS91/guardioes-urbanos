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
import api, { buildAssetUrl } from "../api/api";

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

export default function HistoricoScreen() {
    const [alertas, setAlertas] = useState<any[]>([]);
    const [carregando, setCarregando] = useState(true);

    useFocusEffect(
        useCallback(() => {
            carregarAlertas();
        }, [])
    );

    async function carregarAlertas() {
        try {
            setCarregando(true);
            const resposta = await api.get("/alertas");
            setAlertas(resposta.data);
        } catch {
            Alert.alert("Erro", "Não foi possível carregar o histórico.");
        } finally {
            setCarregando(false);
        }
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
            <Text style={styles.titulo}>Histórico de Alertas</Text>

            <FlatList
                data={alertas}
                keyExtractor={(item) => String(item.id)}
                ListEmptyComponent={
                    <Text style={styles.vazio}>Nenhum alerta encontrado.</Text>
                }
                renderItem={({ item }) => {
                    const foto = buildAssetUrl(item.foto_url);

                    return (
                        <TouchableOpacity
                            style={styles.card}
                            onPress={() =>
                                router.push({
                                    pathname: "/detalhe-alerta",
                                    params: item
                                } as any)
                            }
                        >
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
                        </TouchableOpacity>
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
        fontSize: 26,
        fontWeight: "bold",
        color: "#0f172a",
        marginBottom: 20,
        textAlign: "center"
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
        fontSize: 16,
        color: "#dc2626"
    },
    descricao: {
        marginTop: 6,
        color: "#334155"
    },
    data: {
        marginTop: 8,
        color: "#64748b",
        fontSize: 13
    },
    status: {
        marginTop: 6,
        fontWeight: "bold",
        color: "#2563eb"
    },
    vazio: {
        textAlign: "center",
        color: "#64748b",
        marginTop: 40
    },
    voltar: {
        padding: 14,
        alignItems: "center"
    },
    textoVoltar: {
        color: "#2563eb",
        fontWeight: "bold"
    }
});
