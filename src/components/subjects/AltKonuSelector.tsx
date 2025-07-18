import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SubjectCard, SubjectHeader, subjectStyles, themeConfig } from './common';
import { altKonularConfig, AltKonu } from '../../data/subjects/altKonularConfig';

interface AltKonuSelectorProps {
  subjectId: string;
  subjectName: string;
}

const AltKonuSelector: React.FC<AltKonuSelectorProps> = ({ subjectId, subjectName }) => {
  const navigate = useNavigate();
  
  // Alt konuları konfigürasyondan al
  const altKonular = altKonularConfig[subjectId];
  
  if (!altKonular || altKonular.length === 0) {
    return (
      <div className="container">
        <SubjectHeader title={`${subjectName} - Alt Konular`} />
        <div className="card" style={subjectStyles.cardContainer.tyt}>
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <h2 style={{ color: '#6366f1', fontWeight: 800, fontSize: 28 }}>
              📚 Bu ders için henüz alt konular eklenmemiş
            </h2>
            <p style={{ color: '#555', fontSize: 16, marginTop: 16 }}>
              Yakında bu dersin alt konuları eklenecek!
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleAltKonuClick = (altKonu: AltKonu) => {
    navigate(altKonu.route);
  };

  // Tema belirleme (subjectId'ye göre)
  const getTheme = (): 'tyt' | 'aytSayisal' | 'aytEa' | 'aytSozel' => {
    if (subjectId.startsWith('tyt-')) return 'tyt';
    if (subjectId.startsWith('ayt-')) {
      // AYT derslerinin hangi kategoride olduğunu belirle
      const aytSubjects: Record<string, 'aytSayisal' | 'aytEa' | 'aytSozel'> = {
        'ayt-matematik': 'aytSayisal',
        'ayt-fizik': 'aytSayisal',
        'ayt-kimya': 'aytSayisal',
        'ayt-biyoloji': 'aytSayisal',
        'ayt-edebiyat': 'aytEa',
        'ayt-tarih': 'aytEa',
        'ayt-cografya': 'aytEa',
        'ayt-din': 'aytSozel',
        'ayt-felsefe': 'aytSozel'
      };
      return aytSubjects[subjectId] || 'aytSayisal';
    }
    return 'tyt';
  };

  const theme = getTheme();
  const themeData = themeConfig[theme];

  return (
    <div className="container">
      <SubjectHeader title={`${subjectName} - Alt Konular`} />
      
      <div className="card" style={themeData.cardContainer}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h2 style={{ 
            color: themeData.titleColor, 
            fontWeight: 800, 
            fontSize: 28, 
            letterSpacing: 1 
          }}>
            📚 Hangi alt konuyu seçmek istersin?
          </h2>
          <p style={{ color: '#555', fontSize: 16, marginTop: 8 }}>
            Her alt konuda özgün sorular seni bekliyor!
          </p>
        </div>
        
        <div className="category-grid" style={subjectStyles.grid.container}>
          {altKonular.map((altKonu, index) => (
            <SubjectCard
              key={altKonu.id}
              id={altKonu.id}
              label={altKonu.label}
              icon={altKonu.icon}
              color={altKonu.color}
              onClick={() => handleAltKonuClick(altKonu)}
              index={index}
              isAltKonu={true}
            />
          ))}
        </div>
        
        <style>{`
          ${subjectStyles.animations.popIn}
          ${subjectStyles.animations.iconSpin}
          ${subjectStyles.animations.shineMove}
          
          .tyt-animated-card {
            position: relative;
            overflow: hidden;
          }
          
          .tyt-animated-card:hover, 
          .tyt-animated-card:focus {
            filter: brightness(1.13) saturate(1.15);
            transform: scale(1.06) rotate(-1deg);
            box-shadow: 0 12px 36px #0003, 0 0 0 4px #fff4;
            z-index: 2;
          }
          
          .tyt-animated-card:active {
            filter: brightness(1.22) saturate(1.2);
            transform: scale(0.97) rotate(1deg);
            box-shadow: 0 2px 8px #0002;
          }
          
          .tyt-animated-card:hover .tyt-animated-icon {
            animation: tyt-icon-spin 0.7s cubic-bezier(.39,.575,.56,1.000);
          }
          
          .tyt-shine {
            content: '';
            position: absolute;
            top: -60%;
            left: -60%;
            width: 220%;
            height: 220%;
            background: linear-gradient(120deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.01) 60%);
            transform: rotate(25deg);
            pointer-events: none;
            z-index: 1;
            animation: tyt-shine-move 2.2s linear infinite;
          }
        `}</style>
      </div>
    </div>
  );
};

export default AltKonuSelector; 