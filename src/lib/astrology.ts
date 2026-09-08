import { BirthChart, PlanetPosition } from '../types';

const SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
const NAKSHATRAS = ['Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'];
const PLANETS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
const SIGN_LORDS: Record<string, string> = {
  'Aries': 'Mars', 'Taurus': 'Venus', 'Gemini': 'Mercury', 'Cancer': 'Moon',
  'Leo': 'Sun', 'Virgo': 'Mercury', 'Libra': 'Venus', 'Scorpio': 'Mars',
  'Sagittarius': 'Jupiter', 'Capricorn': 'Saturn', 'Aquarius': 'Saturn', 'Pisces': 'Jupiter'
};

// Simple hash function for deterministic results based on birth data
function hashStr(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

export function computeBirthChart(birthDate: string, birthTime: string, birthPlace: string): BirthChart {
  const seed = hashStr(birthDate + birthTime + birthPlace);
  
  // Compute Lagna based on birth time
  const timeParts = birthTime.split(':');
  const hours = parseInt(timeParts[0]) || 0;
  const minutes = parseInt(timeParts[1]) || 0;
  const totalMinutes = hours * 60 + minutes;
  const lagnaIndex = Math.floor(totalMinutes / 120) % 12; // Each sign ~2 hours
  const lagnaSign = SIGNS[lagnaIndex];
  const lagnaDegree = ((seed + totalMinutes) % 3000) / 100;
  
  // Compute planet positions deterministically
  const planets: PlanetPosition[] = PLANETS.map((planet, i) => {
    const offset = (seed * (i + 1) * 7 + i * 31) % 360;
    const signIndex = Math.floor(offset / 30) % 12;
    const degree = offset % 30;
    const house = ((signIndex - lagnaIndex + 12) % 12) + 1;
    const nakshatraIndex = Math.floor((offset / (360 / 27)) % 27);
    const retrograde = (i === 5 || i === 6 || i === 7) && ((seed + i * 13) % 3 === 0);
    
    return {
      planet,
      sign: SIGNS[signIndex],
      house,
      degree: Math.round(degree * 100) / 100,
      nakshatra: NAKSHATRAS[nakshatraIndex],
      retrograde
    };
  });
  
  // Moon nakshatra
  const moonSign = planets[1].sign;
  const moonNakshatra = planets[1].nakshatra;
  
  // Simplified Vimsottari Dasha
  const dashaOrder = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];
  const birthYear = new Date(birthDate).getFullYear();
  const nakshatraLord = moonNakshatra.includes('Ashwini') || moonNakshatra.includes('Magha') || moonNakshatra.includes('Mula') ? 'Ketu' :
    moonNakshatra.includes('Bharani') || moonNakshatra.includes('Purva Phalguni') || moonNakshatra.includes('Purva Ashadha') ? 'Venus' :
    moonNakshatra.includes('Krittika') || moonNakshatra.includes('Uttara Phalguni') || moonNakshatra.includes('Uttara Ashadha') ? 'Sun' :
    moonNakshatra.includes('Rohini') || moonNakshatra.includes('Hasta') || moonNakshatra.includes('Shravana') ? 'Moon' :
    moonNakshatra.includes('Mrigashira') || moonNakshatra.includes('Chitra') || moonNakshatra.includes('Dhanishta') ? 'Mars' :
    moonNakshatra.includes('Ardra') || moonNakshatra.includes('Swati') || moonNakshatra.includes('Shatabhisha') ? 'Rahu' :
    moonNakshatra.includes('Punarvasu') || moonNakshatra.includes('Vishakha') || moonNakshatra.includes('Purva Bhadrapada') ? 'Jupiter' :
    moonNakshatra.includes('Pushya') || moonNakshatra.includes('Anuradha') || moonNakshatra.includes('Uttara Bhadrapada') ? 'Saturn' : 'Mercury';
  
  const dashaIndex = dashaOrder.indexOf(nakshatraLord);
  const dashaDurations = [7, 20, 6, 10, 7, 18, 16, 19, 17]; // years
  
  // Calculate current Mahadasha (simplified)
  let elapsed = 0;
  let currentDasha = 0;
  for (let i = 0; i < dashaOrder.length; i++) {
    const idx = (dashaIndex + i) % 9;
    elapsed += dashaDurations[idx];
    if (birthYear + elapsed > new Date().getFullYear()) {
      currentDasha = idx;
      break;
    }
  }
  
  const mahadashaPlanet = dashaOrder[(dashaIndex + currentDasha) % 9];
  const antardashaPlanet = dashaOrder[(dashaIndex + currentDasha + 1) % 9];
  
  // Sade Sati check (simplified)
  const saturnSign = planets[6].sign;
  const moonSignIndex = SIGNS.indexOf(moonSign);
  const saturnSignIndex = SIGNS.indexOf(saturnSign);
  const diff = (saturnSignIndex - moonSignIndex + 12) % 12;
  const sadeSatiActive = diff <= 1 || diff >= 11;
  
  return {
    lagna: { sign: lagnaSign, degree: lagnaDegree, lord: SIGN_LORDS[lagnaSign] },
    planets,
    moonNakshatra,
    mahadasha: { planet: mahadashaPlanet, start: `${birthYear + elapsed - dashaDurations[(dashaIndex + currentDasha) % 9]}`, end: `${birthYear + elapsed}` },
    antardasha: { planet: antardashaPlanet, start: '2024', end: '2026' },
    sadeSati: { active: sadeSatiActive, phase: sadeSatiActive ? (diff <= 1 ? 'Rising' : 'Peak') : 'Not Active' }
  };
}

