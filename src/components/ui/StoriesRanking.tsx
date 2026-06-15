import React from 'react';
import { User } from 'lucide-react';
import './StoriesRanking.css';

interface Donor {
  id: string;
  name: string;
  avatar: string;
  totalDonated: number;
  instagram?: string;
  personalMessage?: string;
  supportsCount?: number;
  focusRegion?: string;
  isAnonymous?: boolean;
  privacySettings?: {
    showOnRanking?: boolean;
    showInstagram?: boolean;
    anonymousMode?: boolean;
  };
}

interface StoriesRankingProps {
  donors: Donor[];
  onSelectDonor?: (donor: Donor) => void;
}

const StoriesRanking: React.FC<StoriesRankingProps> = ({ donors, onSelectDonor }) => {
  return (
    <div className="stories-ranking-container">
      <div className="stories-scroll">
        {donors.map((donor) => {
          const isAnon = donor.isAnonymous || donor.privacySettings?.anonymousMode;
          const displayName = isAnon ? 'Anônimo' : donor.name;

          return (
            <div
              key={donor.id}
              className="story-item"
              onClick={() => onSelectDonor?.(donor)}
            >
              <div className={`story-avatar-ring ${donor.totalDonated > 100 ? 'top-tier' : ''}`}>
                <div className="story-avatar">
                  {isAnon ? (
                    <User size={24} className="text-outline/40" />
                  ) : donor.avatar?.startsWith('http') ? (
                    <img src={donor.avatar} alt={donor.name} />
                  ) : (
                    donor.avatar || donor.name[0]
                  )}
                </div>
              </div>
              <span className="story-name">{displayName}</span>
            </div>
          );
        })}
        {/* Posição 21+ Sorteio */}
        <div
          className="story-item"
          onClick={() => onSelectDonor?.({ id: 'sorteio', name: 'Sorteio Destaque', totalDonated: 0, isSorteio: true } as any)}
        >
          <div className="story-avatar-ring special-tier">
            <div className="story-avatar bg-secondary text-primary font-bold text-xs" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              21+
            </div>
          </div>
          <span className="story-name" style={{ color: 'var(--color-secondary)' }}>Sorteio 21+</span>
        </div>
      </div>
    </div>
  );
};

export default StoriesRanking;
