import { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert
} from "react-native";
import { router } from "expo-router";
import api from "../api/api";

export default function CadastroScreen() {
    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [telefone, setTelefone] = useState("");
    const [senha, setSenha] = useState("");
    const [carregando, setCarregando] = useState(false);

    async function cadastrar() {
        if (!nome || !email || !senha) {
            Alert.alert("Atenção", "Preencha nome, email e senha.");
            return;
        }

        try {
            setCarregando(true);

            await api.post("/auth/cadastro", {
                nome,
                email,
                telefone,
                senha
            });

            Alert.alert("Sucesso", "Conta criada com sucesso!");
            router.replace("/login");

            } catch (erro: any) {
               const mensagem =
        erro.response?.data?.erro ||
        "Não foi possível criar a conta.";

    Alert.alert("Erro", mensagem);
} finally {
    setCarregando(false);
}
    }

    return (
        <View style={styles.container}>
            <Text style={styles.titulo}>Criar conta</Text>

            <TextInput
                style={styles.input}
                placeholder="Nome"
                value={nome}
                onChangeText={setNome}
            />

            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
            />

            <TextInput
                style={styles.input}
                placeholder="Telefone"
                value={telefone}
                onChangeText={setTelefone}
                keyboardType="phone-pad"
            />

            <TextInput
                style={styles.input}
                placeholder="Senha"
                value={senha}
                onChangeText={setSenha}
                secureTextEntry
            />

            <TouchableOpacity style={styles.botao} onPress={cadastrar}>
                <Text style={styles.textoBotao}>
                    {carregando ? "Criando..." : "Cadastrar"}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.replace("/login")}>
                <Text style={styles.link}>Já tenho conta</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8fafc",
        padding: 24,
        justifyContent: "center"
    },
    titulo: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#0f172a",
        textAlign: "center",
        marginBottom: 28
    },
    input: {
        backgroundColor: "#fff",
        padding: 14,
        borderRadius: 10,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#cbd5e1"
    },
    botao: {
        backgroundColor: "#16a34a",
        padding: 15,
        borderRadius: 10,
        alignItems: "center",
        marginTop: 8
    },
    textoBotao: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16
    },
    link: {
        textAlign: "center",
        color: "#2563eb",
        marginTop: 20,
        fontWeight: "bold"
    }
});