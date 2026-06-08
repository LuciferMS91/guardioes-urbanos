import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import api from "../api/api";

function formatarTipo(tipo: string) {
    return tipo?.replaceAll("_", " ") || "ALERTA";
}

export default function MapaRoute() {
    const [alertas, setAlertas] = useState<any[]>([]);
    const [carregando, setCarregando] = useState(true);

    useEffect(() => {
        carregarAlertas();
    }, []);

    async function carregarAlertas() {
        try {
            setCarregando(true);
            const resposta = await api.get("/mapa/alertas");
            setAlertas(resposta.data);
        } catch {
            Alert.alert(
                "Erro",
                "Não foi possível carregar os alertas do mapa."
            );
        } finally {
            setCarregando(false);
        }
    }

    async function sair() {
        await AsyncStorage.removeItem("token");
        router.replace("/login");
    }

    return (
        <View style={styles.container}>
            <View style={styles.topo}>
                <View>
                    <Text style={styles.titulo}>Guardiões Urbanos</Text>
                    <Text style={styles.subtitulo}>
                        Alertas ativos na versão web
                    </Text>
                </View>

                <TouchableOpacity onPress={sair}>
                    <Text style={styles.sair}>Sair</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.menu}>
                <TouchableOpacity
                    style={styles.botaoMenu}
                    onPress={() => router.push("/emergencia" as any)}
                >
                    <Text style={styles.textoMenu}>SOS</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.botaoMenu}
                    onPress={() => router.push("/historico" as any)}
                >
                    <Text style={styles.textoMenu}>Histórico</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.botaoMenu}
                    onPress={() => router.push("/meus-alertas" as any)}
                >
                    <Text style={styles.textoMenu}>Meus</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.botaoMenu}
                    onPress={() => router.push("/perfil" as any)}
                >
                    <Text style={styles.textoMenu}>Perfil</Text>
                </TouchableOpacity>
            </View>

            {carregando ? (
                <View style={styles.centralizado}>
                    <ActivityIndicator size="large" color="#2563eb" />
                </View>
            ) : (
                <FlatList
                    data={alertas}
                    keyExtractor={(item) => String(item.id)}
                    contentContainerStyle={styles.lista}
                    ListEmptyComponent={
                        <Text style={styles.vazio}>
                            Nenhum alerta ativo encontrado.
                        </Text>
                    }
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.card}
                            onPress={() =>
                                router.push({
                                    pathname: "/detalhe-alerta",
                                    params: item
                                } as any)
                            }
                        >
                            <Text style={styles.tipo}>
                                {formatarTipo(item.tipo)}
                            </Text>

                            <Text style={styles.descricao}>
                                {item.descricao}
                            </Text>

                            <Text style={styles.localizacao}>
                                Lat: {item.latitude} | Long: {item.longitude}
                            </Text>
                        </TouchableOpacity>
                    )}
                />
            )}

            <TouchableOpacity
                style={styles.botaoAlerta}
                onPress={() => router.push("/novo-alerta" as any)}
            >
                <Text style={styles.textoBotao}>+ Novo Alerta</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8fafc",
        padding: 20,
        paddingTop: 40
    },
    topo: {
        backgroundColor: "#ffffff",
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#e2e8f0",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
    },
    titulo: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#0f172a"
    },
    subtitulo: {
        color: "#64748b",
        marginTop: 4
    },
    sair: {
        color: "#dc2626",
        fontWeight: "bold"
    },
    menu: {
        flexDirection: "row",
        gap: 8,
        marginTop: 12
    },
    botaoMenu: {
        flex: 1,
        backgroundColor: "#ffffff",
        padding: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#e2e8f0",
        alignItems: "center"
    },
    textoMenu: {
        color: "#2563eb",
        fontWeight: "bold"
    },
    centralizado: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    },
    lista: {
        paddingVertical: 16,
        paddingBottom: 96
    },
    card: {
        backgroundColor: "#ffffff",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#e2e8f0",
        padding: 16,
        marginBottom: 12
    },
    tipo: {
        color: "#dc2626",
        fontSize: 16,
        fontWeight: "bold"
    },
    descricao: {
        color: "#334155",
        marginTop: 8
    },
    localizacao: {
        color: "#64748b",
        marginTop: 8,
        fontSize: 13
    },
    vazio: {
        textAlign: "center",
        color: "#64748b",
        marginTop: 40
    },
    botaoAlerta: {
        position: "absolute",
        bottom: 24,
        left: 20,
        right: 20,
        backgroundColor: "#2563eb",
        padding: 16,
        borderRadius: 12,
        alignItems: "center"
    },
    textoBotao: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "bold"
    }
});
