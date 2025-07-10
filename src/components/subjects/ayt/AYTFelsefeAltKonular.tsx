import React from 'react';
import { useNavigate } from 'react-router-dom';
import BackButton from '../../common/BackButton';

const felsefeAltKonular = [
  { id: 'ilk-cag-felsefesi', label: 'İlk Çağ Felsefesi', icon: '🏛️', color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
  { id: 'orta-cag-felsefesi', label: 'Orta Çağ Felsefesi', icon: '🏰', color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
  { id: 'yeni-cag-felsefesi', label: 'Yeni Çağ Felsefesi (15.-17. yy)', icon: '📜', color: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)' },
  { id: 'aydinlanma-modern-felsefe', label: 'Aydınlanma ve Modern Felsefe (18.-19. yy)', icon: '💡', color: 'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)' },
  { id: '20-yuzyil-felsefesi', label: '20. Yüzyıl Felsefesi', icon: '🤔', color: 'linear-gradient(135deg, #f953c6 0%, #b91d73 100%)' },
  { id: 'mantiga-giris', label: 'Mantığa Giriş', icon: '🧠', color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { id: 'klasik-mantik', label: 'Klasik Mantık', icon: '⚖️', color: 'linear-gradient(135deg, #43cea2 0%, #185a9d 100%)' },
  { id: 'mantik-ve-dil', label: 'Mantık ve Dil', icon: '🗣️', color: 'linear-gradient(135deg, #ff6a00 0%, #ee0979 100%)' },
  { id: 'sembolik-mantik', label: 'Sembolik Mantık', icon: '🔣', color: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' },
  { id: 'psikolojiye-giris', label: 'Psikolojiye Giriş', icon: '🧐', color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
  { id: 'temel-psikolojik-surecler', label: 'Temel Psikolojik Süreçler', icon: '⚙️', color: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)' },
  { id: 'ogrenme-bellek-dusunme', label: 'Öğrenme, Bellek ve Düşünme', icon: '📚', color: 'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)' },
  { id: 'ruh-sagligi', label: 'Ruh Sağlığı', icon: '❤️', color: 'linear-gradient(135deg, #f953c6 0%, #b91d73 100%)' },
  { id: 'sosyolojiye-giris', label: 'Sosyolojiye Giriş', icon: '👥', color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { id: 'birey-toplum', label: 'Birey ve Toplum', icon: '🧑‍🤝‍🧑', color: 'linear-gradient(135deg, #43cea2 0%, #185a9d 100%)' },
  { id: 'toplumsal-yapi-degisim', label: 'Toplumsal Yapı ve Değişim', icon: '🏗️', color: 'linear-gradient(135deg, #ff6a00 0%, #ee0979 100%)' },
  { id: 'kultur-toplumsal-kurumlar', label: 'Kültür ve Toplumsal Kurumlar', icon: '🏛️', color: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' },
];

const AYTFelsefeAltKonular: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="container">
      <div className="header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <BackButton 
          variant="gradient"
          color="secondary"
          size="medium"
          text="Geri Dön"
          showIcon={true}
          style={{ marginRight: '18px' }}
        />
        <h1 style={{ flex: 1, textAlign: 'center', margin: 0 }}>AYT Felsefe - Alt Konular</h1>
        <div style={{ width: 120 }} />
      </div>
      <div className="card" style={{ background: 'linear-gradient(120deg, #e0e7ff 0%, #f8fafc 100%)', boxShadow: '0 8px 40px #43e97b22' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h2 style={{ color: '#43e97b', fontWeight: 800, fontSize: 28, letterSpacing: 1 }}>💭 Hangi alt konuyu seçmek istersin?</h2>
          <p style={{ color: '#555', fontSize: 16, marginTop: 8 }}>Her alt konuda özgün sorular seni bekliyor!</p>
        </div>
        <div className="category-grid" style={{ margin: '40px 0 20px 0' }}>
          {felsefeAltKonular.map((subj, i) => (
            <div
              key={subj.id}
              className="category-card tyt-animated-card"
              onClick={() => navigate(`/ayt-felsefe/${subj.id}`)}
              style={{
                background: subj.color,
                color: 'white',
                fontWeight: 700,
                cursor: 'pointer',
                userSelect: 'none',
                minHeight: 110,
                height: 110,
                width: 220,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                boxShadow: '0 4px 24px #0002',
                border: 'none',
                transition: 'transform 0.18s, box-shadow 0.18s, filter 0.18s',
                animation: `popIn 0.5s cubic-bezier(.39,.575,.56,1.000) ${(i * 0.07).toFixed(2)}s both`,
                textAlign: 'center',
                padding: '0 8px'
              }}
              tabIndex={0}
              onKeyDown={e => { if (e.key === 'Enter') navigate(`/ayt-felsefe/${subj.id}`); }}
            >
              <div className="tyt-animated-icon" style={{ fontSize: 32, marginBottom: 10, filter: 'drop-shadow(0 2px 8px #fff8)' }}>{subj.icon}</div>
              {subj.label}
              <span className="tyt-shine" />
            </div>
          ))}
        </div>
        <style>{`
          @keyframes popIn {
            0% { opacity: 0; transform: scale(0.7) translateY(30px); }
            100% { opacity: 1; transform: scale(1) translateY(0); }
          }
          .category-grid {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 20px;
          }
          .tyt-animated-card {
            position: relative;
            overflow: hidden;
          }
          .tyt-animated-card:hover, .tyt-animated-card:focus {
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
          @keyframes tyt-icon-spin {
            0% { transform: rotate(0deg) scale(1); }
            60% { transform: rotate(18deg) scale(1.18); }
            100% { transform: rotate(0deg) scale(1); }
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
          @keyframes tyt-shine-move {
            0% { left: -60%; top: -60%; }
            100% { left: 100%; top: 100%; }
          }
        `}</style>
      </div>
    </div>
  );
};

export default AYTFelsefeAltKonular; 