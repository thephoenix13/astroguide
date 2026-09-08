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
  
  // Get natal positions
  const natalMoonSign = chart.planets.find(p => p.planet === 'Moon')?.sign || 'Aries';
  const natalSunSign = chart.planets.find(p => p.planet === 'Sun')?.sign || 'Aries';
  const lagnaSign = chart.lagna.sign;
  const mahadashaPlanet = chart.mahadasha.planet;
  
  // Current transit
  const seed = dayOfYear + hashStr(chart.lagna.sign);
  const transitingMoonSign = SIGNS[seed % 12];
  const transitingHouse = ((seed % 12) - SIGNS.indexOf(chart.lagna.sign) + 12) % 12 + 1;
  
  const doList: string[] = [];
  const avoidList: string[] = [];
  
  // === COLOR RECOMMENDATIONS ===
  const planetColors: Record<string, { favorable: string[]; avoid: string[] }> = {
    'Sun': { favorable: ['gold', 'orange', 'copper'], avoid: ['black', 'dark blue'] },
    'Moon': { favorable: ['white', 'silver', 'light blue'], avoid: ['red', 'dark red'] },
    'Mars': { favorable: ['red', 'coral', 'orange'], avoid: ['white', 'pastel colors'] },
    'Mercury': { favorable: ['green', 'light green', 'emerald'], avoid: ['red', 'dark red'] },
    'Jupiter': { favorable: ['yellow', 'gold', 'saffron'], avoid: ['black', 'dark blue'] },
    'Venus': { favorable: ['white', 'pink', 'pastel colors'], avoid: ['yellow', 'red'] },
    'Saturn': { favorable: ['blue', 'dark blue', 'black'], avoid: ['red', 'orange'] },
    'Rahu': { favorable: ['smoky grey', 'blue', 'black'], avoid: ['yellow', 'white'] },
    'Ketu': { favorable: ['grey', 'multi-color', 'earth tones'], avoid: ['bright colors'] }
  };
  
  // Determine ruling planet of the day
  const dayRuler = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'][dayOfWeek];
  const dayColors = planetColors[dayRuler];
  
  doList.push(`Wear ${dayColors.favorable[0]} or ${dayColors.favorable[1]} colored clothes today`);
  avoidList.push(`Avoid wearing ${dayColors.avoid[0]} or ${dayColors.avoid[1]} today`);
  
  // === FOOD RECOMMENDATIONS ===
  const moonSignFoods: Record<string, { eat: string[]; avoid: string[] }> = {
    'Aries': { eat: ['spicy foods', 'pulses', 'red lentils'], avoid: ['excessive sour foods', 'stale food'] },
    'Taurus': { eat: ['sweet fruits', 'dairy products', 'rice'], avoid: ['bitter foods', 'excessive salt'] },
    'Gemini': { eat: ['green vegetables', 'fruits', 'light meals'], avoid: ['heavy oily foods', 'meat'] },
    'Cancer': { eat: ['milk', 'rice', 'sweet fruits', 'coconut'], avoid: ['sour foods', 'fermented items'] },
    'Leo': { eat: ['wheat', 'jaggery', 'green vegetables'], avoid: ['non-veg', 'excessive salt'] },
    'Virgo': { eat: ['green leafy vegetables', 'fruits', 'light grains'], avoid: ['sour curd', 'stale food'] },
    'Libra': { eat: ['sweet foods', 'fruits', 'butter'], avoid: ['sour items', 'excessive spices'] },
    'Scorpio': { eat: ['bitter foods', 'root vegetables', 'pulses'], avoid: ['sweet foods', 'excessive dairy'] },
    'Sagittarius': { eat: ['chickpeas', 'turmeric', 'fruits'], avoid: ['sour foods', 'non-veg'] },
    'Capricorn': { eat: ['sesame', 'oil seeds', 'root vegetables'], avoid: ['excessive sweets', 'dairy'] },
    'Aquarius': { eat: ['light foods', 'fruits', 'green tea'], avoid: ['heavy oily foods', 'meat'] },
    'Pisces': { eat: ['rice', 'milk', 'sweet fruits', 'honey'], avoid: ['non-veg', 'excessive spices'] }
  };
  
  const moonFoodRec = moonSignFoods[natalMoonSign];
  doList.push(`Eat ${moonFoodRec.eat[0]} and ${moonFoodRec.eat[1]} today`);
  avoidList.push(`Avoid ${moonFoodRec.avoid[0]} and ${moonFoodRec.avoid[1]}`);
  
  // === DIRECTION RECOMMENDATIONS ===
  const favorableDirections: Record<string, string[]> = {
    'Sun': ['East', 'South-East'],
    'Moon': ['North-West', 'North'],
    'Mars': ['South', 'South-East'],
    'Mercury': ['North', 'North-West'],
    'Jupiter': ['North-East', 'East'],
    'Venus': ['South-East', 'South'],
    'Saturn': ['West', 'South-West'],
    'Rahu': ['South-West', 'North-West'],
    'Ketu': ['South-West', 'North-East']
  };
  
  const favorableDir = favorableDirections[dayRuler];
  doList.push(`Face ${favorableDir[0]} or ${favorableDir[1]} direction for important tasks`);
  
  const avoidDirections: Record<string, string[]> = {
    'Sun': ['West', 'North'],
    'Moon': ['South', 'South-East'],
    'Mars': ['North', 'North-West'],
    'Mercury': ['South', 'South-West'],
    'Jupiter': ['West', 'South-West'],
    'Venus': ['North', 'North-West'],
    'Saturn': ['East', 'North-East'],
    'Rahu': ['North-East', 'East'],
    'Ketu': ['North', 'East']
  };
  
  const avoidDir = avoidDirections[dayRuler];
  avoidList.push(`Avoid traveling in ${avoidDir[0]} or ${avoidDir[1]} direction today`);
  
  // === ACTIVITY RECOMMENDATIONS ===
  if (transitingHouse === 1 || transitingHouse === 5 || transitingHouse === 9) {
    doList.push('Good day for meditation, spiritual practices, or starting new ventures');
  }
  if (transitingHouse === 2 || transitingHouse === 11) {
    doList.push('Favorable for financial matters, banking, or investments');
  }
  if (transitingHouse === 3 || transitingHouse === 10) {
    doList.push('Take action on career goals, make important calls or meetings');
  }
  if (transitingHouse === 4 || transitingHouse === 7) {
    doList.push('Spend time with family, resolve relationship matters');
  }
  if (transitingHouse === 6) {
    doList.push('Focus on health routines, exercise, or service activities');
  }
  if (transitingHouse === 8 || transitingHouse === 12) {
    doList.push('Practice meditation, avoid major decisions, rest and reflect');
  }
  
  // Mahadasha-specific
  if (mahadashaPlanet === 'Jupiter') {
    doList.push('Offer yellow flowers or turmeric to deity/temple');
  } else if (mahadashaPlanet === 'Saturn') {
    doList.push('Feed black dogs or crows, or donate black items');
  } else if (mahadashaPlanet === 'Mars') {
    doList.push('Offer red flowers or hanuman chalisa recitation');
  } else if (mahadashaPlanet === 'Venus') {
    doList.push('Wear perfumes, appreciate art, or offer white flowers');
  }
  
  // === AVOID RECOMMENDATIONS ===
  if (transitingHouse === 6 || transitingHouse === 8 || transitingHouse === 12) {
    avoidList.push('Avoid signing contracts or starting new business today');
  }
  if (transitingHouse === 8) {
    avoidList.push('Avoid risky investments, gambling, or speculation');
  }
  if (transitingHouse === 12) {
    avoidList.push('Avoid unnecessary expenses or lending money');
  }
  
  // Moon sign specific avoidances
  if (natalMoonSign === 'Scorpio' || natalMoonSign === 'Capricorn') {
    avoidList.push('Avoid emotional confrontations, practice patience');
  }
  if (natalMoonSign === 'Aries' || natalMoonSign === 'Leo') {
    avoidList.push('Avoid anger triggers, don\'t be overly aggressive');
  }
  
  // Day-specific avoidances
  if (dayOfWeek === 2) { // Tuesday - Mars day
    avoidList.push('Avoid cutting hair or nails on Tuesday');
  }
  if (dayOfWeek === 6) { // Saturday - Saturn day
    avoidList.push('Avoid buying iron, oil, or black items');
  }
  if (dayOfWeek === 0) { // Sunday - Sun day
    avoidList.push('Don\'t skip breakfast, honor the Sun');
  }
  
  // Ensure we have at least 5 items each
  while (doList.length < 5) {
    doList.push('Practice gratitude and mindfulness');
  }
  while (avoidList.length < 5) {
    avoidList.push('Avoid negative thoughts and gossip');
  }
  
  return { doList: doList.slice(0, 6), avoidList: avoidList.slice(0, 6) };
}
