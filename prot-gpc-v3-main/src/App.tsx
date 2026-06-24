import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { PaginaInicial } from './pages/PaginaInicial';
import { Home } from './pages/Home';
import { EnvioForaDoPrazo } from './pages/EnvioForaDoPrazo';
import { TarefaDetalhe } from './pages/TarefaDetalhe';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/inicio" element={<PaginaInicial />} />
        <Route path="/" element={<Home />} />
        <Route path="/tarefas/:id" element={<TarefaDetalhe />} />
        <Route path="/envio-fora-do-prazo" element={<EnvioForaDoPrazo />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
