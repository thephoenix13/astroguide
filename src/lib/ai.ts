import { UserProfile, LifeEvent, BirthChart } from '../types';

// Mock AI responses that simulate Claude's astrology expertise
// In production, this would call the Anthropic API

const RESPONSE_TEMPLATES = {
  greeting: [
    "Namaste! I'm here to guide you on your cosmic journey. How can I help you today?",
    "Welcome back! The stars have much to share. What's on your mind?",
    "Hello! Your chart holds many insights. What would you like to explore?"
  ],
  career: [
    "Based on your chart, this period favors career growth. Your {mahadasha} Mahadasha supports professional advancement. I'd suggest paying attention to opportunities that arise in the next few weeks. Would you like me to make a specific prediction you can track?",
    "Your {lagna} Lagna gives you natural leadership abilities. With current transits activating your career house, this is a favorable time for professional moves. Consider documenting any intuitive insights about your career direction.",
    "The planetary positions suggest a period of skill-building before a breakthrough. Your {moon_sign} Moon gives you emotional resilience during career transitions. I notice you've been through {recent_events}. How do you feel these experiences shaped your professional path?"
  ],
  relationships: [
    "Your Venus placement in {venus_sign} shapes how you express love. Currently, the 7th house is being activated, which often brings relationship developments. I'd suggest staying open and patient. Shall I note a prediction about this?",
    "With your {moon_sign} Moon, you seek emotional depth in relationships. The current Dasha period supports meaningful connections. Remember what you shared about {recent_events} — those experiences inform what you truly need in a partner.",
    "Your chart shows a beautiful balance between independence and partnership needs. The transiting planets suggest a period of relationship clarity ahead. Trust the process."
  ],
  health: [
    "Your 6th house activation suggests paying attention to daily health routines. With {saturn_status}, discipline in health matters will serve you well. Small consistent habits create big changes.",
    "Your chart indicates strong vitality overall. The current transit favors establishing better sleep and nutrition patterns. Your {moon_sign} Moon benefits from emotional calm for physical wellbeing.",
    "This is a good time for preventive health measures. Your Ascendant lord {lagna_lord} supports building strong foundations. Consider what wellness practices align with your nature."
  ],
  general: [
    "Your chart reveals a fascinating interplay of energies. The current Mahadasha of {mahadasha} combined with Antardasha of {antardasha} creates a unique window for growth. What specific area would you like to explore deeper?",
    "I see your life events show a pattern of {pattern}. This aligns beautifully with your planetary periods. The universe is guiding you toward {direction}. Trust this journey.",
    "Based on your birth chart and life experiences, you're in a transformative phase. The cosmic energies support {theme}. Would you like me to elaborate on any specific area?"
  ]
};

export function generateAIResponse(
  userMessage: string,
  profile: UserProfile,
  chart: BirthChart,
  lifeEvents: LifeEvent[]
): { text: string; hasPrediction: boolean; predictionText?: string } {
  const msg = userMessage.toLowerCase();
  
  // Determine topic
  let topic: keyof typeof RESPONSE_TEMPLATES = 'general';
  if (msg.includes('career') || msg.includes('job') || msg.includes('work') || msg.includes('business') || msg.includes('profession')) {
    topic = 'career';
  } else if (msg.includes('love') || msg.includes('relationship') || msg.includes('marriage') || msg.includes('partner') || msg.includes('dating')) {
    topic = 'relationships';
  } else if (msg.includes('health') || msg.includes('wellness') || msg.includes('fitness') || msg.includes('sleep') || msg.includes('diet')) {
    topic = 'health';
  } else if (msg.includes('hello') || msg.includes('hi') || msg.includes('namaste') || msg.includes('hey')) {
    topic = 'greeting';
  }
  
  // Build response with chart data
  const recentEvents = lifeEvents.slice(-3).map(e => e.title).join(', ') || 'your recent life changes';
  const pattern = lifeEvents.length > 2 ? 'growth through challenges' : 'new beginnings';
  const direction = 'your highest potential';
  
  let response = '';
  let hasPrediction = false;
  let predictionText = '';
  
  const templates = RESPONSE_TEMPLATES[topic];
  const template = templates[Math.floor(Math.random() * templates.length)];
  
  response = template
    .replace('{mahadasha}', chart.mahadasha.planet)
    .replace('{antardasha}', chart.antardasha.planet)
    .replace('{lagna}', chart.lagna.sign)
    .replace('{moon_sign}', chart.planets.find(p => p.planet === 'Moon')?.sign || 'your')
    .replace('{venus_sign}', chart.planets.find(p => p.planet === 'Venus')?.sign || 'your')
    .replace('{lagna_lord}', chart.lagna.lord)
    .replace('{saturn_status}', chart.sadeSati.active ? 'Sade Sati active' : 'favorable Saturn transit')
    .replace('{recent_events}', recentEvents)
    .replace('{pattern}', pattern)
    .replace('{direction}', direction)
    .replace('{theme}', topic === 'general' ? 'integration of your experiences' : `${topic} evolution`);
  
  // Add prediction for certain topics
  if (topic === 'career' || topic === 'relationships') {
    hasPrediction = true;
    if (topic === 'career') {
      predictionText = `You may receive a significant career opportunity or recognition within the next 2-3 weeks, particularly related to ${chart.planets.find(p => p.planet === 'Mercury')?.sign || 'communication'} energies.`;
    } else {
      predictionText = `A meaningful relationship connection or deepening of an existing bond is likely within the next month, especially around the time of the next New Moon.`;
    }
    response += `\n\n🔮 *Prediction:* ${predictionText}\n\n_(You can log this prediction to track its accuracy later.)_`;
  }
  
  // Add life event reference if relevant
  if (lifeEvents.length > 0 && topic !== 'greeting') {
    const relevantEvent = lifeEvents[lifeEvents.length - 1];
    response += `\n\nI remember you shared about "${relevantEvent.title}" — this aligns with what the current planetary period is highlighting for you.`;
  }
  
  return { text: response, hasPrediction, predictionText };
}

