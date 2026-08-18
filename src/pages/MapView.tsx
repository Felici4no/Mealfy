import React, { useEffect, useState, useCallback } from 'react';
import { Geolocation } from '@capacitor/geolocation';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { Family } from '../backend/types';
import { regionsApi, type MapCommunity } from '../api/regionsApi';
import Button from '../components/ui/Button';
import { LocateFixed, Layers, ShieldAlert, Check, SlidersHorizontal, Info, Bookmark, BookmarkCheck } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { familyService } from '../backend/services/familyService';
import { PROVIDER_LABELS } from '../backend/mockData/giftCardInventory';
import { isBeneficiaryEligible } from '../backend/utils/timeUtils';
import BottomSheet from '../components/ui/BottomSheet';
import './MapView.css';

// Fix Leaflet icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Centros aproximados por cidade (para o filtro SP/RJ)
const CITY_CENTERS: Record<string, [number, number]> = {
  SP: [-23.5900, -46.6200],
  RJ: [-22.9100, -43.2900],
};

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
  const { selectedRegion, setSelectedRegion, user, toggleSavedFamily } = useAppContext();

  // Filter States
  const [bairroFilter, setBairroFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('all');
  const [highlightSaved, setHighlightSaved] = useState<boolean>(false);
  const [isSelectionMode, setIsSelectionMode] = useState<boolean>(false);

  // Sheet States
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isLegendOpen, setIsLegendOpen] = useState(false);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [mapCenter, setMapCenter] = useState<[number, number]>([-23.5900, -46.6200]); // SP Center roughly
  const [selectedFamilyPreview, setSelectedFamilyPreview] = useState<Family | null>(null);

  // Famílias vêm do backend (GET /families/map) via familyService.
  const [families, setFamilies] = useState<Family[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [cityFilter, setCityFilter] = useState<'all' | 'SP' | 'RJ'>('all');

  const loadFamilies = useCallback(() => {
    setLoadError(null);
    familyService.getMapFamilies()
      .then(f => setFamilies(f))
      .catch((err) => setLoadError(err?.message || 'Não foi possível carregar o mapa.'));
  }, []);

  useEffect(() => { loadFamilies(); }, [loadFamilies]);

  // ── Comunidades: as áreas desenhadas no mapa ──
  // Antes o mapa só tinha pinos de família e o filtro de "região" era montado a
  // partir do texto livre de cada cadastro. O doador via alfinetes soltos sem
  // saber a quem estava doando: "Cidade de Deus" e "Heliópolis" não existiam
  // como lugar em parte nenhuma.
  const [communities, setCommunities] = useState<MapCommunity[]>([]);

  useEffect(() => {
    regionsApi.getMapCommunities()
      .then(res => setCommunities(res?.communities ?? []))
      .catch(() => setCommunities([])); // sem áreas o mapa ainda mostra as famílias
  }, []);

  // ── Localização do usuário (Android/web) com fallback ──
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [geoStatus, setGeoStatus] = useState<'idle' | 'loading' | 'granted' | 'denied'>('idle');

  const requestLocation = useCallback(async () => {
    setGeoStatus('loading');
    try {
      const pos = await Geolocation.getCurrentPosition({ timeout: 8000, enableHighAccuracy: false });
      setUserLocation([pos.coords.latitude, pos.coords.longitude]);
      setGeoStatus('granted');
    } catch {
      setGeoStatus('denied'); // mapa continua com fallback (SP / região escolhida)
    }
  }, []);

  useEffect(() => { requestLocation(); }, [requestLocation]);

  /** Nome da área da família — a comunidade resolvida, ou o bairro digitado. */
  const areaOf = (f: Family) => f.community || f.neighborhood || '';

  // O filtro passa a listar comunidades de verdade. Enquanto elas não carregam,
  // cai no texto das famílias para o filtro não ficar vazio.
  const REGIONS = communities.length > 0
    ? communities.map(c => c.name)
    : Array.from(new Set(families.map(areaOf).filter(Boolean))).sort();

  const savedFamilyIds = user?.savedFamilyIds || [];

  // Sync Bairro filter with Context Selected Region
  useEffect(() => {
    if (selectedRegion) {
      setBairroFilter(selectedRegion);
    }
  }, [selectedRegion]);

  // Recenter map when bairro/city filter changes
  useEffect(() => {
    if (bairroFilter !== 'all') {
      // A comunidade manda: ela tem posição própria mesmo que nenhuma família
      // dali tenha pedido apoio hoje.
      const area = communities.find(c => c.name.toLowerCase() === bairroFilter.toLowerCase());
      if (area?.latitude != null && area.longitude != null) {
        setMapCenter([area.latitude, area.longitude]);
        return;
      }
      const firstFam = families.find(f => areaOf(f).toLowerCase() === bairroFilter.toLowerCase());
      if (firstFam) { setMapCenter([firstFam.latitude, firstFam.longitude]); return; }
    }
    if (cityFilter !== 'all') {
      setMapCenter(CITY_CENTERS[cityFilter]);
      return;
    }
    if (userLocation) {
      setMapCenter(userLocation);
      return;
    }
    setMapCenter([-23.5900, -46.6200]);
  }, [bairroFilter, cityFilter, families, communities, userLocation]);

  // Filter Logic
  const filteredFamilies = families.filter(fam => {
    if (cityFilter !== 'all' && fam.state !== cityFilter) return false;
    if (bairroFilter !== 'all' && areaOf(fam).toLowerCase() !== bairroFilter.toLowerCase()) return false;
    if (statusFilter === 'needs_help' && !isBeneficiaryEligible(fam)) return false;
    if (statusFilter === 'fed' && isBeneficiaryEligible(fam)) return false;
    if (urgencyFilter === 'high' && fam.priorityLevel < 4) return false;
    if (highlightSaved && !savedFamilyIds.includes(fam.id)) return false;
    return true;
  });

  const activeFilterCount =
    (cityFilter !== 'all' ? 1 : 0) +
    (bairroFilter !== 'all' ? 1 : 0) +
    (statusFilter !== 'all' ? 1 : 0) +
    (urgencyFilter !== 'all' ? 1 : 0) +
    (highlightSaved ? 1 : 0);

  const toggleSelection = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleMarkerClick = (fam: Family) => {
    if (isSelectionMode) {
      if (isBeneficiaryEligible(fam)) {
        toggleSelection(fam.id);
      }
    } else {
      setSelectedFamilyPreview(fam);
    }
  };

  const handleBairroSelect = (value: string) => {
    setBairroFilter(value);
    setSelectedRegion(value === 'all' ? null : value);
  };

  const resetFilters = () => {
    setBairroFilter('all');
    setSelectedRegion(null);
    setStatusFilter('all');
    setUrgencyFilter('all');
    setHighlightSaved(false);
  };

  // Custom DivIcons with Glowing Shadows
  const createMarkerIcon = (fam: Family) => {
    const isSelected = selectedIds.includes(fam.id);
    const isFed = !isBeneficiaryEligible(fam);
    const isUrgent = fam.priorityLevel >= 4 && !isFed;
    const isSaved = savedFamilyIds.includes(fam.id);

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

    if (highlightSaved && isSaved) {
      markerClass += ' saved-highlight';
    }

    return L.divIcon({
      html: `<div class="${markerClass}">${iconEmoji}</div>`,
      className: 'custom-marker-wrapper',
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });
  };

  /**
   * Etiqueta da área: nome + quantas famílias pediram apoio hoje.
   *
   * É o que responde "para quem eu estou doando?" — o pino sozinho nunca
   * respondeu isso.
   */
  const createAreaLabel = (c: MapCommunity) => {
    const urgent = c.familiesInNeed > 0;
    const detail = urgent
      ? `${c.familiesInNeed} pedindo hoje`
      : `${c.familiesTotal} ${c.familiesTotal === 1 ? 'família' : 'famílias'}`;

    return L.divIcon({
      html:
        `<div class="area-label ${urgent ? 'area-label--urgent' : ''}">` +
        `<span class="area-label__name">${c.name}</span>` +
        `<span class="area-label__count">${detail}</span>` +
        `</div>`,
      className: 'area-label-wrapper',
      iconSize: [0, 0], // o CSS dimensiona; tamanho fixo cortaria nomes longos
      iconAnchor: [0, 0],
    });
  };

  const visibleCommunities = communities.filter(c => {
    if (c.latitude == null || c.longitude == null) return false;
    if (cityFilter !== 'all' && c.state !== cityFilter) return false;
    if (bairroFilter !== 'all' && c.name.toLowerCase() !== bairroFilter.toLowerCase()) return false;
    return true;
  });

  const isPreviewSaved = selectedFamilyPreview ? savedFamilyIds.includes(selectedFamilyPreview.id) : false;

  return (
    <div className="map-view-page">
      {/* ── Floating map controls (each is a standalone glass pill) ── */}
      <div className="map-top-bar">
        <div className="filters-row flex gap-2">
          <button
            className={`filter-action-btn ${activeFilterCount > 0 ? 'active' : ''}`}
            onClick={() => setIsFiltersOpen(true)}
          >
            <SlidersHorizontal size={14} />
            Filtros
            {activeFilterCount > 0 && (
              <span className="filter-badge">{activeFilterCount}</span>
            )}
          </button>

          <button
            className="filter-action-btn"
            onClick={() => setIsLegendOpen(true)}
            aria-label="Ver legenda do mapa"
          >
            <Info size={14} />
            Legenda
          </button>

          {/* Mass Selection Toggle */}
          <button
            className={`filter-action-btn ${isSelectionMode ? 'active' : ''}`}
            onClick={() => {
              setIsSelectionMode(!isSelectionMode);
              setSelectedIds([]);
            }}
          >
            <Layers size={14} />
            Apoio Coletivo
          </button>
        </div>
      </div>

      {/* ── Erro ao carregar famílias do backend ── */}
      {loadError && (
        <div className="map-geo-banner map-geo-banner--warn">
          <span>{loadError}</span>
          <div className="map-geo-actions">
            <button onClick={loadFamilies}>Tentar novamente</button>
          </div>
        </div>
      )}

      {/* ── Banner de localização ── */}
      {geoStatus === 'loading' && (
        <div className="map-geo-banner">Permita sua localização para encontrar famílias próximas…</div>
      )}
      {geoStatus === 'denied' && (
        <div className="map-geo-banner map-geo-banner--warn">
          <span>Não conseguimos acessar sua localização. Você ainda pode explorar famílias por região.</span>
          <div className="map-geo-actions">
            <button onClick={requestLocation}>Tentar novamente</button>
            <button onClick={() => { setUserLocation(null); setCityFilter('all'); setBairroFilter('all'); setMapCenter([-23.5900, -46.6200]); setGeoStatus('idle'); }}>Usar região padrão</button>
            <button onClick={() => setIsFiltersOpen(true)}>Selecionar região</button>
          </div>
        </div>
      )}

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

          {/* ── Áreas (comunidades) ── desenhadas abaixo dos pinos de família */}
          {visibleCommunities.map((c) => (
            <React.Fragment key={c.id}>
              {/* O círculo só aparece quando sabemos ONDE fica a comunidade.
                  Com `region_centroid` a posição é o centro do município, e
                  desenhar uma área ali sugeriria uma precisão que não existe —
                  fica só a etiqueta. */}
              {c.source === 'osm' && (
                <Circle
                  center={[c.latitude!, c.longitude!]}
                  radius={700}
                  pathOptions={{
                    className: c.familiesInNeed > 0 ? 'area-circle area-circle--urgent' : 'area-circle',
                  }}
                />
              )}
              <Marker
                position={[c.latitude!, c.longitude!]}
                icon={createAreaLabel(c)}
                eventHandlers={{ click: () => handleBairroSelect(c.name) }}
              />
            </React.Fragment>
          ))}

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

      {/* ── Filtros BottomSheet ── */}
      <BottomSheet isOpen={isFiltersOpen} onClose={() => setIsFiltersOpen(false)} title="Filtros do Mapa">
        <div className="flex flex-col gap-5">
          <div className="filter-group">
            <span className="filter-group-label">Cidade</span>
            <div className="filter-chip-group">
              <button className={`filter-chip ${cityFilter === 'all' ? 'active' : ''}`} onClick={() => { setCityFilter('all'); setBairroFilter('all'); }}>
                Todas
              </button>
              <button className={`filter-chip ${cityFilter === 'SP' ? 'active' : ''}`} onClick={() => { setCityFilter('SP'); setBairroFilter('all'); }}>
                São Paulo
              </button>
              <button className={`filter-chip ${cityFilter === 'RJ' ? 'active' : ''}`} onClick={() => { setCityFilter('RJ'); setBairroFilter('all'); }}>
                Rio de Janeiro
              </button>
            </div>
          </div>

          <div className="filter-group">
            <span className="filter-group-label">Região</span>
            <div className="filter-chip-group">
              <button className={`filter-chip ${bairroFilter === 'all' ? 'active' : ''}`} onClick={() => handleBairroSelect('all')}>
                Todas
              </button>
              {REGIONS.map((region) => (
                <button
                  key={region}
                  className={`filter-chip ${bairroFilter === region ? 'active' : ''}`}
                  onClick={() => handleBairroSelect(region)}
                >
                  {region}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <span className="filter-group-label">Status</span>
            <div className="filter-chip-group">
              <button className={`filter-chip ${statusFilter === 'all' ? 'active' : ''}`} onClick={() => setStatusFilter('all')}>
                Todos
              </button>
              <button className={`filter-chip ${statusFilter === 'needs_help' ? 'active' : ''}`} onClick={() => setStatusFilter('needs_help')}>
                Aguardando Refeição
              </button>
              <button className={`filter-chip ${statusFilter === 'fed' ? 'active' : ''}`} onClick={() => setStatusFilter('fed')}>
                Alimentadas Hoje
              </button>
            </div>
          </div>

          <div className="filter-group">
            <span className="filter-group-label">Urgência</span>
            <div className="filter-chip-group">
              <button className={`filter-chip ${urgencyFilter === 'all' ? 'active' : ''}`} onClick={() => setUrgencyFilter('all')}>
                Todas
              </button>
              <button className={`filter-chip ${urgencyFilter === 'high' ? 'active' : ''}`} onClick={() => setUrgencyFilter('high')}>
                Alta Prioridade (Urgente)
              </button>
            </div>
          </div>

          <div className="filter-group">
            <span className="filter-group-label">Família Salva</span>
            <button
              className={`filter-chip filter-chip--block ${highlightSaved ? 'active' : ''}`}
              onClick={() => setHighlightSaved(v => !v)}
            >
              <Bookmark size={14} className={highlightSaved ? 'fill-current' : ''} />
              Destacar famílias salvas
            </button>
          </div>

          <div className="flex gap-2 mt-1">
            <Button variant="outline" fullWidth onClick={resetFilters}>
              Limpar filtros
            </Button>
            <Button variant="primary" fullWidth onClick={() => setIsFiltersOpen(false)}>
              Ver resultados
            </Button>
          </div>
        </div>
      </BottomSheet>

      {/* ── Legenda BottomSheet ── */}
      <BottomSheet isOpen={isLegendOpen} onClose={() => setIsLegendOpen(false)} title="Legenda do Mapa">
        <div className="surface-card legend-card">
          <div className="legend-item">
            <span className="legend-icon">📍</span>
            <span className="legend-text">
              Nome da comunidade e quantas famílias pedem apoio hoje. A área é
              aproximada — marca a região, não o endereço de ninguém.
            </span>
          </div>
          <div className="legend-item">
            <span className="bullet urgent"></span>
            <span className="legend-icon">💔</span>
            <span className="legend-text">Urgência Crítica</span>
          </div>
          <div className="legend-item">
            <span className="bullet warning"></span>
            <span className="legend-icon">💔</span>
            <span className="legend-text">Aguardando</span>
          </div>
          <div className="legend-item">
            <span className="bullet stable"></span>
            <span className="legend-icon">❤️</span>
            <span className="legend-text">Alimentada</span>
          </div>
          <div className="legend-item">
            <span className="bullet saved"></span>
            <span className="legend-icon"><Bookmark size={14} /></span>
            <span className="legend-text">Família salva (com destaque ativo)</span>
          </div>
        </div>
      </BottomSheet>

      {/* ── Slide-up BottomSheet for Family Preview ── */}
      <BottomSheet
        isOpen={selectedFamilyPreview !== null}
        onClose={() => setSelectedFamilyPreview(null)}
        title="Ficha do Beneficiário"
      >
        {selectedFamilyPreview && (
          <div className="family-preview-card p-2 flex flex-col gap-3">
            <div className="flex justify-between items-start gap-2">
              <div>
                <h3 className="font-extrabold text-primary text-lg">{selectedFamilyPreview.representativeName}</h3>
                <span className="text-xs text-outline">
                  {(selectedFamilyPreview.community || selectedFamilyPreview.neighborhood)}, {selectedFamilyPreview.neighborhood} — {selectedFamilyPreview.city}/{selectedFamilyPreview.state}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  className={`save-family-btn ${isPreviewSaved ? 'active' : ''}`}
                  onClick={() => toggleSavedFamily(selectedFamilyPreview.id)}
                  aria-label={isPreviewSaved ? 'Remover dos salvos' : 'Salvar família'}
                >
                  {isPreviewSaved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
                </button>
                <span className={`urgency-badge text-xs font-bold px-2 py-1 rounded-sm ${
                  selectedFamilyPreview.priorityLevel >= 4 ? 'bg-error/10 text-error' : 'bg-success/10 text-success'
                }`}>
                  Prioridade {selectedFamilyPreview.priorityLevel}/5
                </span>
              </div>
            </div>

            {/* Localização aproximada (sem endereço residencial completo) */}
            <div className="bg-surface-highest/60 p-3 rounded-md border border-outline/5 text-xs text-text-main flex flex-col gap-1">
              {selectedFamilyPreview.zone && (
                <span className="text-outline">{selectedFamilyPreview.zone}</span>
              )}
              <span><strong>Endereço aproximado:</strong> {selectedFamilyPreview.approximateAddress || selectedFamilyPreview.neighborhood}</span>
              {selectedFamilyPreview.referencePoint && (
                <span><strong>Referência:</strong> {selectedFamilyPreview.referencePoint}</span>
              )}
              <span><strong>Vale escolhido:</strong> {PROVIDER_LABELS[selectedFamilyPreview.preferredGiftCardProvider || 'ifood']}</span>
            </div>

            <p className="text-sm text-text-main italic">"{selectedFamilyPreview.description}"</p>

            <div className="bg-surface-highest/60 p-3 rounded-md border border-outline/5">
              <span className="text-[10px] uppercase font-bold text-outline block mb-1">O que essa família precisa hoje</span>
              <p className="text-sm font-semibold">{selectedFamilyPreview.mainNeed}</p>
              <div className="mt-2 text-xs text-outline flex items-center gap-1">
                <ShieldAlert size={14} className="text-secondary" />
                <span>Validado por: <strong>{selectedFamilyPreview.sourceEntityName || 'Parceiro Oficial'}</strong></span>
              </div>
            </div>

            {/* Alimentada por */}
            {!isBeneficiaryEligible(selectedFamilyPreview) && selectedFamilyPreview.lastFedByName && (
              <div className="bg-success/10 border border-success/20 p-3 rounded-md text-xs">
                <span className="text-[10px] uppercase font-bold text-success block mb-1">Alimentada por</span>
                <span className="text-sm font-bold text-text-main">{selectedFamilyPreview.lastFedByName}</span>
                {selectedFamilyPreview.lastFedByInstagram && (
                  <span className="text-secondary"> · {selectedFamilyPreview.lastFedByInstagram}</span>
                )}
                {selectedFamilyPreview.lastGiftCardProvider && (
                  <span className="text-outline block">Vale {PROVIDER_LABELS[selectedFamilyPreview.lastGiftCardProvider]}</span>
                )}
              </div>
            )}

            <div className="flex justify-between items-center text-sm font-medium border-t border-outline/10 pt-3">
              <span>Dependentes: <strong>{selectedFamilyPreview.childrenCount}</strong></span>
              {isBeneficiaryEligible(selectedFamilyPreview) ? (
                <span className="text-secondary font-bold">Disponível para receber hoje</span>
              ) : (
                <span className="text-success flex items-center gap-1">
                  <Check size={16} /> Já alimentada hoje
                </span>
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
              {isBeneficiaryEligible(selectedFamilyPreview) && (
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
