import React, { useEffect, useMemo, useState } from "react";
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

type CentroMapa = {
    latitude: number;
    longitude: number;
    margem: number;
    origem: string;
    precisao?: number;
};

function coordenadaValida(alerta: any) {
    const latitude = Number(alerta?.latitude);
    const longitude = Number(alerta?.longitude);

    return (
        Number.isFinite(latitude) &&
        Number.isFinite(longitude) &&
        latitude >= -90 &&
        latitude <= 90 &&
        longitude >= -180 &&
        longitude <= 180
    );
}

function obterCentroMapa(alertas: any[], localizacao: CentroMapa | null) {
    if (localizacao) {
        return localizacao;
    }

    const alertaComLocalizacao = alertas.find(coordenadaValida);

    const latitude = alertaComLocalizacao
        ? Number(alertaComLocalizacao.latitude)
        : -23.55052;
    const longitude = alertaComLocalizacao
        ? Number(alertaComLocalizacao.longitude)
        : -46.633308;
    const margem = alertaComLocalizacao ? 0.025 : 0.06;

    return {
        latitude,
        longitude,
        margem,
        origem: alertaComLocalizacao ? "Alerta ativo" : "Centro padrão"
    };
}

function montarUrlMapa(alertas: any[], localizacao: CentroMapa | null) {
    const { latitude, longitude, margem } = obterCentroMapa(
        alertas,
        localizacao
    );

    const bbox = [
        longitude - margem,
        latitude - margem,
        longitude + margem,
        latitude + margem
    ].join(",");

    return (
        "https://www.openstreetmap.org/export/embed.html" +
        `?bbox=${encodeURIComponent(bbox)}` +
        "&layer=mapnik" +
        `&marker=${encodeURIComponent(`${latitude},${longitude}`)}`
    );
}

export default function MapaRoute() {
    const [alertas, setAlertas] = useState<any[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [localizacaoRede, setLocalizacaoRede] =
        useState<CentroMapa | null>(null);
    const centroMapa = useMemo(
        () => obterCentroMapa(alertas, localizacaoRede),
        [alertas, localizacaoRede]
    );
    const mapaUrl = useMemo(
        () => montarUrlMapa(alertas, localizacaoRede),
        [alertas, localizacaoRede]
    );

    useEffect(() => {
        carregarAlertas();
        carregarLocalizacaoRede();
    }, []);

    function carregarLocalizacaoRede() {
        if (
            typeof navigator === "undefined" ||
            !("geolocation" in navigator)
        ) {
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (posicao) => {
                setLocalizacaoRede({
                    latitude: posicao.coords.latitude,
                    longitude: posicao.coords.longitude,
                    margem: 0.012,
                    origem: "Localização atual",
                    precisao: posicao.coords.accuracy
                });
            },
            () => {
                setLocalizacaoRede(null);
            },
            {
                enableHighAccuracy: true,
                maximumAge: 60000,
                timeout: 12000
            }
        );
    }

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

            <View style={styles.conteudo}>
                <View style={styles.mapaContainer}>
                    {React.createElement("iframe", {
                        title: "Mapa Guardiões Urbanos",
                        src: mapaUrl,
                        style: {
                            border: 0,
                            width: "100%",
                            height: "100%"
                        }
                    })}

                    <View style={styles.resumoMapa}>
                        <Text style={styles.resumoTitulo}>
                            {centroMapa.origem}
                        </Text>

                        <Text style={styles.resumoTexto}>
                            {centroMapa.latitude.toFixed(5)},{" "}
                            {centroMapa.longitude.toFixed(5)}
                        </Text>

                        {centroMapa.precisao ? (
                            <Text style={styles.resumoTexto}>
                                Precisão aprox. {Math.round(centroMapa.precisao)}m
                            </Text>
                        ) : null}

                        <Text style={styles.resumoTexto}>
                            {alertas.length} alertas ativos
                        </Text>

                        <TouchableOpacity
                            style={styles.botaoLocalizacao}
                            onPress={carregarLocalizacaoRede}
                        >
                            <Text style={styles.textoLocalizacao}>
                                Atualizar localização
                            </Text>
                        </TouchableOpacity>
                    </View>
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
            </View>

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
    conteudo: {
        flex: 1,
        marginTop: 16,
        marginBottom: 84
    },
    mapaContainer: {
        height: 320,
        borderRadius: 8,
        overflow: "hidden",
        backgroundColor: "#dbeafe",
        borderWidth: 1,
        borderColor: "#cbd5e1"
    },
    resumoMapa: {
        position: "absolute",
        top: 12,
        left: 12,
        backgroundColor: "#ffffff",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#e2e8f0"
    },
    resumoTitulo: {
        color: "#0f172a",
        fontWeight: "bold"
    },
    resumoTexto: {
        color: "#475569",
        fontSize: 12,
        marginTop: 2
    },
    botaoLocalizacao: {
        marginTop: 8,
        backgroundColor: "#2563eb",
        paddingHorizontal: 10,
        paddingVertical: 7,
        borderRadius: 7,
        alignItems: "center"
    },
    textoLocalizacao: {
        color: "#ffffff",
        fontSize: 12,
        fontWeight: "bold"
    },
    centralizado: {
        paddingVertical: 24,
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
