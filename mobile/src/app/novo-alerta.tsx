import { useState } from "react";
import {
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ScrollView,
    Switch,
    Image,
    View
} from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";
import api from "../api/api";

const tipos = [
    "ASSALTO_ROUBO",
    "ATIVIDADE_SUSPEITA",
    "FALTA_ILUMINACAO",
    "ALAGAMENTO",
    "VIA_INTRANSITAVEL",
    "QUEDA_ENERGIA",
    "FALTA_AGUA",
    "OUTROS"
];

export default function NovoAlertaScreen() {
    const [tipo, setTipo] = useState("ASSALTO_ROUBO");
    const [descricao, setDescricao] = useState("");
    const [anonimo, setAnonimo] = useState(true);
    const [foto, setFoto] = useState<any>(null);
    const [carregando, setCarregando] = useState(false);

    async function escolherFoto() {
        const permissao =
            await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permissao.granted) {
            Alert.alert("Permissão negada", "Permita acesso à galeria.");
            return;
        }

        const resultado = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.7
        });

        if (!resultado.canceled) {
            setFoto(resultado.assets[0]);
        }
    }

    async function tirarFoto() {
        const permissao =
            await ImagePicker.requestCameraPermissionsAsync();

        if (!permissao.granted) {
            Alert.alert("Permissão negada", "Permita acesso à câmera.");
            return;
        }

        const resultado = await ImagePicker.launchCameraAsync({
            quality: 0.7
        });

        if (!resultado.canceled) {
            setFoto(resultado.assets[0]);
        }
    }

    async function enviarAlerta() {
        if (!descricao || descricao.length < 5) {
            Alert.alert("Atenção", "Descreva melhor o alerta.");
            return;
        }

        try {
            setCarregando(true);

            const { status } =
                await Location.requestForegroundPermissionsAsync();

            if (status !== "granted") {
                Alert.alert("Erro", "Permissão de localização negada.");
                return;
            }

            const posicao =
                await Location.getCurrentPositionAsync({});

            const token =
                await AsyncStorage.getItem("token");

            const formData = new FormData();

            formData.append("tipo", tipo);
            formData.append("descricao", descricao);
            formData.append("latitude", String(posicao.coords.latitude));
            formData.append("longitude", String(posicao.coords.longitude));
            formData.append("anonimo", String(anonimo));

            if (foto) {
                formData.append("foto", {
                    uri: foto.uri,
                    name: "alerta.jpg",
                    type: "image/jpeg"
                } as any);
            }

            await api.post("/alertas", formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data"
                }
            });

            Alert.alert("Sucesso", "Alerta criado com sucesso!");
            router.replace("/mapa" as any);

        } catch (erro: any) {
            const mensagem =
                erro?.response?.data?.erro ||
                erro?.message ||
                "Não foi possível criar o alerta.";

            Alert.alert("Erro", mensagem);
        } finally {
            setCarregando(false);
        }
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.titulo}>Novo Alerta</Text>

            <Text style={styles.label}>Tipo de ocorrência</Text>

            {tipos.map((item) => (
                <TouchableOpacity
                    key={item}
                    style={[
                        styles.tipo,
                        tipo === item && styles.tipoSelecionado
                    ]}
                    onPress={() => setTipo(item)}
                >
                    <Text
                        style={[
                            styles.textoTipo,
                            tipo === item && styles.textoTipoSelecionado
                        ]}
                    >
                        {item.replaceAll("_", " ")}
                    </Text>
                </TouchableOpacity>
            ))}

            <Text style={styles.label}>Descrição</Text>

            <TextInput
                style={styles.textArea}
                placeholder="Descreva o que está acontecendo..."
                value={descricao}
                onChangeText={setDescricao}
                multiline
            />

            <Text style={styles.label}>Foto opcional</Text>

            {foto && (
                <Image
                    source={{ uri: foto.uri }}
                    style={styles.preview}
                />
            )}

            <View style={styles.linhaBotoesFoto}>
                <TouchableOpacity
                    style={styles.botaoFoto}
                    onPress={escolherFoto}
                >
                    <Text style={styles.textoFoto}>
                        Galeria
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.botaoFoto}
                    onPress={tirarFoto}
                >
                    <Text style={styles.textoFoto}>
                        Câmera
                    </Text>
                </TouchableOpacity>
            </View>

            {foto && (
                <TouchableOpacity
                    style={styles.botaoRemover}
                    onPress={() => setFoto(null)}
                >
                    <Text style={styles.textoRemover}>
                        Remover foto
                    </Text>
                </TouchableOpacity>
            )}

            <View style={styles.linha}>
                <Text style={styles.label}>Enviar como anônimo</Text>
                <Switch value={anonimo} onValueChange={setAnonimo} />
            </View>

            <TouchableOpacity
                style={styles.botao}
                onPress={enviarAlerta}
                disabled={carregando}
            >
                <Text style={styles.textoBotao}>
                    {carregando ? "Enviando..." : "Enviar Alerta"}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.botaoVoltar}
                onPress={() => router.back()}
            >
                <Text style={styles.textoVoltar}>Voltar</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 24,
        backgroundColor: "#f8fafc",
        flexGrow: 1
    },
    titulo: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#0f172a",
        marginBottom: 24,
        textAlign: "center"
    },
    label: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#334155",
        marginBottom: 8,
        marginTop: 12
    },
    tipo: {
        backgroundColor: "#fff",
        padding: 14,
        borderRadius: 10,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: "#cbd5e1"
    },
    tipoSelecionado: {
        backgroundColor: "#2563eb",
        borderColor: "#2563eb"
    },
    textoTipo: {
        color: "#334155",
        fontWeight: "bold"
    },
    textoTipoSelecionado: {
        color: "#fff"
    },
    textArea: {
        backgroundColor: "#fff",
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#cbd5e1",
        padding: 14,
        minHeight: 110,
        textAlignVertical: "top"
    },
    preview: {
        width: "100%",
        height: 220,
        borderRadius: 12,
        marginBottom: 12
    },
    linhaBotoesFoto: {
        flexDirection: "row",
        gap: 10,
        marginBottom: 8
    },
    botaoFoto: {
        flex: 1,
        backgroundColor: "#2563eb",
        padding: 14,
        borderRadius: 10,
        alignItems: "center"
    },
    textoFoto: {
        color: "#ffffff",
        fontWeight: "bold"
    },
    botaoRemover: {
        backgroundColor: "#64748b",
        padding: 12,
        borderRadius: 10,
        alignItems: "center",
        marginBottom: 8
    },
    textoRemover: {
        color: "#ffffff",
        fontWeight: "bold"
    },
    linha: {
        marginTop: 16,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
    },
    botao: {
        backgroundColor: "#dc2626",
        padding: 16,
        borderRadius: 12,
        alignItems: "center",
        marginTop: 24
    },
    textoBotao: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold"
    },
    botaoVoltar: {
        padding: 16,
        alignItems: "center"
    },
    textoVoltar: {
        color: "#2563eb",
        fontWeight: "bold"
    }
});