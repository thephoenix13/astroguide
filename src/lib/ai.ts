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

export function generatePalmReadingInterpretation(measurements: {
  lifeLineLength: number;
  heartLineLength: number;
  headLineLength: number;
  fateLinePresent: boolean;
  sunLinePresent: boolean;
  palmWidth: number;
  fingerLength: number;
  fingerSpacing: number;
  lineClarity: number;
  classifications: Record<string, string>;
}): string {
  const c = measurements.classifications;
  
  let interpretation = "✋ **Vedic Palm Reading (Hasta Samudrika Shastra)**\n\n";
  interpretation += "Based on the analysis of your palm:\n\n";

  // Life Line
  interpretation += `**Life Line (${c.lifeLine || 'moderate'}):** `;
  if (c.lifeLine === 'long') {
    interpretation += "A long, well-defined life line indicates robust vitality, stamina, and a zest for life. You have strong immunity and the energy to pursue your passions fully.\n\n";
  } else if (c.lifeLine === 'short') {
    interpretation += "A shorter life line doesn't mean short life — it indicates intense, focused living. You make the most of every moment and adapt quickly to change.\n\n";
  } else {
    interpretation += "A moderate life line shows balanced vitality and a steady approach to life's journey. You maintain consistent energy levels.\n\n";
  }

  // Heart Line
  interpretation += `**Heart Line (${c.heartLine || 'moderate'}):** `;
  if (c.heartLine === 'long') {
    interpretation += "A long heart line reveals a deeply emotional and compassionate nature. You give love freely and form meaningful connections. Your emotional world is rich and expansive.\n\n";
  } else if (c.heartLine === 'short') {
    interpretation += "A shorter heart line suggests you express love through actions rather than words. You're practical in relationships and value quality over quantity in connections.\n\n";
  } else {
    interpretation += "A balanced heart line shows emotional stability. You give and receive love in healthy measure, maintaining good boundaries.\n\n";
  }

  // Head Line
  interpretation += `**Head Line (${c.headLine || 'moderate'}):** `;
  if (c.headLine === 'long') {
    interpretation += "A long head line indicates analytical depth and careful thinking. You consider all angles before making decisions and have strong mental endurance.\n\n";
  } else if (c.headLine === 'short') {
    interpretation += "A shorter head line suggests quick, decisive thinking. You're practical, action-oriented, and prefer to learn through experience rather than over-analysis.\n\n";
  } else {
    interpretation += "A balanced head line shows a healthy mix of analytical and intuitive thinking. You can be both thoughtful and decisive as situations require.\n\n";
  }

  // Fate Line
  interpretation += `**Fate Line:** `;
  if (measurements.fateLinePresent) {
    interpretation += `A visible fate line (${c.fateLine || 'clear'}) suggests a strong sense of purpose and direction. You likely feel guided by destiny and have clear life goals.\n\n`;
  } else {
    interpretation += "No prominent fate line indicates you're a self-determined soul who creates your own path. You're not bound by predetermined destiny — you forge your way through free will.\n\n";
  }

  // Sun Line
  if (measurements.sunLinePresent) {
    interpretation += `**Sun Line:** Present and ${c.sunLine || 'visible'} — this indicates potential for fame, recognition, and creative success. Your talents are likely to be recognized by others.\n\n`;
  }

  // Palm Shape
  interpretation += `**Palm Shape (${c.palmShape || 'balanced'}):** `;
  if (c.palmShape === 'square') {
    interpretation += "A square palm indicates practical, grounded nature. You're reliable, methodical, and excel in material matters.\n\n";
  } else if (c.palmShape === 'rectangular') {
    interpretation += "A rectangular palm suggests an active, energetic personality. You're ambitious and thrive when busy with multiple pursuits.\n\n";
  } else {
    interpretation += "A balanced palm shape shows adaptability and versatility. You can handle both practical and creative challenges.\n\n";
  }

  // Finger Length
  interpretation += `**Fingers (${c.fingers || 'medium'}):** `;
  if (c.fingers === 'long') {
    interpretation += "Long fingers indicate attention to detail, patience, and meticulous nature. You excel in work requiring precision.\n\n";
  } else if (c.fingers === 'short') {
    interpretation += "Shorter fingers suggest quick action, impulsiveness, and a hands-on approach. You prefer doing over planning.\n\n";
  } else {
    interpretation += "Medium-length fingers show a good balance between planning and action.\n\n";
  }

  // Line Clarity
  interpretation += `**Line Clarity (${c.clarity || 'moderate'}):** `;
  if (c.clarity === 'clear') {
    interpretation += "Clear, well-defined lines indicate mental clarity and focused intentions. You know what you want and pursue it with determination.\n\n";
  } else if (c.clarity === 'faint') {
    interpretation += "Lighter lines suggest a sensitive, intuitive nature. You're open to subtle energies and may have strong psychic abilities.\n\n";
  } else {
    interpretation += "Moderately clear lines show a balanced mind that's open yet focused.\n\n";
  }

  // Overall Summary
  interpretation += `\n**Overall Reading:** Your palm reveals a personality that combines ${
    c.lifeLine === 'long' ? 'strong vitality' : 'adaptable energy'
  } with ${
    c.heartLine === 'long' ? 'deep emotional capacity' : 'practical love expression'
  } and ${
    c.headLine === 'long' ? 'analytical depth' : 'quick decisive thinking'
  }. ${
    measurements.fateLinePresent
      ? 'Your visible fate line suggests you are aligned with your life purpose.'
      : 'Your self-determined path means you have the freedom to create your own destiny.'
  }\n\n`;

  interpretation += "_This reading is based on traditional Hasta Samudrika Shastra principles. Palm lines can change over time as you grow and evolve. Your palm reflects your current energetic state._";

  return interpretation;
}
