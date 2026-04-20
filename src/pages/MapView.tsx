import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { familyService } from '../backend/services/familyService';
import type { Family } from '../backend/types';
import Button from '../components/ui/Button';
import { LocateFixed, Filter } from 'lucide-react';
import './MapView.css';

// Fix missing leafet icon paths conceptually
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom Icons
const brokenHeartIcon = L.divIcon({
  html: "💔",
  className: "custom-marker broken",
  iconSize: [30, 30]
});

const fullHeartIcon = L.divIcon({
  html: "❤️",
  className: "custom-marker",
  iconSize: [30, 30]
});

// Helper component to recenter map
const RecenterControls = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
};

const MapView: React.FC = () => {
  const navigate = useNavigate();
  const [families, setFamilies] = useState<Family[]>([]);
  const [showOnlyNeedsHelp, setShowOnlyNeedsHelp] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([-23.5505, -46.6333]); // SP Base

  useEffect(() => {
    familyService.getFamilies().then(fams => {
      setFamilies(fams);
    });
  }, []);

  const displayedFamilies = showOnlyNeedsHelp 
    ? families.filter(f => f.supportStatus === 'needs_help')
    : families;

  const validFamilies = displayedFamilies.filter(f => {
    const isValid = f.latitude !== undefined && f.latitude !== null && !isNaN(f.latitude) &&
                    f.longitude !== undefined && f.longitude !== null && !isNaN(f.longitude);
    if (!isValid) {
      console.warn(`Família inválida ignorada na renderização do mapa: ${f.id} - ${f.representativeName}`, f);
    }
    return isValid;
  });

  const handleRecenter = () => {
    // In a real app we'd get device coordinates. Here we recenter to SP Base.
    setMapCenter([-23.5505, -46.6333]);
  };

  return (
    <div className="map-view-page">
      <div className="map-container-wrapper">
        <MapContainer
          center={mapCenter}
          zoom={11}
          scrollWheelZoom={false}
          zoomControl={false}
        >
          <RecenterControls center={mapCenter} />
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            attribution='&copy; OpenStreetMap contributors &copy; CARTO'
          />

          {validFamilies.length === 0 && !showOnlyNeedsHelp && families.length > 0 && (
             <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 1000, background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', textAlign: 'center' }}>
                <h3 className="text-secondary font-bold mb-2">Nenhuma família plotada</h3>
                <p className="text-sm text-outline">As famílias não possuem coordenadas válidas simuladas.</p>
             </div>
          )}

          {validFamilies.map((fam) => (
            <Marker 
              key={fam.id} 
              position={[fam.latitude, fam.longitude]}
              icon={fam.supportStatus === 'needs_help' ? brokenHeartIcon : fullHeartIcon}
            >
              <Popup>
                <div className="popup-header">
                  <h4 style={{ margin: 0, fontSize: '1rem' }}>{fam.representativeName}</h4>
                  <span style={{ fontSize: '0.75rem', opacity: 0.9 }}>{fam.childrenCount} filhos</span>
                </div>
                <div className="popup-body">
                  <p style={{ margin: '0 0 10px 0', fontSize: '0.85rem', color: '#666' }}>
                    <strong>{fam.neighborhood}</strong><br/>
                    {fam.description}
                  </p>
                  {fam.supportStatus === 'needs_help' ? (
                    <div style={{ color: 'var(--color-error)', fontWeight: 600, fontSize: '0.8rem', display: 'flex', gap: '4px', alignItems: 'center' }}>
                      💔 Precisa de apoio Nível {fam.priorityLevel}
                    </div>
                  ) : (
                    <div style={{ color: 'var(--color-success)', fontWeight: 600, fontSize: '0.8rem', display: 'flex', gap: '4px', alignItems: 'center' }}>
                      ❤️ Família Apoiada
                    </div>
                  )}
                </div>
                
                <div className="popup-actions">
                  <Button 
                    variant="outline" 
                    size="small" 
                    fullWidth 
                    onClick={(e) => {
                       e.stopPropagation();
                       navigate(`/family/${fam.id}`);
                    }}
                  >
                    Ver
                  </Button>
                  
                  {fam.supportStatus === 'needs_help' && (
                    <Button 
                      size="small" 
                      fullWidth 
                      className="bg-error border-error text-inverted"
                      onClick={(e) => {
                         e.stopPropagation();
                         navigate('/donate', { state: { targetFamily: fam } });
                      }}
                    >
                      Ajudar
                    </Button>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <div className="map-overlays">
        <div className="map-header">
           <div className="legend-card">
              <div className="legend-item"><span style={{fontSize: '1.2rem'}}>💔</span> Aguardando apoio</div>
              <div className="legend-item"><span style={{fontSize: '1.2rem'}}>❤️</span> Família segura</div>
           </div>
           
           <div className="filter-card">
              <button 
                className="flex items-center gap-2 font-semibold text-sm text-primary"
                onClick={() => setShowOnlyNeedsHelp(!showOnlyNeedsHelp)}
              >
                <Filter size={16} />
                {showOnlyNeedsHelp ? 'Mostrando: Urgências' : 'Mostrando: Todas'}
              </button>
           </div>
        </div>

        <div className="map-controls">
           <button 
             onClick={handleRecenter}
             className="bg-primary text-inverted p-3 rounded-full shadow-lg flex items-center justify-center cursor-pointer"
             aria-label="Centralizar na minha região"
           >
             <LocateFixed size={24} />
           </button>
        </div>
      </div>
    </div>
  );
};

export default MapView;
