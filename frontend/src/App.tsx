import { useEffect, useState } from 'react';
import axios from 'axios';
import { FireSimViewer } from './components/FireSimViewer';

interface EquipmentType {
  equipmentTypeId: number;
  code: string;
  name: string;
  description: string;
  modelPath?: string;
}

function App() {
  const [equipments, setEquipments] = useState<EquipmentType[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');

  useEffect(() => {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5007/api';
    axios.get<EquipmentType[]>(`${apiBaseUrl}/EquipmentTypes`)
      .then(res => setEquipments(res.data))
      .catch(err => console.error('API Fetch Error:', err));
  }, []);

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', color: '#fff', fontFamily: 'sans-serif' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>FireSim 3D 소방 설비 시뮬레이터</h1>
      
      <FireSimViewer selectedModelPath={selectedModel} />
      
      <div style={{ marginTop: '30px', padding: '20px', background: '#242424', borderRadius: '8px' }}>
        <h2>소방 설비 선택 (SQL Server DB 연동)</h2>
        {equipments.length === 0 ? (
          <p style={{ color: '#888' }}>백엔드 연결 확인 중...</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '15px', marginTop: '15px' }}>
            {equipments.map(item => (
              <div 
                key={item.equipmentTypeId}
                onClick={() => setSelectedModel(item.modelPath || '')}
                style={{ 
                  padding: '15px', 
                  background: '#333', 
                  borderRadius: '6px', 
                  cursor: 'pointer',
                  border: selectedModel === item.modelPath ? '2px solid #4fc3f7' : '2px solid transparent',
                  transition: 'all 0.2s ease'
                }}
              >
                <strong style={{ color: '#4fc3f7', fontSize: '16px' }}>[{item.code}] {item.name}</strong>
                <p style={{ margin: '8px 0 0 0', color: '#ccc', fontSize: '13px' }}>{item.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
