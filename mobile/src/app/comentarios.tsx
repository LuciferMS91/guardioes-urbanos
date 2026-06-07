import { useEffect, useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    Alert,
    ActivityIndicator
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../api/api";

export default function ComentariosScreen() {
    const { id, tipo, descricao } = useLocalSearchParams();

    const [comentarios, setComentarios] = useState<any[]>([]);
    const [comentario, setComentario] = useState("");
    const [carregando, setCarregando] = useState(true);
    const [enviando, setEnviando] = useState(false);

    useEffect(() => {
        carregarComentarios();
    }, []);

    async function carregarComentarios() {
        try {
            setCarregando(true);
            const resposta = await api.get(`/alertas/${id}/comentarios`);
            setComentarios(resposta.data);
        } catch {
            Alert.alert("Erro", "Não foi possível carregar os comentários.");
        } finally {
            setCarregando(false);
        }
    }

    async function enviarComentario() {
        if (!comentario.trim()) {
            Alert.alert("Atenção", "Digite um comentário.");
            return;
        }

        try {
            setEnviando(true);

            const token = await AsyncStorage.getItem("token");

            await api.post(
                `/alertas/${id}/comentarios`,
                { comentario },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setComentario("");
            await carregarComentarios();
        } catch {
            Alert.alert("Erro", "Não foi possível enviar o comentário.");
        } finally {
            setEnviando(false);
        }
    }

    return (
        <View style={styles.container}>
            <Text style={styles.titulo}>Comentários</Text>

            <View style={styles.alertaBox}>
                <Text style={styles.tipo}>
                    {String(tipo).replaceAll("_", " ")}
                </Text>
                <Text style={styles.descricao}>{descricao}</Text>
            </View>

            {carregando ? (
                <ActivityIndicator size="large" color="#2563eb" />
            ) : (
                <FlatList
                    data={comentarios}
                    keyExtractor={(item) => String(item.id)}
                    ListEmptyComponent={
                        <Text style={styles.vazio}>
                            Nenhum comentário ainda.
                        </Text>
                    }
                    renderItem={({ item }) => (
                        <View style={styles.comentarioBox}>
                            <Text style={styles.nome}>
                                {item.nome || "Usuário"}
                            </Text>

                            <Text style={styles.comentario}>
                                {item.comentario}
                            </Text>

                            <Text style={styles.data}>
                                {new Date(item.criado_em).toLocaleString("pt-BR")}
                            </Text>
                        </View>
                    )}
                />
            )}

            <TextInput
                style={styles.input}
                placeholder="Escreva um comentário..."
                value={comentario}
                onChangeText={setComentario}
            />

            <TouchableOpacity
                style={styles.botao}
                onPress={enviarComentario}
                disabled={enviando}
            >
                <Text style={styles.textoBotao}>
                    {enviando ? "Enviando..." : "Enviar Comentário"}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.voltar}
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
        padding: 20,
        paddingTop: 50
    },
    titulo: {
        fontSize: 26,
        fontWeight: "bold",
        color: "#0f172a",
        marginBottom: 16,
        textAlign: "center"
    },
    alertaBox: {
        backgroundColor: "#ffffff",
        padding: 14,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#e2e8f0"
    },
    tipo: {
        fontWeight: "bold",
        color: "#dc2626"
    },
    descricao: {
        marginTop: 6,
        color: "#334155"
    },
    comentarioBox: {
        backgroundColor: "#ffffff",
        padding: 12,
        borderRadius: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: "#e2e8f0"
    },
    nome: {
        fontWeight: "bold",
        color: "#0f172a"
    },
    comentario: {
        color: "#334155",
        marginTop: 4
    },
    data: {
        color: "#64748b",
        fontSize: 12,
        marginTop: 6
    },
    input: {
        backgroundColor: "#ffffff",
        borderWidth: 1,
        borderColor: "#cbd5e1",
        borderRadius: 10,
        padding: 14,
        marginTop: 10
    },
    botao: {
        backgroundColor: "#2563eb",
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
        marginVertical: 24
    }
});