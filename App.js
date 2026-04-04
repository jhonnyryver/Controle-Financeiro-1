import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ScrollView, Dimensions, Switch } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const screenWidth = Dimensions.get("window").width;

export default function App() {
  const [transacoes, setTransacoes] = useState([]);
  const [dividaTotal, setDividaTotal] = useState('');
  const [mesFiltro, setMesFiltro] = useState(new Date());
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Estados para os novos Inputs
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [tipoTransacao, setTipoTransacao] = useState('gasto');

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    const dadosSalvos = await AsyncStorage.getItem('@transacoes_v8');
    const dividaSalva = await AsyncStorage.getItem('@divida_total_v8');
    if (dadosSalvos) setTransacoes(JSON.parse(dadosSalvos));
    if (dividaSalva) setDividaTotal(dividaSalva);
  };

  const salvarDados = async (novasTransacoes, novaDivida) => {
    await AsyncStorage.setItem('@transacoes_v8', JSON.stringify(novasTransacoes));
    await AsyncStorage.setItem('@divida_total_v8', novaDivida);
  };

  // --- LÓGICA DE METAS DIÁRIAS ---
  const calcularDiasRestantes = () => {
    const hoje = new Date();
    const ultimoDia = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).getDate();
    return ultimoDia - hoje.getDate() + 1; // +1 para incluir o dia de hoje
  };

  const transacoesDoMes = transacoes.filter(t => {
    const dataT = new Date(t.dataCompleta);
    return dataT.getMonth() === mesFiltro.getMonth() && dataT.getFullYear() === mesFiltro.getFullYear();
  });

  const saldoAtual = transacoesDoMes.reduce((acc, curr) => acc + curr.valor, 0);
  const metaFaltante = (parseFloat(dividaTotal) || 0) - saldoAtual;
  const esforcoDiario = metaFaltante > 0 ? metaFaltante / calcularDiasRestantes() : 0;

  const salvarTransacao = () => {
    const valorNumerico = parseFloat(valor.replace(',', '.'));
    const nova = {
      id: Math.random().toString(),
      descricao,
      valor: tipoTransacao === 'entrada' ? Math.abs(valorNumerico) : -Math.abs(valorNumerico),
      tipo: tipoTransacao,
      dataCompleta: new Date().toISOString(),
      dia: new Date().getDate().toString().padStart(2, '0')
    };
    const lista = [...transacoes, nova];
    setTransacoes(lista);
    salvarDados(lista, dividaTotal);
    setDescricao(''); setValor('');
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: isDarkMode ? '#121212' : '#f0f2f5' }]}>
      
      <Text style={styles.tituloApp}>Gestão de Saída do Vermelho 📈</Text>

      {/* CARD DE META DIÁRIA (O FOCO DO DIA) */}
      <View style={[styles.cardMeta, esforcoDiario > 0 ? styles.bgAlerta : styles.bgSucesso]}>
        <Text style={styles.labelMeta}>Meta Diária para Quitar Dívida:</Text>
        <Text style={styles.valorMeta}>
          {esforcoDiario > 0 ? `R$ ${esforcoDiario.toFixed(2)} / dia` : "Dívida Quitada! 🎉"}
        </Text>
        <Text style={styles.infoDias}>Faltam {calcularDiasRestantes()} dias para o fim do mês.</Text>
      </View>

      {/* INPUT DA DÍVIDA TOTAL */}
      <View style={styles.areaInput}>
        <Text style={styles.subtitulo}>Qual o valor total da dívida?</Text>
        <TextInput 
          style={styles.input} 
          placeholder="R$ 0,00" 
          keyboardType="numeric"
          value={dividaTotal}
          onChangeText={(txt) => { setDividaTotal(txt); salvarDados(transacoes, txt); }}
        />
      </View>

      {/* ADICIONAR GANHO OU GASTO */}
      <View style={styles.areaInput}>
        <Text style={styles.subtitulo}>Registrar Movimentação</Text>
        <View style={styles.row}>
          <TouchableOpacity 
            style={[styles.btnTipo, tipoTransacao === 'entrada' && styles.btnAtivoVerde]} 
            onPress={() => setTipoTransacao('entrada')}
          ><Text>Entrada</Text></TouchableOpacity>
          <TouchableOpacity 
            style={[styles.btnTipo, tipoTransacao === 'gasto' && styles.btnAtivoVermelho]} 
            onPress={() => setTipoTransacao('gasto')}
          ><Text>Saída</Text></TouchableOpacity>
        </View>
        
        <TextInput style={styles.input} placeholder="Descrição" value={descricao} onChangeText={setDescricao} />
        <TextInput style={styles.input} placeholder="Valor" keyboardType="numeric" value={valor} onChangeText={setValor} />
        
        <TouchableOpacity style={styles.btnSalvar} onPress={salvarTransacao}>
          <Text style={styles.txtBtn}>SALVAR NO FLUXO</Text>
        </TouchableOpacity>
      </View>

      {/* RESUMO RÁPIDO */}
      <View style={styles.resumo}>
        <Text>Saldo Acumulado no Mês: R$ {saldoAtual.toFixed(2)}</Text>
        <Text>Ainda faltam: R$ {metaFaltante > 0 ? metaFaltante.toFixed(2) : "0,00"}</Text>
      </View>

      <View style={{height: 100}} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 50 },
  tituloApp: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  cardMeta: { padding: 20, borderRadius: 15, alignItems: 'center', marginBottom: 20, elevation: 4 },
  bgAlerta: { backgroundColor: '#ff9800' },
  bgSucesso: { backgroundColor: '#4caf50' },
  labelMeta: { color: '#fff', fontSize: 16 },
  valorMeta: { color: '#fff', fontSize: 28, fontWeight: 'bold', marginVertical: 5 },
  infoDias: { color: '#fff', fontSize: 12, opacity: 0.8 },
  areaInput: { backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 15 },
  subtitulo: { fontSize: 14, fontWeight: 'bold', marginBottom: 10 },
  input: { borderBottomWidth: 1, borderColor: '#ccc', padding: 8, marginBottom: 15, fontSize: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  btnTipo: { flex: 0.48, padding: 10, borderRadius: 8, backgroundColor: '#eee', alignItems: 'center' },
  btnAtivoVerde: { backgroundColor: '#c8e6c9' },
  btnAtivoVermelho: { backgroundColor: '#ffcdd2' },
  btnSalvar: { backgroundColor: '#007bff', padding: 15, borderRadius: 8, alignItems: 'center' },
  txtBtn: { color: '#fff', fontWeight: 'bold' },
  resumo: { padding: 15, alignItems: 'center' }
});
