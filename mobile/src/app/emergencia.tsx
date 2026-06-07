import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
    Linking
} from "react-native";
import { router } from "expo-router";

const contatos = [
    {
        nome: "Polícia Militar",
        telefone: "190",
        icone: "🚓"
    },
    {
        nome: "Polícia Civil",
        telefone: "197",
        icone: "🕵️"
    },
    {
        nome: "SAMU",
        telefone: "192",
        icone: "🚑"
    },
    {
        nome: "Corpo de Bombeiros",
        telefone: "193",
        icone: "🚒"
    }
];

export default function EmergenciaScreen() {
    function ligar(nome: string, telefone: string) {
        Alert.alert(
            "Confirmar ligação",
            `Deseja ligar para ${nome}?`,
            [
                {
                    text: "Cancelar",
                    style: "cancel"
                },
                {
                    text: "Ligar",
                    onPress: () => Linking.openURL(`tel:${telefone}`)
                }
            ]
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.titulo}>Emergência</Text>

                <Text style={styles.subtitulo}>
                    Toque em um serviço para abrir o discador.
                </Text>
            </View>

            <View style={styles.lista}>
                {contatos.map((contato) => (
                    <TouchableOpacity
                        key={contato.telefone}
                        style={styles.card}
                        onPress={() => ligar(contato.nome, contato.telefone)}
                    >
                        <View style={styles.info}>
                            <Text style={styles.icone}>
                                {contato.icone}
                            </Text>

                            <Text style={styles.nome}>
                                {contato.nome}
                            </Text>
                        </View>

                        <Text style={styles.numero}>
                            {contato.telefone}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

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
        paddingTop: 60
    },

    header: {
        alignItems: "center",
        marginBottom: 28
    },

    titulo: {
        fontSize: 30,
        fontWeight: "bold",
        color: "#0f172a"
    },

    subtitulo: {
        fontSize: 15,
        color: "#64748b",
        textAlign: "center",
        marginTop: 6
    },

    lista: {
        gap: 14
    },

    card: {
        backgroundColor: "#dc2626",
        borderRadius: 18,
        padding: 20,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        elevation: 4
    },

    info: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12
    },

    icone: {
        fontSize: 28
    },

    nome: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#ffffff"
    },

    numero: {
        color: "#ffffff",
        fontWeight: "bold",
        fontSize: 22
    },

    botaoVoltar: {
        alignItems: "center",
        marginTop: 24,
        padding: 14
    },

    textoVoltar: {
        color: "#2563eb",
        fontWeight: "bold",
        fontSize: 16
    }
});