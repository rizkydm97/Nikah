/* Tema bergambar (Tema 3–8): data cover, "film" pembuka, dan efek hidup per tema.
   Semua koordinat memakai ukuran gambar dasar 784 x 1168 px (gambar sebenarnya 2x). */
(function () {
  const T = '/assets/t/', S = T + 'spr/';
  window.PIC_THEMES = {
    bali: {
      name: 'Nusantara — Candi Bali', base: 'jawa', pal: 'champagne', dark: false,
      btn: [196, 933, 592, 1040, 50], title: [160, 112, 618, 388], namesY: 405, guestY: 900,
      text: '#7a4a12', glowText: 'rgba(255,240,205,.95)',
      wf: [[641, 630, 60, 200]], mist: [[560, 770, 190, 110], [250, 430, 330, 110, 1]], water: [[300, 800, 300, 130], [330, 1040, 260, 80]],
      glow: [[650, 330, 170, 'rgba(255,236,190,.55)']], clouds: ['cloudw1', 'cloudw2', 'cloudw3'], cloudBand: [120, 330],
      birds: 'bird_gold', bf: ['bf_bali1', 'bf_bali2'], petals: ['frangi1', 'frangi2', 'leafm'], sparkle: 0, flies: 0,
      shots: [[668, 735, 2.3, 1900, 500], [380, 690, 2.1, 1600, 300], [505, 575, 2.4, 1500, 700, 'birds'], ['end', 2400, 0, 'bf']],
    },
    princess: {
      name: 'Princess — Kastil Mawar', base: 'rose', pal: 'pink', dark: false,
      btn: [185, 918, 605, 1066, 40], title: [222, 132, 572, 388], namesY: 398, guestY: 878,
      text: '#9b5a2a', glowText: 'rgba(255,240,246,.95)',
      wf: [], mist: [[360, 560, 300, 90, 1]], water: [],
      glow: [[520, 470, 190, 'rgba(255,214,236,.55)'], [680, 690, 90, 'rgba(255,236,200,.6)']], clouds: ['cloudp1', 'cloudp2', 'cloudp3'], cloudBand: [140, 360],
      birds: 'dove1', bf: ['bf_pink1', 'bf_pink2'], petals: ['rose1', 'rose2'], sparkle: 26, flies: 0, carriage: 1,
      shots: [[452, 662, 2.3, 1900, 500], [672, 690, 2.3, 1500, 450, 'birds'], [515, 445, 2.0, 1600, 650], ['end', 2300, 0, 'bf']],
    },
    emas: {
      name: 'Jawa Emas — Senja', base: 'jawa', pal: 'champagne', dark: true,
      btn: [190, 948, 598, 1058, 52], title: [195, 108, 595, 314], namesY: 372, guestY: 915,
      text: '#f6dd9a', glowText: 'rgba(60,30,5,.85)',
      wf: [[601, 508, 62, 195]], mist: [[555, 670, 170, 100], [150, 440, 520, 130, 1], [330, 860, 260, 80, 1]], water: [[380, 780, 210, 170]],
      glow: [[650, 410, 140, 'rgba(255,224,140,.75)']], rays: [650, 410], clouds: [], cloudBand: [330, 400],
      birds: 'bird_gold', bf: ['bf_gold', 'bf_gold2'], petals: ['frangi1', 'leafm'], sparkle: 10, flies: [520, 690, 760, 900],
      shots: [[560, 425, 1.9, 1700, 400, 'birds'], [632, 610, 2.4, 1600, 500], [650, 760, 2.3, 1400, 450], [360, 600, 2.0, 1500, 350], ['end', 2300, 0, 'bf']],
    },
    biru: {
      name: 'Biru — Air Terjun Malam', base: 'jawa', pal: 'blue', dark: true,
      btn: [155, 730, 640, 955, 60], title: [170, 160, 612, 474], namesY: 485, guestY: 690,
      text: '#eef3ff', glowText: 'rgba(20,40,90,.9)',
      wf: [[345, 545, 115, 150], [470, 515, 130, 185]], mist: [[320, 640, 320, 100], [80, 450, 600, 120, 1]], water: [[120, 690, 550, 300], [60, 960, 670, 120]],
      glow: [], clouds: ['cloudb'], cloudBand: [90, 200],
      birds: '', bf: ['bf_silver', 'bf_gold'], petals: ['frangi1'], sparkle: 34, flies: 0,
      shots: [[525, 560, 2.4, 2000, 550], [400, 600, 2.5, 1400, 450], [662, 620, 2.4, 1400, 450, 'bf'], ['end', 2300]],
    },
    rimba: {
      name: 'Kerajaan Rimba Bulan', base: 'jawa', pal: 'blue', dark: true,
      btn: [145, 940, 640, 1072, 52], title: [140, 50, 645, 272], namesY: 342, guestY: 905,
      text: '#f5d98c', glowText: 'rgba(0,10,30,.9)',
      wf: [[314, 470, 24, 185], [482, 540, 24, 185]], mist: [[300, 690, 300, 90], [240, 600, 360, 80, 1]], water: [[330, 760, 240, 140]],
      glow: [[475, 385, 120, 'rgba(210,230,255,.55)'], [265, 680, 60, 'rgba(255,214,120,.8)']], clouds: ['cloudb'], cloudBand: [330, 420],
      birds: '', bf: ['bf_blue1', 'bf_blue2', 'bf_gold'], petals: [], sparkle: 30, flies: [60, 300, 720, 1000],
      shots: [[475, 395, 2.4, 1800, 600], [312, 510, 2.2, 1500, 300], [500, 615, 2.1, 1400, 300], [450, 700, 2.4, 1300, 300], [264, 690, 2.6, 1400, 500, 'bf'], ['end', 2200]],
    },
    klasik: {
      name: 'Jawa Klasik — Joglo & Candi', base: 'jawa', pal: 'maroon', dark: true,
      btn: [180, 860, 612, 980, 52], title: [185, 132, 597, 378], namesY: 412, guestY: 800,
      text: '#f2d391', glowText: 'rgba(30,15,3,.9)',
      wf: [[541, 508, 58, 250]], mist: [[470, 720, 160, 70], [120, 430, 560, 110, 1]], water: [[460, 735, 150, 60]],
      glow: [[410, 625, 120, 'rgba(255,200,110,.75)'], [200, 420, 160, 'rgba(255,214,140,.35)']], lamp: 1, clouds: [], cloudBand: [0, 0],
      birds: 'svg', bf: ['bf_bali1', 'bf_gold'], petals: ['leafm', 'frangi1'], sparkle: 8, flies: [250, 560, 560, 760], gunungan: 1,
      shots: [[185, 485, 2.3, 1800, 400, 'birds'], [400, 595, 2.4, 1500, 650], [565, 640, 2.4, 1400, 400], [690, 530, 2.0, 1300, 300], ['end', 2300, 0, 'bf']],
    },
  };
  for (const k in window.PIC_THEMES) {
    const t = window.PIC_THEMES[k];
    t.cover = T + k + '/cover.webp'; t.world = T + k + '/world.webp'; t.bg = T + k + '/bg.webp'; t.spr = S;
    const d = T + k + '/';
    t.deco = { floralTop: d + 'fl-top.webp', floralBottom: d + 'fl-bottom.webp', frameArc: d + 'frame-arc.webp', frameSide: d + 'frame-side.webp', flowers: d + 'bouquet.webp', ornament: d + 'orn.webp' };
    t.divider = d + 'divider.webp'; t.motif = k === 'biru' ? '' : d + 'motif.webp';
  }
})();
