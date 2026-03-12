import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ScrollView, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PieChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get("window").width;

// LISTA DE CATEGORIAS E ÍCONES (EMOJIS)
const categoriasGlobais = [
  { nome: 'Alimentação', icone: '🍔' },
  { nome: 'Mercado', icone: '🛒' },
  { nome: 'Transporte', icone: '🚗' },
  { nome: 'Casa/Contas', icone: '🏠' },
  { nome: 'Lazer', icone: '🎉' },
  { nome: 'Saúde', icone: '💊' },
  { nome: 'Salário/Renda', icone: '💰' },
  { nome: 'Outros', icone: '✨' },
];

export default function App() {
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [tipoTransacao, setTipoTransacao] = useState('entrada'); 
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('Outros');
  const [nomeCartao, setNomeCartao] = useState('');
  const [parcelas, setParcelas] = useState('1');
  const [transacoes, setTransacoes] = useState([]);
  const [metaGuardar, setMetaGuardar] = useState('');
  const [mesFiltro, setMesFiltro] = useState(new Date());
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // ESTADO DE EDIÇÃO
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const dadosSalvos = await AsyncStorage.getItem('@transacoes_pro_v7');
      const metaSalva = await AsyncStorage.getItem('@meta_guardar_v7');
      const temaSalvo = await AsyncStorage.getItem('@tema_escuro');
      
      if (dadosSalvos) setTransacoes(JSON.parse(dadosSalvos));
      if (metaSalva) setMetaGuardar(metaSalva);
      if (temaSalvo !== null) setIsDarkMode(JSON.parse(temaSalvo));
    } catch (error) {
      Alert.alert("Erro", "Não foi possível carregar os dados.");
    }
  };

  const salvarDados = async (novasTransacoes, novaMeta) => {
    try {
      await AsyncStorage.setItem('@transacoes_pro_v7', JSON.stringify(novasTransacoes));
      await AsyncStorage.setItem('@meta_guardar_v7', novaMeta.toString());
    } catch (error) {
      Alert.alert("Erro", "Não foi possível guardar.");
    }
  };

  const toggleTheme = async () => {
    const novoTema = !isDarkMode;
    setIsDarkMode(novoTema);
    await AsyncStorage.setItem('@tema_escuro', JSON.stringify(novoTema));
  };

  const salvarTransacao = () => {
    if (!descricao || !valor) {
      Alert.alert("Aviso", "Preencha a descrição e o valor!");
      return;
    }
    
    const valorNumerico = parseFloat(valor.replace(',', '.'));
    
    // MODO EDIÇÃO
    if (editingId) {
      const transacoesAtualizadas = transacoes.map(t => {
        if (t.id === editingId) {
          return {
            ...t,
            descricao,
            valor: tipoTransacao === 'entrada' ? Math.abs(valorNumerico) : -Math.abs(valorNumerico),
            tipo: tipoTransacao,
            categoria: categoriaSelecionada
          };
        }
        return t;
      });
      setTransacoes(transacoesAtualizadas);
      salvarDados(transacoesAtualizadas, metaGuardar);
      cancelarEdicao();
      return;
    }

    // MODO CRIAÇÃO NOVO
    const dataAtual = new Date();
    let novasTransacoesAdicionadas = [];

    if (tipoTransacao === 'cartao') {
      const qtdParcelas = parseInt(parcelas) || 1;
      const valorParcela = valorNumerico / qtdParcelas;

      for (let i = 0; i < qtdParcelas; i++) {
        const dataParcela = new Date(dataAtual.getFullYear(), dataAtual.getMonth() + i, dataAtual.getDate());
        novasTransacoesAdicionadas.push({
          id: Math.random().toString(),
          descricao: `${descricao} (${i + 1}/${qtdParcelas})`,
          valor: -Math.abs(valorParcela),
          tipo: 'cartao',
          categoria: categoriaSelecionada,
          banco: nomeCartao || 'Cartão',
          dataCompleta: dataParcela.toISOString(),
          dia: dataParcela.getDate().toString().padStart(2, '0')
        });
      }
    } else {
      novasTransacoesAdicionadas.push({
        id: Math.random().toString(),
        descricao,
        valor: tipoTransacao === 'entrada' ? Math.abs(valorNumerico) : -Math.abs(valorNumerico),
        tipo: tipoTransacao,
        categoria: categoriaSelecionada,
        dataCompleta: dataAtual.toISOString(),
        dia: dataAtual.getDate().toString().padStart(2, '0')
      });
    }

    const novasTransacoes = [...transacoes, ...novasTransacoesAdicionadas];
    setTransacoes(novasTransacoes);
    salvarDados(novasTransacoes, metaGuardar);
    cancelarEdicao(); // Limpa os campos
  };

  const iniciarEdicao = (item) => {
    if(item.tipo === 'cartao' && item.descricao.includes('/')) {
        Alert.alert("Aviso", "Para editar parcelas de cartão, apague a parcela incorreta e adicione novamente como gasto avulso no mês correspondente para não desconfigurar as outras parcelas.");
        return;
    }
    setEditingId(item.id);
    setDescricao(item.descricao);
    setValor(Math.abs(item.valor).toString());
    setTipoTransacao(item.tipo);
    setCategoriaSelecionada(item.categoria || 'Outros');
  };

  const cancelarEdicao = () => {
    setEditingId(null);
    setDescricao('');
    setValor('');
    setNomeCartao('');
    setParcelas('1');
    setCategoriaSelecionada('Outros');
  };

  const excluirTransacao = (idParaApagar) => {
    Alert.alert("Apagar Registo", "Tem a certeza que deseja apagar este item?", [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Sim, apagar", 
          onPress: () => {
            const novasTransacoes = transacoes.filter(t => t.id !== idParaApagar);
            setTransacoes(novasTransacoes);
            salvarDados(novasTransacoes, metaGuardar);
          },
          style: "destructive"
        }
      ]);
  };

  const atualizarMeta = (texto) => {
    setMetaGuardar(texto);
    salvarDados(transacoes, texto);
  };

  const limparTudo = () => {
    Alert.alert("Atenção!", "Apagar todo o histórico de todos os meses?", [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Sim, apagar tudo", 
          onPress: () => { setTransacoes([]); setMetaGuardar(''); salvarDados([], ''); },
          style: "destructive"
        }
      ]);
  };

  const mudarMes = (delta) => {
    const novaData = new Date(mesFiltro);
    novaData.setMonth(novaData.getMonth() + delta);
    setMesFiltro(novaData);
  };

  const obterIconeCategoria = (nomeCat) => {
    const cat = categoriasGlobais.find(c => c.nome === nomeCat);
    return cat ? cat.icone : '✨';
  };

  const transacoesDoMes = transacoes.filter(t => {
    const dataT = new Date(t.dataCompleta);
    return dataT.getMonth() === mesFiltro.getMonth() && dataT.getFullYear() === mesFiltro.getFullYear();
  });

  const totalEntradas = transacoesDoMes.filter(t => t.tipo === 'entrada').reduce((acc, curr) => acc + curr.valor, 0);
  const totalGastosLivres = transacoesDoMes.filter(t => t.tipo === 'gasto').reduce((acc, curr) => acc + curr.valor, 0);
  const totalFixas = transacoesDoMes.filter(t => t.tipo === 'fixa').reduce((acc, curr) => acc + curr.valor, 0);
  const totalCartoes = transacoesDoMes.filter(t => t.tipo === 'cartao').reduce((acc, curr) => acc + curr.valor, 0);
  
  const metaNumerica = parseFloat(metaGuardar) || 0;
  const saldoAtual = totalEntradas + totalGastosLivres + totalFixas + totalCartoes;
  const saldoLivre = saldoAtual - metaNumerica;

  const dadosGrafico = [
    { name: 'Avulsos', valor: Math.abs(totalGastosLivres), color: '#e74c3c', legendFontColor: isDarkMode ? '#ccc' : '#7F7F7F', legendFontSize: 12 },
    { name: 'Fixas', valor: Math.abs(totalFixas), color: '#d35400', legendFontColor: isDarkMode ? '#ccc' : '#7F7F7F', legendFontSize: 12 },
    { name: 'Cartões', valor: Math.abs(totalCartoes), color: '#8e44ad', legendFontColor: isDarkMode ? '#ccc' : '#7F7F7F', legendFontSize: 12 },
  ].filter(item => item.valor > 0);

  const tema = {
    bgPrincipal: isDarkMode ? '#121212' : '#f0f2f5',
    bgCard: isDarkMode ? '#1e1e1e' : '#ffffff',
    textoPrincipal: isDarkMode ? '#ffffff' : '#333333',
    textoSecundario: isDarkMode ? '#aaaaaa' : '#666666',
    bgInput: isDarkMode ? '#2c2c2c' : '#f0f2f5',
    btnMesBg: isDarkMode ? '#333333' : '#e4e6eb',
    borda: isDarkMode ? '#333' : '#eee'
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: tema.bgPrincipal }]} showsVerticalScrollIndicator={false}>
      
      <View style={styles.headerTopo}>
        <Text style={[styles.tituloApp, { color: tema.textoPrincipal }]}>O Meu App Financeiro</Text>
        <TouchableOpacity onPress={toggleTheme} style={styles.btnTema}>
          <Text style={{ fontSize: 20 }}>{isDarkMode ? '☀️' : '🌙'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.headerMes}>
        <TouchableOpacity onPress={() => mudarMes(-1)} style={[styles.btnMes, { backgroundColor: tema.btnMesBg }]}><Text style={[styles.seta, { color: tema.textoPrincipal }]}>{'<'}</Text></TouchableOpacity>
        <Text style={[styles.textoMes, { color: tema.textoPrincipal }]}>{mesFiltro.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase()}</Text>
        <TouchableOpacity onPress={() => mudarMes(1)} style={[styles.btnMes, { backgroundColor: tema.btnMesBg }]}><Text style={[styles.seta, { color: tema.textoPrincipal }]}>{'>'}</Text></TouchableOpacity>
      </View>

      <View style={styles.painelCards}>
        <View style={[styles.cardLivre, saldoLivre < 0 && styles.cardLivreAlerta]}>
          <Text style={[styles.labelCardCores, saldoLivre < 0 && {color: '#721c24'}]}>💰 Saldo Livre P/ Gastar</Text>
          <Text style={[styles.valorLivre, { color: saldoLivre >= 0 ? '#155724' : '#721c24' }]}>R$ {saldoLivre.toFixed(2)}</Text>
        </View>

        <View style={styles.cardsSecundarios}>
          <View style={[styles.cardPequeno, { backgroundColor: tema.bgCard }]}>
            <Text style={[styles.labelPequeno, { color: tema.textoSecundario }]}>Entradas</Text>
            <Text style={[styles.valorPequeno, {color: '#28a745'}]}>R$ {totalEntradas.toFixed(2)}</Text>
          </View>
          <View style={[styles.cardPequeno, { backgroundColor: tema.bgCard }]}>
            <Text style={[styles.labelPequeno, { color: tema.textoSecundario }]}>Faturas Cartões</Text>
            <Text style={[styles.valorPequeno, {color: '#8e44ad'}]}>R$ {Math.abs(totalCartoes).toFixed(2)}</Text>
          </View>
        </View>
      </View>

      {dadosGrafico.length > 0 && (
        <View style={[styles.areaGrafico, { backgroundColor: tema.bgCard }]}>
          <Text style={[styles.tituloSecao, { color: tema.textoPrincipal, textAlign: 'center' }]}>Distribuição de Despesas</Text>
          <PieChart
            data={dadosGrafico}
            width={screenWidth - 60}
            height={180}
            chartConfig={{ color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})` }}
            accessor={"valor"}
            backgroundColor={"transparent"}
            paddingLeft={"15"}
            absolute
          />
        </View>
      )}

      {/* ÁREA DE INPUT / EDIÇÃO */}
      <View style={[styles.areaInput, { backgroundColor: tema.bgCard, borderColor: editingId ? '#007BFF' : 'transparent', borderWidth: editingId ? 2 : 0 }]}>
        <Text style={[styles.tituloSecao, { color: tema.textoPrincipal }]}>
          {editingId ? "✏️ A Editar Registo" : "Adicionar Registo"}
        </Text>
        
        <View style={styles.seletorTipo}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity style={[styles.btnTipo, { backgroundColor: tema.btnMesBg }, tipoTransacao === 'entrada' && styles.btnTipoAtivoEntrada]} onPress={() => setTipoTransacao('entrada')}>
              <Text style={tipoTransacao === 'entrada' ? styles.textoTipoAtivo : [styles.textoTipo, { color: tema.textoSecundario }]}>Entrada</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btnTipo, { backgroundColor: tema.btnMesBg }, tipoTransacao === 'gasto' && styles.btnTipoAtivoGasto]} onPress={() => setTipoTransacao('gasto')}>
              <Text style={tipoTransacao === 'gasto' ? styles.textoTipoAtivo : [styles.textoTipo, { color: tema.textoSecundario }]}>Avulso</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btnTipo, { backgroundColor: tema.btnMesBg }, tipoTransacao === 'fixa' && styles.btnTipoAtivoFixa]} onPress={() => setTipoTransacao('fixa')}>
              <Text style={tipoTransacao === 'fixa' ? styles.textoTipoAtivo : [styles.textoTipo, { color: tema.textoSecundario }]}>Fixa</Text>
            </TouchableOpacity>
            {!editingId && (
              <TouchableOpacity style={[styles.btnTipo, { backgroundColor: tema.btnMesBg }, tipoTransacao === 'cartao' && styles.btnTipoAtivoCartao]} onPress={() => setTipoTransacao('cartao')}>
                <Text style={tipoTransacao === 'cartao' ? styles.textoTipoAtivo : [styles.textoTipo, { color: tema.textoSecundario }]}>Cartão</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>

        {/* SELETOR DE CATEGORIA VISUAL */}
        <View style={{marginBottom: 15}}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categoriasGlobais.map((cat) => (
              <TouchableOpacity 
                key={cat.nome} 
                style={[styles.btnCategoria, { backgroundColor: tema.btnMesBg }, categoriaSelecionada === cat.nome && styles.btnCategoriaAtivo]}
                onPress={() => setCategoriaSelecionada(cat.nome)}
              >
                <Text style={styles.iconeCategoria}>{cat.icone}</Text>
                {categoriaSelecionada === cat.nome && <Text style={styles.textoCategoriaAtivo}>{cat.nome}</Text>}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <TextInput style={[styles.input, { backgroundColor: tema.bgInput, color: tema.textoPrincipal }]} placeholderTextColor={tema.textoSecundario} placeholder="Descrição (ex: Almoço)" value={descricao} onChangeText={setDescricao} />
        <TextInput style={[styles.input, { backgroundColor: tema.bgInput, color: tema.textoPrincipal }]} placeholderTextColor={tema.textoSecundario} placeholder="Valor Total" value={valor} onChangeText={setValor} keyboardType="numeric" />
        
        {tipoTransacao === 'cartao' && !editingId && (
          <View style={styles.linhaCartao}>
            <TextInput style={[styles.input, { flex: 1, marginRight: 10, backgroundColor: tema.bgInput, color: tema.textoPrincipal }]} placeholderTextColor={tema.textoSecundario} placeholder="Banco..." value={nomeCartao} onChangeText={setNomeCartao} />
            <TextInput style={[styles.input, { flex: 0.5, backgroundColor: tema.bgInput, color: tema.textoPrincipal }]} placeholderTextColor={tema.textoSecundario} placeholder="Parcelas" value={parcelas} onChangeText={setParcelas} keyboardType="numeric" />
          </View>
        )}
        
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <TouchableOpacity style={[styles.botaoAdd, {flex: editingId ? 0.65 : 1, backgroundColor: editingId ? '#28a745' : '#007BFF'}]} onPress={salvarTransacao}>
            <Text style={styles.botaoTexto}>{editingId ? "Atualizar Registo" : "Adicionar Registo"}</Text>
          </TouchableOpacity>
          
          {editingId && (
            <TouchableOpacity style={[styles.botaoAdd, {flex: 0.32, backgroundColor: '#6c757d'}]} onPress={cancelarEdicao}>
              <Text style={styles.botaoTexto}>Cancelar</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.areaListas}>
        <Text style={[styles.tituloSecao, { color: tema.textoPrincipal, marginBottom: 10 }]}>Extrato do Mês</Text>
        {transacoesDoMes.length === 0 && <Text style={styles.textoVazio}>Nenhum registo neste mês.</Text>}

        {transacoesDoMes.map((item) => (
          <View key={item.id} style={[styles.itemLista, { backgroundColor: tema.bgCard, borderColor: tema.borda, borderWidth: 1 }]}>
            <View style={styles.itemEsquerda}>
              <View style={styles.bolaIcone}>
                <Text style={{fontSize: 20}}>{obterIconeCategoria(item.categoria)}</Text>
              </View>
              <View>
                <Text style={[styles.itemDescricao, { color: tema.textoPrincipal }]}>{item.descricao}</Text>
                <Text style={[styles.itemTipoLabel, { color: tema.textoSecundario }]}>{item.dia} • {item.tipo === 'entrada' ? 'Receita' : item.tipo === 'cartao' ? `Cartão ${item.banco}` : item.tipo === 'fixa' ? 'Fixa' : 'Gasto'}</Text>
              </View>
            </View>
            
            <View style={styles.itemAcoes}>
              <View style={styles.itemDireita}>
                <Text style={[styles.itemValor, item.valor >= 0 ? {color: '#28a745'} : {color: tema.textoPrincipal}]}>
                  R$ {Math.abs(item.valor).toFixed(2)}
                </Text>
              </View>
              
              <View style={{flexDirection: 'row', marginLeft: 10}}>
                <TouchableOpacity onPress={() => iniciarEdicao(item)} style={[styles.botaoAcaoItem, {backgroundColor: '#e0f3ff', marginRight: 5}]}>
                  <Text style={{fontSize: 12}}>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => excluirTransacao(item.id)} style={[styles.botaoAcaoItem, {backgroundColor: '#fee2e2'}]}>
                  <Text style={{color: '#ef4444', fontWeight: 'bold', fontSize: 12}}>X</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </View>
      <View style={{height: 70}} /> 
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, marginTop: 40 },
  headerTopo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  tituloApp: { fontSize: 22, fontWeight: 'bold' },
  btnTema: { padding: 5 },
  headerMes: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  btnMes: { padding: 10, borderRadius: 20, width: 40, alignItems: 'center' },
  seta: { fontSize: 18, fontWeight: 'bold' },
  textoMes: { fontSize: 16, fontWeight: 'bold' },
  painelCards: { marginBottom: 15 },
  cardLivre: { backgroundColor: '#d4edda', padding: 20, borderRadius: 12, alignItems: 'center', marginBottom: 10, elevation: 2 },
  cardLivreAlerta: { backgroundColor: '#f8d7da' },
  labelCardCores: { fontSize: 14, color: '#155724', fontWeight: 'bold', marginBottom: 5 },
  valorLivre: { fontSize: 32, fontWeight: 'bold' },
  cardsSecundarios: { flexDirection: 'row', justifyContent: 'space-between' },
  cardPequeno: { padding: 15, borderRadius: 10, flex: 0.48, alignItems: 'center', elevation: 1 },
  labelPequeno: { fontSize: 12, marginBottom: 5 },
  valorPequeno: { fontSize: 16, fontWeight: 'bold' },
  areaGrafico: { padding: 15, borderRadius: 12, marginBottom: 20, elevation: 1, alignItems: 'center', justifyContent: 'center' },
  areaInput: { padding: 15, borderRadius: 12, marginBottom: 20, elevation: 2 },
  tituloSecao: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  seletorTipo: { flexDirection: 'row', marginBottom: 15 },
  btnTipo: { padding: 10, borderRadius: 8, marginRight: 10, minWidth: 80, alignItems: 'center' },
  btnTipoAtivoEntrada: { backgroundColor: '#28a745' },
  btnTipoAtivoGasto: { backgroundColor: '#e74c3c' },
  btnTipoAtivoFixa: { backgroundColor: '#d35400' },
  btnTipoAtivoCartao: { backgroundColor: '#8e44ad' },
  textoTipo: { fontSize: 12, fontWeight: 'bold' },
  textoTipoAtivo: { fontSize: 12, color: '#fff', fontWeight: 'bold' },
  
  btnCategoria: { flexDirection: 'row', padding: 10, borderRadius: 20, marginRight: 10, alignItems: 'center', opacity: 0.6 },
  btnCategoriaAtivo: { backgroundColor: '#007BFF', opacity: 1 },
  iconeCategoria: { fontSize: 18 },
  textoCategoriaAtivo: { color: '#fff', fontSize: 12, fontWeight: 'bold', marginLeft: 5 },

  input: { padding: 12, borderRadius: 8, marginBottom: 10 },
  linhaCartao: { flexDirection: 'row', justifyContent: 'space-between' },
  botaoAdd: { padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 5 },
  botaoTexto: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  
  areaListas: { marginBottom: 20 },
  textoVazio: { textAlign: 'center', color: '#999', marginVertical: 20 },
  itemLista: { flexDirection: 'row', justifyContent: 'space-between', padding: 12, borderRadius: 10, marginBottom: 8, alignItems: 'center' },
  itemEsquerda: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  bolaIcone: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f0f2f5', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  itemDescricao: { fontSize: 15, fontWeight: 'bold', flexShrink: 1 },
  itemTipoLabel: { fontSize: 11, marginTop: 2 },
  itemAcoes: { flexDirection: 'row', alignItems: 'center' },
  itemDireita: { alignItems: 'flex-end' },
  itemValor: { fontSize: 15, fontWeight: 'bold' },
  botaoAcaoItem: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
});
