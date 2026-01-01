
import { Room, RoomStatus, ChecklistTemplate } from './types';

export const INITIAL_TEMPLATES: ChecklistTemplate[] = [
  {
    id: 'master-limeira',
    name: 'Checklist Integral - Recanto da Limeira',
    items: [
      // --- CASA SEDE ---
      { title: 'TV 50” LG + controle', category: 'CASA SEDE' },
      { title: 'Aparelho TVBox + controle', category: 'CASA SEDE' },
      { title: '7 Camas de casal com colchão', category: 'CASA SEDE' },
      { title: '1 Beliche com 2 colchões', category: 'CASA SEDE' },
      { title: '1 Cama de solteiro', category: 'CASA SEDE' },
      { title: '1 Sofá cama com colchão', category: 'CASA SEDE' },
      { title: '3 Colchões de solteiro', category: 'CASA SEDE' },
      { title: 'Porta casado atrás da porta do quarto suíte', category: 'CASA SEDE' },
      { title: 'Repetidor de sinal Wi-Fi', category: 'CASA SEDE' },
      { title: '2 Box intactos (Banheiro Casa Sede)', category: 'CASA SEDE' },
      { title: '2 Redes de descanso na varanda', category: 'CASA SEDE' },
      { title: '6 Almofadas para os sofás', category: 'CASA SEDE' },
      
      // --- ÁREA GOURMET ---
      { title: '1 Fogão a gás (4 bocas)', category: 'ÁREA GOURMET' },
      { title: '1 Fogão Cook (5 bocas)', category: 'ÁREA GOURMET' },
      { title: '1 Geladeira Consul (duplex 340L)', category: 'ÁREA GOURMET' },
      { title: '1 Freezer Consul', category: 'ÁREA GOURMET' },
      { title: '1 Filtro de água', category: 'ÁREA GOURMET' },
      { title: '1 Airfryer', category: 'ÁREA GOURMET' },
      { title: '2 Botijões de gás (fogão e sauna)', category: 'ÁREA GOURMET' },
      { title: 'Grelha e Kit churrasco (garfo, faca, pegador)', category: 'ÁREA GOURMET' },
      { title: 'Pá para fogão de lenha', category: 'ÁREA GOURMET' },
      { title: 'Disco de Arado (frigideira grande de ferro)', category: 'ÁREA GOURMET' },
      { title: 'Escultura de São Francisco em cobre', category: 'ÁREA GOURMET' },
      { title: 'Quadro de madeira 2 cabeças de cavalos', category: 'ÁREA GOURMET' },
      { title: '2 redes de descanso adicionais', category: 'ÁREA GOURMET' },
      { title: '2 box intactos (Banheiro Gourmet)', category: 'ÁREA GOURMET' }
    ]
  }
];

export const INITIAL_ROOMS: Room[] = [
  {
    id: 'recanto-limeira-01',
    number: 'Sítio Recanto da Limeira',
    type: 'Propriedade Integral',
    status: RoomStatus.AVAILABLE,
    tasks: INITIAL_TEMPLATES[0].items.map((item, i) => ({
      id: `task-master-${i}-${Date.now()}`,
      title: item.title,
      status: 'PENDENTE',
      category: item.category
    }))
  }
];

export const THEME = {
  primary: '#10b981',
  secondary: '#3b82f6',
  accent: '#f59e0b',
  dark: '#0f172a',
  light: '#f8fafc',
};