export function generateFaceReadingInterpretation(measurements: {
  foreheadWidth: number;
  eyeDistance: number;
  noseLength: number;
  chinWidth: number;
  faceLength: number;
  jawAngle: number;
  classifications: Record<string, string>;
}): string {
  const c = measurements.classifications;
  
  let interpretation = "🔮 **Vedic Face Reading (Mukha Shastra)**\n\n";
  interpretation += "Based on the analysis of your facial structure:\n\n";
  
  interpretation += `**Forehead (${c.forehead || 'moderate'}):** `;
  if (c.forehead === 'broad') {
    interpretation += "A broad forehead indicates strong intellectual capacity, good memory, and early success in life. You likely have a philosophical bent of mind.\n\n";
  } else if (c.forehead === 'narrow') {
    interpretation += "A focused forehead suggests concentrated thinking ability and practical intelligence. You excel at detailed work.\n\n";
  } else {
    interpretation += "A balanced forehead indicates a well-rounded intellect with both practical and philosophical capabilities.\n\n";
  }
  
  interpretation += `**Eyes (${c.eyes || 'medium'}):** `;
  if (c.eyes === 'wide-set') {
    interpretation += "Wide-set eyes suggest an expansive, tolerant nature with strong empathy. You see the bigger picture and value freedom.\n\n";
  } else if (c.eyes === 'close-set') {
    interpretation += "Close-set eyes indicate intense focus and determination. You have the ability to concentrate deeply on goals.\n\n";
  } else {
    interpretation += "Balanced eye spacing shows a harmonious blend of focus and openness. You can attend to detail while maintaining perspective.\n\n";
  }
  
  interpretation += `**Nose (${c.nose || 'medium'}):** `;
  if (c.nose === 'prominent') {
    interpretation += "A prominent nose indicates strong willpower, leadership qualities, and financial acumen. You have the drive to achieve your goals.\n\n";
  } else if (c.nose === 'small') {
    interpretation += "A delicate nose suggests refinement, artistic sensibility, and cooperative nature. You prefer harmony over confrontation.\n\n";
  } else {
    interpretation += "A balanced nose shows steady determination and practical approach to life's challenges.\n\n";
  }
  
  interpretation += `**Chin & Jaw (${c.chin || 'moderate'}):** `;
  if (c.chin === 'strong') {
    interpretation += "A strong jaw indicates determination, resilience, and the ability to persevere through challenges. You have strong physical vitality.\n\n";
  } else if (c.chin === 'soft') {
    interpretation += "A softer jaw suggests gentleness, adaptability, and diplomatic nature. You handle conflicts with grace.\n\n";
  } else {
    interpretation += "A balanced jaw shows a good mix of determination and flexibility.\n\n";
  }
  
  interpretation += `\n**Overall Impression:** Your facial structure suggests a personality that combines ${
    c.forehead === 'broad' ? 'intellectual depth' : 'practical wisdom'
  } with ${
    c.eyes === 'wide-set' ? 'empathetic understanding' : 'focused determination'
  }. In Vedic tradition, these features indicate someone who ${
    c.chin === 'strong' ? 'has the strength to manifest their visions into reality' : 'navigates life with grace and adaptability'
  }.\n\n`;
  
  interpretation += "_This reading is based on traditional Mukha Shastra principles applied to your measured facial proportions. Remember, your true nature transcends any physical measurement._";
  
  return interpretation;
}
