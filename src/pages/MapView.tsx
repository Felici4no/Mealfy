import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { Family } from '../backend/types';
import Button from '../components/ui/Button';
import { LocateFixed, Filter, MapPin, Layers, Heart, ShieldAlert, Check } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import BottomSheet from '../components/ui/BottomSheet';
import './MapView.css';

// Fix Leaflet icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Mock families data representing the four neighborhoods with coordinates
const MOCK_MAP_FAMILIES: Family[] = [
  {
    id: 'f1',
    communityId: 'c1',
    representativeName: 'Maria Silva',
    neighborhood: 'Heliópolis',
    city: 'São Paulo',
    state: 'SP',
    shortAddress: 'Viela 3, Setor B',
    description: 'Mãe solo, desempregada temporariamente com 2 filhos em idade de creche.',
    childrenCount: 2,
    children: [
      { id: 'ch1', name: 'Lucas', age: 7, school: 'EMEF Campos' },
      { id: 'ch2', name: 'Ana', age: 4, school: 'Creche Local' }
    ],
    mainNeed: 'Alimentação infantil e fraldas',
    supportStatus: 'needs_help',
    distanceToUser: '1.2 km',
    priorityLevel: 5, // Urgent
    latitude: -23.6151,
    longitude: -46.5912,
    sourceEntityName: 'Coletivo Heliópolis Solidário'
  },
  {
    id: 'f2',
    communityId: 'c1',
    representativeName: 'Dona Cida',
    neighborhood: 'Heliópolis',
    city: 'São Paulo',
    state: 'SP',
    shortAddress: 'Rua do Sol, 45',
    description: 'Aposentada que cuida sozinha de 3 netos após o falecimento da filha.',
    childrenCount: 3,
    children: [
      { id: 'ch3', name: 'Pedro', age: 10, school: 'EMEF Campos' },
      { id: 'ch4', name: 'Carla', age: 8, school: 'EMEF Campos' },
      { id: 'ch5', name: 'Júlia', age: 5, school: 'Creche Local' }
    ],
    mainNeed: 'Cesta de alimentos frescos',
    supportStatus: 'needs_help',
    distanceToUser: '1.4 km',
    priorityLevel: 4,
    latitude: -23.6180,
    longitude: -46.5940,
    sourceEntityName: 'Coletivo Heliópolis Solidário'
  },
  {
    id: 'f3',
    communityId: 'c3',
    representativeName: 'Roberto e Sônia',
    neighborhood: 'Cidade Tiradentes',
    city: 'São Paulo',
    state: 'SP',
    shortAddress: 'Setor G, Prédio 3',
    description: 'Casal com 3 filhos. Ambos faziam bicos mas perderam renda nas últimas semanas.',
    childrenCount: 3,
    children: [
      { id: 'ch6', name: 'Tiago', age: 12, school: 'EE Tiradentes' },
      { id: 'ch7', name: 'Mateus', age: 9, school: 'EE Tiradentes' },
      { id: 'ch8', name: 'Lia', age: 6, school: 'EMEF Local' }
    ],
    mainNeed: 'Suplementação alimentar para crianças',
    supportStatus: 'needs_help',
    distanceToUser: '8.1 km',
    priorityLevel: 4,
    latitude: -23.5855,
    longitude: -46.4011,
    sourceEntityName: 'Associação Tiradentes Viva'
  },
  {
    id: 'f4',
    communityId: 'c2',
    representativeName: 'Joana Prado',
    neighborhood: 'Paraisópolis',
    city: 'São Paulo',
    state: 'SP',
    shortAddress: 'Beco da Esperança, 12',
    description: 'Atualmente trabalha em faxinas mas o salário não cobre alimentação e aluguel.',
    childrenCount: 1,
    children: [
      { id: 'ch9', name: 'Miguel', age: 2, school: 'Creche Municipal' }
    ],
    mainNeed: 'Leite especial e papinhas',
    supportStatus: 'fed', // Supported / Fed
    distanceToUser: '3.6 km',
    priorityLevel: 2,
    latitude: -23.6145,
    longitude: -46.7289,
    sourceEntityName: 'União Paraisópolis'
  },
  {
    id: 'f5',
    communityId: 'c2',
    representativeName: 'Alice Rocha',
    neighborhood: 'Paraisópolis',
    city: 'São Paulo',
    state: 'SP',
    shortAddress: 'Rua Central, 88',
    description: 'Família em extrema vulnerabilidade com 4 filhos pequenos.',
    childrenCount: 4,
    children: [
      { id: 'ch10', name: 'Guilherme', age: 9, school: 'EMEF Paraisópolis' },
      { id: 'ch11', name: 'Bruno', age: 7, school: 'EMEF Paraisópolis' },
      { id: 'ch12', name: 'Yasmin', age: 5, school: 'Creche' },
      { id: 'ch13', name: 'Alice', age: 3, school: 'Creche' }
    ],
    mainNeed: 'Alimentação infantil diária',
    supportStatus: 'needs_help',
    distanceToUser: '3.3 km',
    priorityLevel: 5, // Urgent
    latitude: -23.6110,
    longitude: -46.7260,
    sourceEntityName: 'União Paraisópolis'
  },
  {
    id: 'f6',
    communityId: 'c4',
    representativeName: 'Regina Santos',
    neighborhood: 'Brasilândia',
    city: 'São Paulo',
    state: 'SP',
    shortAddress: 'Rua do Morro, 102',
    description: 'Mãe solo, diarista desempregada cuidando de 3 crianças.',
    childrenCount: 3,
    children: [
      { id: 'ch14', name: 'Enzo', age: 8, school: 'EMEF Brasilândia' },
      { id: 'ch15', name: 'Valentina', age: 6, school: 'Creche' },
      { id: 'ch16', name: 'Gabriel', age: 2, school: 'Creche' }
    ],
    mainNeed: 'Alimento básico e leite',
    supportStatus: 'needs_help',
    distanceToUser: '12.4 km',
    priorityLevel: 5, // Urgent
    latitude: -23.4688,
    longitude: -46.6997,
    sourceEntityName: 'Brasilândia Unida'
  },
  {
    id: 'f7',
    communityId: 'c4',
    representativeName: 'Francisca Lima',
    neighborhood: 'Brasilândia',
    city: 'São Paulo',
    state: 'SP',
    shortAddress: 'Viela da Paz, 9',
    description: 'Família numerosa, apoiada ativamente pela cozinha comunitária local.',
    childrenCount: 5,
    children: [
      { id: 'ch17', name: 'Mariana', age: 14, school: 'EE Brasilândia' },
      { id: 'ch18', name: 'Samuel', age: 12, school: 'EE Brasilândia' },
      { id: 'ch19', name: 'Ester', age: 9, school: 'EMEF Brasilândia' },
      { id: 'ch20', name: 'Rafaela', age: 7, school: 'EMEF Brasilândia' },
      { id: 'ch21', name: 'Daví', age: 4, school: 'Creche' }
    ],
    mainNeed: 'Cesta básica completa',
    supportStatus: 'fed', // Fed / Supported
    distanceToUser: '12.8 km',
    priorityLevel: 1,
    latitude: -23.4710,
    longitude: -46.7020,
    sourceEntityName: 'Brasilândia Unida'
  }
];