export function getChartInterpretation(chart: BirthChart): string[] {
  const interpretations: string[] = [];
  
  interpretations.push(`Your Lagna (Ascendant) is ${chart.lagna.sign}, ruled by ${chart.lagna.lord}. This gives you a ${
    chart.lagna.sign === 'Aries' ? 'bold, pioneering nature with natural leadership qualities' :
    chart.lagna.sign === 'Taurus' ? 'stable, determined personality with appreciation for beauty and comfort' :
    chart.lagna.sign === 'Gemini' ? 'curious, adaptable mind with strong communication skills' :
    chart.lagna.sign === 'Cancer' ? 'nurturing, sensitive nature with deep emotional intelligence' :
    chart.lagna.sign === 'Leo' ? 'confident, creative spirit with natural charisma' :
    chart.lagna.sign === 'Virgo' ? 'analytical, detail-oriented approach with service-oriented mindset' :
    chart.lagna.sign === 'Libra' ? 'harmonious, diplomatic nature with aesthetic sensibility' :
    chart.lagna.sign === 'Scorpio' ? 'intense, transformative energy with deep investigative ability' :
    chart.lagna.sign === 'Sagittarius' ? 'optimistic, philosophical outlook with love for exploration' :
    chart.lagna.sign === 'Capricorn' ? 'disciplined, ambitious drive with strong practical sense' :
    chart.lagna.sign === 'Aquarius' ? 'innovative, humanitarian vision with independent thinking' :
    'intuitive, compassionate nature with spiritual depth'
  }.`);
  
  const moon = chart.planets.find(p => p.planet === 'Moon')!;
  interpretations.push(`Moon in ${moon.sign} (${moon.nakshatra}) shapes your emotional world. You process feelings through ${
    ['Aries', 'Leo', 'Sagittarius'].includes(moon.sign) ? 'action and enthusiasm' :
    ['Taurus', 'Virgo', 'Capricorn'].includes(moon.sign) ? 'practical stability and routine' :
    ['Gemini', 'Libra', 'Aquarius'].includes(moon.sign) ? 'intellectual understanding and social connection' :
    'emotional depth and intuitive knowing'
  }.`);
  
  interpretations.push(`Current Mahadasha of ${chart.mahadasha.planet} with Antardasha of ${chart.antardasha.planet} suggests this is a period of ${
    chart.mahadasha.planet === 'Jupiter' ? 'growth, wisdom, and expansion' :
    chart.mahadasha.planet === 'Saturn' ? 'discipline, restructuring, and karmic lessons' :
    chart.mahadasha.planet === 'Venus' ? 'relationships, creativity, and material comfort' :
    chart.mahadasha.planet === 'Sun' ? 'confidence, authority, and self-expression' :
    chart.mahadasha.planet === 'Moon' ? 'emotional fulfillment and nurturing' :
    chart.mahadasha.planet === 'Mars' ? 'courage, action, and assertive energy' :
    chart.mahadasha.planet === 'Mercury' ? 'learning, communication, and business acumen' :
    'transformation and unconventional growth'
  }.`);
  
  if (chart.sadeSati.active) {
    interpretations.push(`Sade Sati is currently active (${chart.sadeSati.phase} phase). This is a time of maturation and inner strength building. Rather than fear it, embrace the growth it offers.`);
  }
  
  return interpretations;
}

