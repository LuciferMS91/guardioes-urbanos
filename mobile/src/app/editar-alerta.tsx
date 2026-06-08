import { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    Switch
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
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

export default function EditarAlertaScreen() {
    const params = useLocalSearchParams();

    const [tipo, setTipo] = useState(String(params.tipo || "ASSALTO_ROUBO"));
    const [descricao, setDescricao] = useState(String(params.descricao || ""));
    const [anonimo, setAnonimo] = useState(String(params.anonimo) === "true");
    const [salvando, setSalvando] = useState(false);

    async function salvar() {
        if (!descricao || descricao.length < 5) {
            Alert.alert("Atenção", "A descrição precisa ter pelo menos 5 caracteres.");
            return;
        }

        try {
            setSalvando(true);

            const token = await AsyncStorage.getItem("token");

            await api.put(
                `/alertas/${params.id}`,
                {
                    tipo,
                    descricao,
                    anonimo
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            Alert.alert("Sucesso", "Alerta atualizado com sucesso!");
            router.replace("/meus-alertas" as any);
        } catch (erro: any) {
            Alert.alert(
                "Erro",
                erro.response?.data?.erro || "Não foi possível atualizar o alerta."
            );
        } finally {
            setSalvando(false);
        }
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.titulo}>Editar Alerta</Text>

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
                value={descricao}
                onChangeText={setDescricao}
                multiline
            />

            <View style={styles.linha}>
                <Text style={styles.label}>Manter como anônimo</Text>
                <Switch value={anonimo} onValueChange={setAnonimo} />
            </View>

            <TouchableOpacity style={styles.botaoSalvar} onPress={salvar}>
                <Text style={styles.textoBotao}>
                    {salvando ? "Salvando..." : "Salvar Alterações"}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.botaoVoltar} onPress={() => router.back()}>
                <Text style={styles.textoVoltar}>Voltar</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 24,
        backgroundColor: "#f8fafc"
    },
    titulo: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#0f172a",
        textAlign: "center",
        marginBottom: 24
    },
    label: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#334155",
        marginBottom: 8,
        marginTop: 12
    },
    tipo: {
        backgroundColor: "#ffffff",
        borderWidth: 1,
        borderColor: "#cbd5e1",
        padding: 14,
        borderRadius: 10,
        marginBottom: 8
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
        color: "#ffffff"
    },
    textArea: {
        backgroundColor: "#ffffff",
        borderWidth: 1,
        borderColor: "#cbd5e1",
        borderRadius: 10,
        padding: 14,
        minHeight: 120,
        textAlignVertical: "top"
    },
    linha: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 16
    },
    botaoSalvar: {
        backgroundColor: "#16a34a",
        padding: 16,
        borderRadius: 12,
        alignItems: "center",
        marginTop: 24
    },
    textoBotao: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "bold"
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