// Recenter Map Helper
const MapRecenter = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 12);
  }, [center, map]);
  return null;
};

const MapView: React.FC = () => {
  const navigate = useNavigate();
  const { selectedRegion, setSelectedRegion } = useAppContext();
  
  // Filter States
  const [bairroFilter, setBairroFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('all');
  const [isSelectionMode, setIsSelectionMode] = useState<boolean>(false);
  
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [mapCenter, setMapCenter] = useState<[number, number]>([-23.5900, -46.6200]); // SP Center roughly
  const [selectedFamilyPreview, setSelectedFamilyPreview] = useState<Family | null>(null);

  // Sync Bairro filter with Context Selected Region
  useEffect(() => {
    if (selectedRegion) {
      setBairroFilter(selectedRegion);
    }
  }, [selectedRegion]);

  // Recenter map when bairro filter changes
  useEffect(() => {
    if (bairroFilter === 'all') {
      setMapCenter([-23.5900, -46.6200]);
    } else {
      const firstFam = MOCK_MAP_FAMILIES.find(f => f.neighborhood.toLowerCase() === bairroFilter.toLowerCase());
      if (firstFam) {
        setMapCenter([firstFam.latitude, firstFam.longitude]);
      }
    }
  }, [bairroFilter]);

  // Filter Logic
  const filteredFamilies = MOCK_MAP_FAMILIES.filter(fam => {
    if (bairroFilter !== 'all' && fam.neighborhood.toLowerCase() !== bairroFilter.toLowerCase()) return false;
    if (statusFilter === 'needs_help' && fam.supportStatus !== 'needs_help') return false;
    if (statusFilter === 'fed' && fam.supportStatus !== 'fed') return false;
    if (urgencyFilter === 'high' && fam.priorityLevel < 4) return false;
    return true;
  });

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleMarkerClick = (fam: Family) => {
    if (isSelectionMode) {
      if (fam.supportStatus === 'needs_help') {
        toggleSelection(fam.id);
      }
    } else {
      setSelectedFamilyPreview(fam);
    }
  };

  // Custom DivIcons with Glowing Shadows
  const createMarkerIcon = (fam: Family) => {
    const isSelected = selectedIds.includes(fam.id);
    const isUrgent = fam.priorityLevel >= 4 && fam.supportStatus === 'needs_help';
    const isFed = fam.supportStatus === 'fed';
    
    let markerClass = 'marker-pin';
    let iconEmoji = '💔';
    
    if (isFed) {
      markerClass += ' stable-glow';
      iconEmoji = '❤️';
    } else if (isUrgent) {
      markerClass += ' urgent-glow';
    } else {
      markerClass += ' warning-glow';
    }

    if (isSelected) {
      markerClass += ' selected-glow';
      iconEmoji = '✅';
    }

    return L.divIcon({
      html: `<div class="${markerClass}">${iconEmoji}</div>`,
      className: 'custom-marker-wrapper',
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });
  };

  return (
    <div className="map-view-page">
      {/* ── Geometric & Glassmorphic Filter Bar ── */}
      <div className="map-top-bar glassmorphism">
        <div className="filters-row flex gap-2 overflow-x-auto py-2 px-3">
          {/* Bairro Selector */}
          <select 
            className="filter-select text-xs font-semibold text-primary" 
            value={bairroFilter}
            onChange={(e) => {
              setBairroFilter(e.target.value);
              setSelectedRegion(e.target.value === 'all' ? null : e.target.value);
            }}
          >
            <option value="all">Todas as Regiões</option>
            <option value="Heliópolis">Heliópolis</option>
            <option value="Paraisópolis">Paraisópolis</option>
            <option value="Cidade Tiradentes">Cidade Tiradentes</option>
            <option value="Brasilândia">Brasilândia</option>
          </select>

          {/* Status Filter */}
          <select 
            className="filter-select text-xs font-semibold text-primary"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Todos os Status</option>
            <option value="needs_help">Aguardando Refeição</option>
            <option value="fed">Alimentadas Hoje</option>
          </select>

          {/* Urgency Filter */}
          <select 
            className="filter-select text-xs font-semibold text-primary"
            value={urgencyFilter}
            onChange={(e) => setUrgencyFilter(e.target.value)}
          >
            <option value="all">Todas as Urgências</option>
            <option value="high">Alta Prioridade (Urgente)</option>
          </select>

          {/* Mass Selection Toggle */}
          <button 
            className={`filter-btn flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-sm border ${
              isSelectionMode 
                ? 'bg-secondary text-primary border-secondary' 
                : 'bg-white/80 text-outline border-outline/10'
            }`}
            onClick={() => {
              setIsSelectionMode(!isSelectionMode);
              setSelectedIds([]);
            }}
          >
            <Layers size={12} />
            {isSelectionMode ? 'Apoio Coletivo: Sim' : 'Apoio Coletivo'}
          </button>
        </div>
      </div>

      {/* ── Leaflet Map Container ── */}
      <div className="map-container-wrapper">
        <MapContainer
          center={mapCenter}
          zoom={12}
          scrollWheelZoom={true}
          zoomControl={false}
        >
          <MapRecenter center={mapCenter} />
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            attribution='&copy; OpenStreetMap contributors &copy; CARTO'
          />

          {filteredFamilies.map((fam) => (
            <Marker 
              key={fam.id} 
              position={[fam.latitude, fam.longitude]}
              icon={createMarkerIcon(fam)}
              eventHandlers={{
                click: () => handleMarkerClick(fam)
              }}
            />
          ))}
        </MapContainer>
      </div>

      {/* ── Legend Card (Left Bottom) ── */}
      <div className="map-legend-overlay">
        <div className="legend-card glassmorphism p-3">
          <div className="legend-item text-xs font-bold text-primary mb-1">LEGENDA</div>
          <div className="legend-item text-xs"><span className="bullet urgent"></span> Urgência Crítica (💔)</div>
          <div className="legend-item text-xs"><span className="bullet warning"></span> Aguardando (💔)</div>
          <div className="legend-item text-xs"><span className="bullet stable"></span> Alimentada (❤️)</div>
        </div>
      </div>

      {/* ── Mass Support Button (Bottom) ── */}
      {isSelectionMode && selectedIds.length > 0 && (
        <div className="mass-action-overlay p-4">
          <Button 
            variant="secondary" 
            size="large" 
            fullWidth 
            className="shadow-glow"
            onClick={() => navigate('/donate', { state: { selectedFamilyIds: selectedIds } })}
          >
            Alimentar {selectedIds.length} {selectedIds.length === 1 ? 'família' : 'famílias'} selecionadas
          </Button>
        </div>
      )}

      {/* ── Recenter Controls (Right Bottom) ── */}
      <div className="map-controls-overlay">
        <button 
          onClick={() => setMapCenter([-23.5900, -46.6200])}
          className="map-control-btn glassmorphism"
          aria-label="Recentrar Mapa"
        >
          <LocateFixed size={20} className="text-primary" />
        </button>
      </div>

      {/* ── Slide-up BottomSheet for Family Preview ── */}
      <BottomSheet 
        isOpen={selectedFamilyPreview !== null} 
        onClose={() => setSelectedFamilyPreview(null)}
        title="Ficha do Beneficiário"
      >
        {selectedFamilyPreview && (
          <div className="family-preview-card p-2 flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-extrabold text-primary text-lg">{selectedFamilyPreview.representativeName}</h3>
                <span className="text-xs text-outline">{selectedFamilyPreview.neighborhood} • {selectedFamilyPreview.distanceToUser}</span>
              </div>
              <span className={`urgency-badge text-xs font-bold px-2 py-1 rounded-sm ${
                selectedFamilyPreview.priorityLevel >= 4 ? 'bg-error/10 text-error' : 'bg-success/10 text-success'
              }`}>
                Prioridade {selectedFamilyPreview.priorityLevel}/5
              </span>
            </div>

            <p className="text-sm text-text-main italic">"{selectedFamilyPreview.description}"</p>

            <div className="bg-surface-highest/60 p-3 rounded-md border border-outline/5">
              <span className="text-[10px] uppercase font-bold text-outline block mb-1">Necessidade Principal</span>
              <p className="text-sm font-semibold">{selectedFamilyPreview.mainNeed}</p>
              <div className="mt-2 text-xs text-outline flex items-center gap-1">
                <ShieldAlert size={14} className="text-secondary" />
                <span>Validado por: <strong>{selectedFamilyPreview.sourceEntityName || 'Parceiro Oficial'}</strong></span>
              </div>
            </div>

            <div className="flex justify-between items-center text-sm font-medium border-t border-outline/10 pt-3">
              <span>Filhos: <strong>{selectedFamilyPreview.childrenCount}</strong></span>
              {selectedFamilyPreview.supportStatus === 'fed' ? (
                <span className="text-success flex items-center gap-1">
                  <Check size={16} /> Alimentado hoje
                </span>
              ) : (
                <span className="text-error">Precisa de Refeição</span>
              )}
            </div>

            <div className="flex gap-2 mt-2">
              <Button 
                variant="outline" 
                fullWidth
                onClick={() => navigate(`/family/${selectedFamilyPreview.id}`)}
              >
                Ver Ficha Completa
              </Button>
              {selectedFamilyPreview.supportStatus === 'needs_help' && (
                <Button 
                  variant="primary" 
                  fullWidth
                  className="bg-secondary text-primary"
                  onClick={() => navigate('/donate', { state: { targetFamily: selectedFamilyPreview } })}
                >
                  Alimentar Família
                </Button>
              )}
            </div>
          </div>
        )}
      </BottomSheet>
    </div>
  );
};

export default MapView;