export function getDailyTransitReading(chart: BirthChart): { content: string; summary: string } {
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
  const seed = dayOfYear + hashStr(chart.lagna.sign);
  
  const transitSign = SIGNS[seed % 12];
  const house = ((seed % 12) - SIGNS.indexOf(chart.lagna.sign) + 12) % 12 + 1;
  
  const houseThemes: Record<number, string> = {
    1: 'personal identity, health, and self-presentation',
    2: 'finances, family, and speech',
    3: 'courage, communication, and short travels',
    4: 'home, mother, emotional security',
    5: 'creativity, children, intelligence',
    6: 'service, health routines, overcoming obstacles',
    7: 'partnerships, marriage, business',
    8: 'transformation, research, hidden knowledge',
    9: 'fortune, higher learning, spirituality',
    10: 'career, public image, authority',
    11: 'gains, social networks, aspirations',
    12: 'spiritual growth, foreign connections, release'
  };
  
  const themes = houseThemes[house] || 'personal growth';
  const moonPhase = today.getDate() < 15 ? 'waxing' : 'waning';
  
  const summary = `Moon transiting your ${house}${house === 1 ? 'st' : house === 2 ? 'nd' : house === 3 ? 'rd' : 'th'} house today`;
  
  const content = `🌟 Today's Cosmic Weather\n\nThe transiting Moon moves through ${transitSign}, activating your ${house}${house === 1 ? 'st' : house === 2 ? 'nd' : house === 3 ? 'rd' : 'th'} house area of ${themes}.\n\n${
    house <= 3 ? 'This is a good day for initiating new actions and personal projects. Your energy is directed inward and toward immediate goals.' :
    house <= 6 ? 'Focus on building stability and addressing practical matters. Relationships and home life benefit from your attention today.' :
    house <= 9 ? 'A day for deeper connections and meaningful exploration. Partnerships, creative expression, or spiritual practice are highlighted.' :
    'Career, aspirations, or inner transformation are in focus. Take time for reflection alongside action.'
  }\n\nWith the Moon in its ${moonPhase} phase, this is a ${moonPhase === 'waxing' ? 'good time to build and grow' : 'time to release and reflect'}.\n\n💫 Affirmation: "I align with the cosmic rhythm and trust my inner guidance."`;
  
  return { content, summary };
}

