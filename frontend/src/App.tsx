import { useEffect, useState } from 'react';
import axios from 'axios';
import { FireSimViewer } from './components/FireSimViewer';

interface EquipmentType {
  equipmentTypeId: number;
  code: string;
  name: string;
  description: string;
}

function App() {
  const [equipments, setEquipments] = useState<EquipmentType[]>([]);

  useEffect(() => {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5007/api';
    axios.get<EquipmentType[]>(`${apiBaseUrl}/EquipmentTypes`)
      .then(res => setEquipments(res.data))
      .catch(err => console.error('API Fetch Error:', err));
  }, []);

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', color: '#fff', fontFamily: 'sans-serif' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>FireSim 3D 소방 설비 시뮬레이터</h1>
      <FireSimViewer />
      
      <div style={{ marginTop: '30px', padding: '20px', background: '#242424', borderRadius: '8px' }}>
        <h2>연동된 설비 목록 (SQL Server DB)</h2>
        {equipments.length === 0 ? (
          <p style={{ color: '#888' }}>백엔드 연결 확인 중...</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {equipments.map(item => (
              <li key={item.equipmentTypeId} style={{ padding: '10px 0', borderBottom: '1px solid #333' }}>
                <strong style={{ color: '#4fc3f7' }}>[{item.code}] {item.name}</strong>
                <p style={{ margin: '5px 0 0 0', color: '#ccc', fontSize: '14px' }}>{item.description}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default App;
