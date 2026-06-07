import { useCallback, useEffect, useRef, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert
} from "react-native";
import MapView, { Marker, Circle } from "react-native-maps";
import { router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import api from "../api/api";

export default function MapaScreen() {
    const mapaRef = useRef<MapView | null>(null);

    const [alertas, setAlertas] = useState<any[]>([]);
    const [heatmap, setHeatmap] = useState<any[]>([]);
    const [notificado, setNotificado] = useState(false);
    const [localizacaoCarregada, setLocalizacaoCarregada] = useState(false);

    const [localizacao, setLocalizacao] = useState({
        latitude: -15.8075,
        longitude: -48.2812,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02
    });

    useEffect(() => {
        carregarLocalizacao();
    }, []);

    useFocusEffect(
        useCallback(() => {
            carregarAlertas();
            carregarHeatmap();
        }, [])
    );

    async function carregarLocalizacao() {
        const { status } =
            await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
            Alert.alert(
                "Permissão negada",
                "Não foi possível acessar sua localização."
            );
            return;
        }

        const posicao =
            await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High
            });

        const novaLocalizacao = {
            latitude: posicao.coords.latitude,
            longitude: posicao.coords.longitude,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02
        };

        setLocalizacao(novaLocalizacao);
        setLocalizacaoCarregada(true);

        setTimeout(() => {
            mapaRef.current?.animateToRegion(
                novaLocalizacao,
                800
            );
        }, 500);
    }

    async function carregarAlertas() {
        try {
            const resposta = await api.get("/mapa/alertas");

            setAlertas(resposta.data);
            verificarAlertasProximos(resposta.data);

        } catch {
            Alert.alert(
                "Erro",
                "Não foi possível carregar os alertas."
            );
        }
    }

    async function carregarHeatmap() {
        try {
            const resposta = await api.get("/mapa/heatmap");
            setHeatmap(resposta.data);
        } catch {
            setHeatmap([]);
        }
    }

    function calcularDistanciaMetros(
        lat1: number,
        lon1: number,
        lat2: number,
        lon2: number
    ) {
        const R = 6371000;
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLon = ((lon2 - lon1) * Math.PI) / 180;

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((lat1 * Math.PI) / 180) *
                Math.cos((lat2 * Math.PI) / 180) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);

        const c = 2 * Math.atan2(
            Math.sqrt(a),
            Math.sqrt(1 - a)
        );

        return R * c;
    }

    function verificarAlertasProximos(lista: any[]) {
        if (
            notificado ||
            !localizacaoCarregada ||
            !localizacao.latitude ||
            !lista.length
        ) {
            return;
        }

        const alertaProximo = lista.find((alerta) => {
            const distancia = calcularDistanciaMetros(
                localizacao.latitude,
                localizacao.longitude,
                Number(alerta.latitude),
                Number(alerta.longitude)
            );

            return distancia <= 700;
        });

        if (alertaProximo) {
            setNotificado(true);

            Alert.alert(
                "⚠️ Alerta próximo",
                `${alertaProximo.tipo?.replaceAll("_", " ")} perto da sua localização.`
            );
        }
    }

    async function sair() {
        await AsyncStorage.removeItem("token");
        router.replace("/login");
    }

    function corDoMarcador(tipo: string) {
        if (tipo === "ASSALTO_ROUBO") return "red";
        if (tipo === "ATIVIDADE_SUSPEITA") return "orange";
        if (tipo === "FALTA_ILUMINACAO") return "yellow";
        if (tipo === "ALAGAMENTO") return "blue";
        if (tipo === "VIA_INTRANSITAVEL") return "purple";
        if (tipo === "QUEDA_ENERGIA") return "violet";
        if (tipo === "FALTA_AGUA") return "green";
        return "gray";
    }

    return (
        <View style={styles.container}>
            <MapView
                ref={mapaRef}
                style={styles.mapa}
                initialRegion={localizacao}
                showsUserLocation={true}
                showsMyLocationButton={true}
            >
                {localizacaoCarregada && (
                    <Marker
                        coordinate={{
                            latitude: localizacao.latitude,
                            longitude: localizacao.longitude
                        }}
                        title="Você está aqui"
                        description="Sua localização atual"
                        pinColor="blue"
                    />
                )}

                {heatmap.map((regiao, index) => (
                    <Circle
                        key={index}
                        center={{
                            latitude: Number(regiao.latitude),
                            longitude: Number(regiao.longitude)
                        }}
                        radius={300}
                        strokeColor={
                            regiao.nivel === "CRITICO"
                                ? "rgba(220,38,38,0.8)"
                                : regiao.nivel === "ALTO"
                                ? "rgba(249,115,22,0.8)"
                                : regiao.nivel === "MEDIO"
                                ? "rgba(234,179,8,0.8)"
                                : "rgba(34,197,94,0.8)"
                        }
                        fillColor={
                            regiao.nivel === "CRITICO"
                                ? "rgba(220,38,38,0.25)"
                                : regiao.nivel === "ALTO"
                                ? "rgba(249,115,22,0.25)"
                                : regiao.nivel === "MEDIO"
                                ? "rgba(234,179,8,0.25)"
                                : "rgba(34,197,94,0.25)"
                        }
                    />
                ))}

                {alertas.map((alerta) => (
                    <Marker
                        key={alerta.id}
                        pinColor={corDoMarcador(alerta.tipo)}
                        coordinate={{
                            latitude: Number(alerta.latitude),
                            longitude: Number(alerta.longitude)
                        }}
                        title={alerta.tipo?.replaceAll("_", " ")}
                        description={alerta.descricao}
                        onCalloutPress={() =>
                            router.push({
                                pathname: "/detalhe-alerta",
                                params: alerta
                            } as any)
                        }
                    />
                ))}
            </MapView>

            <View style={styles.topo}>
                <View>
                    <Text style={styles.titulo}>
                        Guardiões Urbanos
                    </Text>

                    <Text style={styles.subtitulo}>
                        Segurança colaborativa
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
                    <Text style={styles.iconeMenu}>🚨</Text>
                    <Text style={styles.textoMenu}>SOS</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.botaoMenu}
                    onPress={() => router.push("/historico" as any)}
                >
                    <Text style={styles.iconeMenu}>📋</Text>
                    <Text style={styles.textoMenu}>Histórico</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.botaoMenu}
                    onPress={() => router.push("/meus-alertas" as any)}
                >
                    <Text style={styles.iconeMenu}>📍</Text>
                    <Text style={styles.textoMenu}>Meus</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.botaoMenu}
                    onPress={() => router.push("/perfil" as any)}
                >
                    <Text style={styles.iconeMenu}>👤</Text>
                    <Text style={styles.textoMenu}>Perfil</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                style={styles.botaoAlerta}
                onPress={() => router.push("/novo-alerta" as any)}
            >
                <Text style={styles.textoBotao}>
                    + Novo Alerta
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },

    mapa: {
        flex: 1
    },

    topo: {
        position: "absolute",
        top: 45,
        left: 16,
        right: 16,
        backgroundColor: "#ffffff",
        padding: 14,
        borderRadius: 18,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        elevation: 5
    },

    titulo: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#0f172a"
    },

    subtitulo: {
        fontSize: 12,
        color: "#64748b",
        marginTop: 2
    },

    sair: {
        color: "#dc2626",
        fontWeight: "bold"
    },

    menu: {
        position: "absolute",
        bottom: 100,
        left: 12,
        right: 12,
        flexDirection: "row",
        gap: 6
    },

    botaoMenu: {
        flex: 1,
        backgroundColor: "#ffffff",
        paddingVertical: 10,
        borderRadius: 16,
        alignItems: "center",
        elevation: 5
    },

    iconeMenu: {
        fontSize: 20,
        marginBottom: 2
    },

    textoMenu: {
        color: "#2563eb",
        fontWeight: "bold",
        fontSize: 11
    },

    botaoAlerta: {
        position: "absolute",
        bottom: 30,
        left: 20,
        right: 20,
        backgroundColor: "#2563eb",
        padding: 16,
        borderRadius: 18,
        alignItems: "center",
        elevation: 5
    },

    textoBotao: {
        color: "#ffffff",
        fontWeight: "bold",
        fontSize: 16
    }
});