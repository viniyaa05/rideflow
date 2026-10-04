/**
 * FlowBot AI Dynamic Mobility Intelligence Engine
 * Contextual Multi-Lingual NLP assistant for multi-modal transit across Tamil Nadu corridors.
 * Supports: English (en), தமிழ் - Tamil (ta), हिंदी - Hindi (hi)
 */

import { estimateRoute, getRouteComparison } from './fareEstimator.js';
import { calculateGstBreakdown } from './surgePricing.js';

export function processFlowBotQuery(queryText = '', context = { lang: 'en', user: null, carpools: [], rentals: [], drivers: [], activeBookings: [] }) {
  const query = queryText.toLowerCase().trim();
  const lang = context.lang || 'en';

  // 1. Emergency SOS
  if (query.includes('sos') || query.includes('emergency') || query.includes('help') || query.includes('police') || query.includes('ஆபத்து') || query.includes('உதவி') || query.includes('मदद') || query.includes('आपात')) {
    if (lang === 'ta') {
      return {
        reply: "🚨 **அவசர உதவி நெறிமுறை (SOS Protocol) தயாராக உள்ளது:**\n\nஉங்கள் தற்போதைய GPS இருப்பிடம் மற்றும் வாகன விபரம் தமிழ்நாடு காவல்துறை கட்டுப்பாட்டு அறை (112) மற்றும் உங்கள் அவசர தொடர்புகளுக்கு உடனடியாக அனுப்பப்படுகிறது.",
        action: { type: 'EMERGENCY_SOS', label: 'அவசர SOS தொடங்கு' }
      };
    }
    if (lang === 'hi') {
      return {
        reply: "🚨 **आपातकालीन एसओएस प्रोटोकॉल सक्रिय है:**\n\nआपका लाइव जीपीएस स्थान और वाहन विवरण तमिलनाडु पुलिस कंट्रोल रूम (112) और आपातकालीन संपर्कों को साझा किया जा रहा है।",
        action: { type: 'EMERGENCY_SOS', label: 'आपातकालीन सहायता कॉल' }
      };
    }
    return {
      reply: "🚨 **Emergency SOS Safety Protocol Activated:**\n\nLive GPS coordinates and vehicle telemetry are broadcast to Tamil Nadu Police Control (112) and RideFlow Safety Command.",
      action: { type: 'EMERGENCY_SOS', label: 'Trigger Emergency SOS' }
    };
  }

  // 2. Ride Start OTP & Verification Queries
  if (query.includes('otp') || query.includes('pin') || query.includes('code') || query.includes('start ride') || query.includes('கடவுச்சொல்') || query.includes('ஓடிபி') || query.includes('ओटीपी')) {
    const activeBooking = context.activeBookings?.find(b => b.status === 'Active' || b.status === 'In Progress');
    const otpCode = activeBooking?.rideOtp || '4892';
    
    if (lang === 'ta') {
      return {
        reply: `🔑 **பயண தொடக்க OTP அமைப்பு (4-Digit Start OTP):**\n\n• உங்கள் பாதுகாப்பிற்காக ஒவ்வொரு ரைட்ஃப்ளோ முன்பதிவிற்கும் தனித்துவமான **4-இலக்க OTP** உருவாக்கப்படுகிறது (எ.கா: \`${otpCode}\`).\n• **பயணி செயல்:** வாகனத்தில் ஏறும் போது இந்த 4-இலக்க குறியீட்டை உங்கள் ஓட்டுநரிடம் தெரிவிக்கவும்.\n• **ஓட்டுநர் செயல்:** ஓட்டுநர் இந்த OTP ஐ சரிபார்த்த பின்னரே GPS நேரடி கண்காணிப்புடன் பயணம் தொடங்கும்.`,
        action: { type: 'NAVIGATE', target: 'dashboard', label: 'செயலில் உள்ள OTP காண்க' }
      };
    }
    if (lang === 'hi') {
      return {
        reply: `🔑 **राइड स्टार्ट OTP सुरक्षा प्रणाली (4-Digit Start OTP):**\n\n• आपकी सुरक्षा हेतु प्रत्येक राइडफ्लो बुकिंग पर एक यूनिक **4-अंकीय OTP** जारी होता है (उदा: \`${otpCode}\`)।\n• **यात्री कर्तव्य:** वाहन में बैठते समय यह OTP ड्राइवर को बताएं।\n• **ड्राइवर सत्यापन:** ड्राइवर द्वारा OTP दर्ज करने के बाद ही सुरक्षित जीपीएस ट्रैकिंग के साथ यात्रा शुरू होगी।`,
        action: { type: 'NAVIGATE', target: 'dashboard', label: 'सक्रिय OTP देखें' }
      };
    }
    return {
      reply: `🔑 **Ride Start OTP System:**\n\n• For your security, every RideFlow booking generates a unique **4-digit OTP** (e.g. \`${otpCode}\`).\n• **Passenger Action:** Convey this OTP code to your driver/captain when boarding.\n• **Driver Action:** The driver enters the OTP to transition trip status to *In Transit* with active GPS telemetry tracking.`,
      action: { type: 'NAVIGATE', target: 'dashboard', label: 'View Active Booking OTP' }
    };
  }

  // 3. Bike Taxi & Bike Rentals
  if (query.includes('bike') || query.includes('two wheeler') || query.includes('motorcycle') || query.includes('scooter') || query.includes('enfield') || query.includes('ola') || query.includes('பைக்') || query.includes('இருசக்கர') || query.includes('बाइक')) {
    if (lang === 'ta') {
      return {
        reply: `🏍️ **ரைட்ஃப்ளோ இருசக்கர வாகன சேவைகள்:**\n\n1. **சோலோ பைக் டாக்ஸி (Solo Bike Taxi):** குறைந்த கட்டணத்தில் நெரிசலைத் தவிர்க்கலாம் (ஹெல்மெட் வசதியுடன், ₹20 அடிப்படை + ₹6/கி.மீ).\n2. **சுய-ஓட்டுநர் பைக் வாடகை (Self-Drive Bike Rentals):**\n   • *ராயல் என்ஃபீல்ட் கிளாசிக் 350* (₹95/மணி)\n   • *ஓலா S1 ப்ரோ எலக்ட்ரிக்* (₹65/மணி)\n   • *டிவிஎஸ் ஜூபிடர் 125* (₹45/மணி)\n\nஅனைத்து வாடகைகளுக்கும் முன்பணம் (Security Deposit) தேவையில்லை மற்றும் 100% இலவச ரத்து வசதி உண்டு.`,
        action: { type: 'NAVIGATE', target: 'rentals', label: 'பைக் வாடகைகளைக் காண்க' }
      };
    }
    if (lang === 'hi') {
      return {
        reply: `🏍️ **राइडफ्लो टू-व्हीलर मोबिलिटी विकल्प:**\n\n1. **सोलो बाइक टैक्सी:** ट्रैफिक से तेजी से निकलें (हेलमेट उपलब्ध, ₹20 बेस + ₹6/किमी)।\n2. **सेल्फ-ड्राइव बाइक रेंटल:**\n   • *रॉयल एनफील्ड क्लासिक 350* (₹95/घंटा)\n   • *ओला S1 प्रो ईवी* (₹65/घंटा)\n   • *टीवीएस जुपिटर 125* (₹45/घंटा)\n\nशून्य सुरक्षा जमा राशि और 100% नि:शुल्क रद्दीकरण सुविधा उपलब्ध है।`,
        action: { type: 'NAVIGATE', target: 'rentals', label: 'बाइक रेंटल देखें' }
      };
    }
    return {
      reply: `🏍️ **RideFlow Bike Mobility Options:**\n\n1. **Solo Bike Taxi:** Beat traffic fast with certified captains (Helmets provided, ₹20 Base + ₹6/km).\n2. **Self-Drive Bike Rentals:**\n   • *Royal Enfield Classic 350* (₹95/hr)\n   • *Ola S1 Pro Electric Gen 2* (₹65/hr)\n   • *TVS Jupiter 125* (₹45/hr)\n   • *Yamaha Aerox 155* (₹80/hr)\n\nAll rentals include zero security deposit and 100% free cancellation.`,
      action: { type: 'NAVIGATE', target: 'rentals', label: 'Explore Bike Rentals' }
    };
  }

  // 4. Reporting, Strikes & Appeals
  if (query.includes('report') || query.includes('strike') || query.includes('appeal') || query.includes('flag') || query.includes('suspend') || query.includes('complaint') || query.includes('புகார்') || query.includes('शिकायत')) {
    if (lang === 'ta') {
      return {
        reply: `🛡️ **ரைட்ஃப்ளோ 3-ஸ்ட்ரைக் பாதுகாப்பு விதிமுறை:**\n\n• **புகார் அளித்தல்:** ஓட்டுநர் அல்லது பயணி விதிகளை மீறினால் (அதிவேகம், கூடுதல் கட்டணம், தவறான நடத்தை), நீங்கள் புகார் அளிக்கலாம்.\n• **3-ஸ்ட்ரைக் தற்காலிக இடைநீக்கம்:** 3 புகார்கள் பெற்ற கணக்குகள் சூப்பர் அட்மினால் முடக்கப்படும்.\n• **மேல்முறையீடு:** முடக்கப்பட்ட பயனர்கள் அட்மின் குழுவிடம் விளக்கம் அளித்து கணக்கை மீட்டெடுக்கலாம்.`,
        action: { type: 'NAVIGATE', target: 'admin', label: 'பாதுகாப்பு பலகை காண்க' }
      };
    }
    if (lang === 'hi') {
      return {
        reply: `🛡️ **राइडफ्लो 3-स्ट्राइक सुरक्षा व अनुशासन नीति:**\n\n• **रिपोर्टिंग:** यदि कोई चालक या सहयात्री सुरक्षा नियमों का उल्लंघन करता है, तो आप शिकायत दर्ज कर सकते हैं।\n• **3-स्ट्राइक निलंबन:** 3 स्ट्राइक होने पर सुपर एडमिन द्वारा खाता प्रतिबंधित किया जाता है।\n• **अपील सुविधा:** प्रतिबंधित उपयोगकर्ता साक्ष्य प्रस्तुत कर खाता पुनः सक्रिय करने की अपील कर सकते हैं।`,
        action: { type: 'NAVIGATE', target: 'admin', label: 'सुरक्षा डेस्क देखें' }
      };
    }
    return {
      reply: `🛡️ **RideFlow 3-Strike Governance & Safety Policy:**\n\n• **Reporting:** If a driver or passenger violates safety rules (overspeeding, overcharging, harassment), you can submit a verified incident report.\n• **3-Strike Suspension:** When any user gets 3 strikes, the Super Admin flags and restricts their account.\n• **Appeals:** Flagged users can submit a formal explanation with evidence to the Admin for review and unflagging.`,
      action: { type: 'NAVIGATE', target: 'admin', label: 'View Moderation Desk' }
    };
  }

  // 5. Contact Admin & Support Desk
  if (query.includes('admin') || query.includes('support') || query.includes('ticket') || query.includes('contact') || query.includes('ஆதரவு') || query.includes('உதவி மையம்') || query.includes('सपोर्ट') || query.includes('मदद')) {
    if (lang === 'ta') {
      return {
        reply: `🎧 **ரைட்ஃப்ளோ அட்மின் ஆதரவு மையம் (Admin Support Desk):**\n\nபயணிகள் மற்றும் ஓட்டுநர்கள் தங்கள் கேள்விகள் அல்லது பிரச்சனைகளுக்கு நேரடியாக சூப்பர் அட்மின் குழுவிடம் டிக்கெட் சமர்ப்பிக்கலாம். அட்மின் பதில் நேரடியாக உங்கள் Support Desk-ல் தோன்றும்.`,
        action: { type: 'NAVIGATE', target: 'dashboard', label: 'ஆதரவு மையத்தைத் திறக்க' }
      };
    }
    if (lang === 'hi') {
      return {
        reply: `🎧 **राइडफ्लो एडमिन सपोर्ट डेस्क:**\n\nयात्री या पार्टनर ड्राइवर किसी भी समस्या के समाधान हेतु सीधे सुपर एडमिन टीम को टिकट भेज सकते हैं। एडमिन का उत्तर सीधे आपके सपोर्ट इनबॉक्स में प्राप्त होगा।`,
        action: { type: 'NAVIGATE', target: 'dashboard', label: 'सपोर्ट डेस्क खोलें' }
      };
    }
    return {
      reply: `🎧 **RideFlow Support & Admin Desk:**\n\nAny commuter or partner driver can submit questions or support tickets directly to the Super Admin team. Inquiries are tracked with live status updates and official admin responses.`,
      action: { type: 'NAVIGATE', target: 'dashboard', label: 'Open Support Desk' }
    };
  }

  // 6. GST & Tax Invoices
  if (query.includes('gst') || query.includes('tax') || query.includes('invoice') || query.includes('receipt') || query.includes('வரி') || query.includes('ரசீது') || query.includes('जीएसटी') || query.includes('रसीद')) {
    const sample = calculateGstBreakdown(600);
    if (lang === 'ta') {
      return {
        reply: `🧾 **ஜிஎஸ்டி (GST) மற்றும் வரி ரசீதுகள்:**\n\nரைட்ஃப்ளோ அதிகாரப்பூர்வ 5% போக்குவரத்து ஜிஎஸ்டி வீதத்தை (SAC Code: ${sample.sacCode}) பின்பற்றுகிறது:\n• மத்திய ஜிஎஸ்டி (CGST): 2.5%\n• தமிழ்நாடு மாநில ஜிஎஸ்டி (SGST): 2.5%\n\nமுடிக்கப்பட்ட ஒவ்வொரு பயணத்திற்கும் பதிவிறக்கம் செய்யக்கூடிய PDF வரி ரசீது (GSTIN: ${sample.gstin}) வழங்கப்படும்.`,
        action: { type: 'NAVIGATE', target: 'dashboard', label: 'வரி ரசீதுகள் பதிவிறக்க' }
      };
    }
    if (lang === 'hi') {
      return {
        reply: `🧾 **जीएसटी अनुपालन और टैक्स इनवॉइस:**\n\nराइडफ्लो आधिकारिक 5% परिवहन जीएसटी दर (SAC Code: ${sample.sacCode}) का पालन करता है:\n• केंद्रीय जीएसटी (CGST): 2.5%\n• तमिलनाडु राज्य जीएसटी (SGST): 2.5%\n\nप्रत्येक पूर्ण यात्रा हेतु डाउनलोड करने योग्य पीडीएफ टैक्स रसीद (GSTIN: ${sample.gstin}) उपलब्ध है।`,
        action: { type: 'NAVIGATE', target: 'dashboard', label: 'टैक्स इनवॉइस डाउनलोड करें' }
      };
    }
    return {
      reply: `🧾 **Tax Compliance & GST Transparency:**\n\nRideFlow strictly adheres to the official 5% Road Transport GST rate (SAC Code: ${sample.sacCode}):\n• Central GST (CGST): 2.5%\n• Tamil Nadu State GST (SGST): 2.5%\n\nEvery completed booking includes a downloadable PDF Tax Invoice (GSTIN: ${sample.gstin}).`,
      action: { type: 'NAVIGATE', target: 'dashboard', label: 'Download Tax Invoices' }
    };
  }

  // 7. Route Fare Estimations
  const mentionsChennai = query.includes('chennai') || query.includes('omr') || query.includes('central') || query.includes('airport') || query.includes('tambaram') || query.includes('சென்னை');
  const mentionsCbe = query.includes('coimbatore') || query.includes('gandhipuram') || query.includes('tidel') || query.includes('avinashi') || query.includes('கோவை') || query.includes('கோயம்புத்தூர்');
  const mentionsMadurai = query.includes('madurai') || query.includes('meenakshi') || query.includes('மதுரை');
  const mentionsSalem = query.includes('salem') || query.includes('yercaud') || query.includes('சேலம்');

  if (query.includes('fare') || query.includes('price') || query.includes('cost') || query.includes('rate') || query.includes('how much') || query.includes('கட்டணம்') || query.includes('விலை') || query.includes('किराया') || query.includes('दर')) {
    let from = 'Chennai Central Railway Station';
    let to = 'OMR IT Expressway (Sholinganallur)';

    if (mentionsCbe) {
      from = 'Coimbatore Gandhipuram Central';
      to = 'TIDEL Park Coimbatore';
    } else if (mentionsMadurai) {
      from = 'Madurai Meenakshi Amman Temple';
      to = 'Madurai International Airport';
    } else if (mentionsSalem) {
      from = 'Salem New Bus Stand';
      to = 'Yercaud Foothills Junction';
    }

    const comparison = getRouteComparison(from, to, 'urgent');

    if (lang === 'ta') {
      return {
        reply: `📍 **பயணக் கட்டண ஒப்பீடு: ${from} ➔ ${to}** (${comparison.route.distanceKm} கி.மீ • ~${comparison.route.durationMins} நிமிடங்கள்):\n\n• 🏍️ **சோலோ பைக் டாக்ஸி**: ₹${Math.round(20 + comparison.route.distanceKm * 6)}\n• 🚗 **தனியார் ஓட்டுநர் (Swift/Innova)**: ₹${comparison.driverDetails.total}\n• 👥 **கார்பூல் பகிர்வு இருக்கை**: ₹${comparison.carpoolDetails.totalPerSeat} / நபர்\n• 🔑 **சுய-ஓட்டுநர் வாடகை**: ₹${comparison.rentalDetails.total}\n\n⭐ சிறந்த பரிந்துரை: **${comparison.recommendedMode.name}**`,
        action: { type: 'NAVIGATE', target: 'compare', label: 'முன்பதிவு செய்ய செல்க' }
      };
    }
    if (lang === 'hi') {
      return {
        reply: `📍 **किराया तुलना: ${from} ➔ ${to}** (${comparison.route.distanceKm} किमी • ~${comparison.route.durationMins} मिनट):\n\n• 🏍️ **सोलो बाइक टैक्सी**: ₹${Math.round(20 + comparison.route.distanceKm * 6)}\n• 🚗 **प्राइवेट ड्राइवर कैब**: ₹${comparison.driverDetails.total}\n• 👥 **कारपूल शेयर सीट**: ₹${comparison.carpoolDetails.totalPerSeat} / सीट\n• 🔑 **सेल्फ-ड्राइव रेंटल**: ₹${comparison.rentalDetails.total}\n\n⭐ सर्वश्रेष्ठ सिफारिश: **${comparison.recommendedMode.name}**`,
        action: { type: 'NAVIGATE', target: 'compare', label: 'किराया तुलना देखें' }
      };
    }

    return {
      reply: `📍 **Route Fare Breakdown: ${from} ➔ ${to}** (${comparison.route.distanceKm} km • ~${comparison.route.durationMins} mins):\n\n• 🏍️ **Bike Taxi (Solo Rapid)**: ₹${Math.round(20 + comparison.route.distanceKm * 6)}\n• 🚗 **Private Driver (Swift/Innova)**: ₹${comparison.driverDetails.total}\n• 👥 **Carpool Shared Seat**: ₹${comparison.carpoolDetails.totalPerSeat} / seat\n• 🔑 **Self-Drive Rental (2h)**: ₹${comparison.rentalDetails.total}\n\n⭐ Algorithmic Recommendation: **${comparison.recommendedMode.name}** (${comparison.recommendedMode.reason})`,
      action: { type: 'NAVIGATE', target: 'compare', label: 'Open Fare Comparator' }
    };
  }

  // 8. General Greetings & Assistant Capabilities
  if (lang === 'ta') {
    return {
      reply: `வணக்கம்! நான் உங்கள் **ஃப்ளோபாட் AI (FlowBot)** தமிழ்நாடு போக்குவரத்து உதவியாளர்.\n\nநான் உங்களுக்கு உதவக்கூடியவை:\n• **பைக் டாக்ஸி, கார், வாடகை வாகனம் & கார்பூல் கட்டண ஒப்பீடு**\n• உங்கள் **4-இலக்க Ride Start OTP சரிபார்ப்பு**\n• **3-ஸ்ட்ரைக் பாதுகாப்பு மற்றும் அட்மின் உதவி மையம்**`,
      action: { type: 'NAVIGATE', target: 'compare', label: 'கட்டணம் கணக்கிடு' }
    };
  }
  if (lang === 'hi') {
    return {
      reply: `नमस्ते! मैं आपका **फ्लोबॉट AI** मोबिलिटी सहायक हूँ।\n\nमैं आपकी सहायता कर सकता हूँ:\n• **बाइक टैक्सी, ड्राइवर, रेंटल और कारपूल किराया तुलना**\n• आपका **4-अंकीय Ride Start OTP**\n• **3-स्ट्राइक सुरक्षा नीति और सुपर एडमिन सपोर्ट**`,
      action: { type: 'NAVIGATE', target: 'compare', label: 'किराया तुलना करें' }
    };
  }

  return {
    reply: `Vanakkam! I am **FlowBot**, your Dynamic AI Mobility Copilot for Tamil Nadu.\n\nI can help you:\n• Compare fares for **Bike Taxis, Private Drivers, Carpools & Rentals**\n• Lookup your **4-Digit Ride Start OTP**\n• Understand **3-Strike Reporting & Admin Appeals**\n• Contact the **Super Admin Support Desk**`,
    action: { type: 'NAVIGATE', target: 'compare', label: 'Compare Mobility Modes' }
  };
}