export function getDailyGuidelines(chart: BirthChart): { doList: string[]; avoidList: string[] } {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 6 = Saturday
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
  
  // Determine current planetary influences
  const seed = dayOfYear + hashStr(chart.lagna.sign);
  const moonSignIndex = seed % 12;
  const moonSign = SIGNS[moonSignIndex];
  const transitingHouse = ((moonSignIndex - SIGNS.indexOf(chart.lagna.sign) + 12) % 12) + 1;
  
  const mahadashaPlanet = chart.mahadasha.planet;
  
  // Generate DO list based on favorable transits
  const doList: string[] = [];
  
  // House-based recommendations
  if (transitingHouse === 1 || transitingHouse === 5 || transitingHouse === 9) {
    doList.push('Start new projects or initiatives');
    doList.push('Express your creativity');
  }
  if (transitingHouse === 2 || transitingHouse === 11) {
    doList.push('Review finances and investments');
    doList.push('Network with beneficial contacts');
  }
  if (transitingHouse === 3 || transitingHouse === 10) {
    doList.push('Communicate important ideas');
    doList.push('Take bold action on goals');
  }
  if (transitingHouse === 4 || transitingHouse === 7) {
    doList.push('Spend quality time with family/partner');
    doList.push('Nurture your home environment');
  }
  if (transitingHouse === 6) {
    doList.push('Focus on health routines');
    doList.push('Organize your workspace');
  }
  if (transitingHouse === 8 || transitingHouse === 12) {
    doList.push('Meditate or practice mindfulness');
    doList.push('Reflect on deeper life questions');
  }
  if (transitingHouse === 9) {
    doList.push('Study or learn something new');
    doList.push('Connect with mentors or teachers');
  }
  
  // Mahadasha-based recommendations
  if (mahadashaPlanet === 'Jupiter') {
    doList.push('Seek wisdom and expand knowledge');
    doList.push('Practice generosity');
  } else if (mahadashaPlanet === 'Venus') {
    doList.push('Appreciate beauty and art');
    doList.push('Strengthen relationships');
  } else if (mahadashaPlanet === 'Saturn') {
    doList.push('Maintain discipline and structure');
    doList.push('Work steadily toward long-term goals');
  } else if (mahadashaPlanet === 'Mars') {
    doList.push('Take decisive action');
    doList.push('Channel energy into physical activity');
  } else if (mahadashaPlanet === 'Mercury') {
    doList.push('Write, speak, or learn');
    doList.push('Organize information and plans');
  }
  
  // Day of week recommendations (Vedic astrology)
  if (dayOfWeek === 0) doList.push('Honor the Sun: set intentions for the week');
  if (dayOfWeek === 1) doList.push('Moon day: focus on emotions and intuition');
  if (dayOfWeek === 2) doList.push('Mars day: take courageous action');
  if (dayOfWeek === 3) doList.push('Mercury day: learn and communicate');
  if (dayOfWeek === 4) doList.push('Jupiter day: seek wisdom and teach');
  if (dayOfWeek === 5) doList.push('Venus day: create beauty and harmony');
  if (dayOfWeek === 6) doList.push('Saturn day: practice discipline and service');
  
  // Ensure at least 3 items
  if (doList.length < 3) {
    doList.push('Stay present and mindful');
    doList.push('Practice gratitude');
  }
  
  // Generate AVOID list based on challenging transits
  const avoidList: string[] = [];
  
  // House-based avoidances
  if (transitingHouse === 6 || transitingHouse === 8 || transitingHouse === 12) {
    avoidList.push('Avoid starting major new ventures');
    avoidList.push('Don\'t ignore health or wellness signals');
  }
  if (transitingHouse === 12) {
    avoidList.push('Avoid excessive socializing');
    avoidList.push('Don\'t make impulsive financial decisions');
  }
  if (transitingHouse === 8) {
    avoidList.push('Avoid risky investments or speculation');
    avoidList.push('Don\'t resist necessary changes');
  }
  if (transitingHouse === 6) {
    avoidList.push('Avoid conflicts and arguments');
    avoidList.push('Don\'t neglect daily responsibilities');
  }
  
  // Moon sign considerations
  if (moonSign === 'Scorpio' || moonSign === 'Capricorn') {
    avoidList.push('Avoid emotional intensity and brooding');
  }
  if (moonSign === 'Aries' || moonSign === 'Leo') {
    avoidList.push('Don\'t be overly aggressive or domineering');
  }
  if (moonSign === 'Cancer' || moonSign === 'Pisces') {
    avoidList.push('Avoid excessive emotional reactivity');
  }
  
  // Mahadasha-based avoidances
  if (mahadashaPlanet === 'Saturn') {
    avoidList.push('Don\'t cut corners or take shortcuts');
    avoidList.push('Avoid procrastination');
  } else if (mahadashaPlanet === 'Mars') {
    avoidList.push('Don\'t act impulsively or aggressively');
    avoidList.push('Avoid unnecessary conflicts');
  } else if (mahadashaPlanet === 'Rahu') {
    avoidList.push('Don\'t chase illusions or unrealistic goals');
    avoidList.push('Avoid addictive behaviors');
  }
  
  // Ensure at least 3 items
  if (avoidList.length < 3) {
    avoidList.push('Don\'t ignore your intuition');
    avoidList.push('Avoid negative self-talk');
  }
  
  return { doList: doList.slice(0, 5), avoidList: avoidList.slice(0, 5) };
}
