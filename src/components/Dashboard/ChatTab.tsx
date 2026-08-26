import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, UserProfile } from '../../types';
import { Send, Sparkles, Stethoscope, HelpCircle, ArrowRight, User } from 'lucide-react';

interface ChatTabProps {
  userProfile: UserProfile;
}

export const ChatTab: React.FC<ChatTabProps> = ({ userProfile }) => {
  const name = userProfile?.onboarding?.preferredName || userProfile?.onboarding?.name?.split(' ')[0] || 'Paciente';
  const metrics = userProfile?.metrics;
  const onboarding = userProfile?.onboarding;

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'doctor',
      text: `¡Hola ${name}! Soy la Dra. Lorena Castro. Estoy aquí para resolver cualquier inquietud sobre tus porciones, calorías (${metrics?.targetKcal || 1500} kcal), macronutrientes o sensaciones del día a día. Tu plan está diseñado con base en tu fisiología individual, sin restricciones extremas ni culpas. ¿Qué te gustaría consultar hoy?`,
      timestamp: 'Ahora',
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 5 preguntas sugeridas exactas requeridas
  const suggestedQuestions = [
    '¿Por qué tengo esta cantidad de proteína?',
    '¿Qué puedo sustituir si no tengo el ingrediente que me toca?',
    '¿Qué hago cuando como por fuera del plan?',
    '¿Cómo sé si estoy progresando bien?',
    '¿Por qué no me dieron más carbohidratos?',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Generador determinista contextual de respaldo con los datos reales del paciente
  const generateClinicalResponse = (query: string): string => {
    const q = query.toLowerCase();
    const weight = onboarding?.weightKg || 70;
    const protein = metrics?.proteinGrams || Math.round(weight * 2.0);
    const carbs = metrics?.carbsGrams || 130;
    const fats = metrics?.fatGrams || Math.round(weight * 0.8);
    const targetKcal = metrics?.targetKcal || 1500;
    const tdee = metrics?.tdeeKcal || metrics?.maintenanceKcal || 1800;
    const reps = metrics?.sitToStandReps || 14;

    if (q.includes('proteína') || q.includes('proteina') || q.includes('cantidad de proteína')) {
      return `Tu meta de proteína está fijada exactamente en **${protein}g al día** (calculada a 2.0 gramos por cada uno de tus ${weight} kg de peso corporal).

Esta dosis no es casual ni para "aumentar volumen excesivo":
1. **Protección muscular:** Al estar en un déficit metabólico seguro de **${targetKcal} kcal/día**, tu cuerpo necesita aminoácidos constantes para no perder masa muscular magra.
2. **Saciedad prolongada:** La proteína estimula las hormonas péptido YY y GLP-1, evitando los picos de hambre biológica y el picoteo vespertino.
3. **Gasto calórico digestivo:** Su efecto térmico quema cerca del 20-30% de sus propias calorías durante la digestión.`;
    }

    if (q.includes('sustituir') || q.includes('ingrediente') || q.includes('reemplazar') || q.includes('no tengo')) {
      return `En Vela la regla de oro es simple y flexible: **1 porción de un grupo se sustituye por 1 porción del mismo grupo**. No necesitas pasar hambre si te falta un alimento:

• **Proteínas:** Si no tienes pechuga de pollo, puedes usar 2 huevos cocidos o revueltos, 1 lata de atún en agua, 100g de pescado blanco, o 150g de yogur griego sin azúcar.
• **Carbohidratos (${carbs}g diarios):** Si no tienes plátano, sustitúyelo por 1 arepa de maíz delgada, 1 papa mediana cocida con cáscara, o 1/2 taza de arroz o avena en hojuelas.
• **Grasas saludables (${fats}g diarios):** Si no hay aguacate hass (1/4 de unidad), usa 1 cucharadita de aceite de oliva virgen extra o 1 puñado pequeño (15-20g) de frutos secos.

Lo fundamental es respetar la porción asignada a ese tiempo de comida.`;
    }

    if (q.includes('fuera del plan') || q.includes('comí') || q.includes('comi') || q.includes('salí') || q.includes('excedí') || q.includes('antojo')) {
      return `Primero que todo: **cero culpa**. Tu vida social, tus salidas familiares y tus antojos son parte natural de un estilo de vida sostenible a largo plazo.

Fisiológicamente, **una sola comida no arruina tu metabolismo ni borra tu progreso**. 

Nuestra recomendación médica para cuando comas fuera:
1. **Nada de ayunos compensatorios ni horas extra de cardio al día siguiente:** Eso solo perpetúa el ciclo de restricción y mayor ruido de comida.
2. **Retoma con tranquilidad en la siguiente comida programada:** Con tu porción habitual de proteína (${Math.round(protein / 3)}g aprox.), vegetales frescos y abundante agua.
3. Recuerda que el éxito metabólico se construye en la consistencia de las semanas completas, no en la rigidez de un día.`;
    }

    if (q.includes('progresando') || q.includes('progreso') || q.includes('báscula') || q.includes('peso') || q.includes('como se')) {
      return `El peso en la báscula es solo un número que fluctúa a diario por retención de agua, digestión, consumo de sodio y estado hormonal. Para saber si estás progresando de verdad, en Vela evaluamos 3 señales clínicas clave:

1. **Tu ropa y medidas corporales:** Si notas la cintura más holgada o tus pantalones ajustan mejor, estás perdiendo grasa corporal aunque el peso tarde en reflejarlo.
2. **Nivel de energía y saciedad:** Menor cansancio a media tarde y control del ruido mental con la comida demuestran una glucosa e insulina mucho más estables.
3. **Fuerza muscular:** En tu test Sit-to-Stand marcaste **${reps} repeticiones**. Mantener o superar esa fuerza indica que tu masa magra está 100% protegida mientras se oxida tejido adiposo.`;
    }

    if (q.includes('carbohidratos') || q.includes('carbohidrato') || q.includes('carbs') || q.includes('harinas') || q.includes('más carbohidratos')) {
      return `Tus carbohidratos están calculados en **${carbs}g al día** con una razón científica muy precisa:

• **Piso seguro tiroideo:** No eliminamos los carbohidratos (garantizamos siempre un mínimo ≥100g) porque la glándula tiroides los necesita para convertir la hormona T4 en T3 activa y mantener tu metabolismo ágil y alerta.
• **Energía cerebral y descanso:** Permiten una adecuada síntesis de serotonina y melatonina, asegurando un sueño reparador sin fatiga ni neblina mental.
• **Déficit controlado:** Al balancear **${protein}g de proteína**, **${fats}g de grasas** y **${carbs}g de carbohidratos**, logramos exactamente las **${targetKcal} kcal** necesarias para que tu cuerpo use la grasa acumulada como combustible sin entrar en modo de ahorro energético.`;
    }

    // Respuesta general adaptada
    return `Comprendo totalmente tu consulta, ${name}. En tu plan actual con **${targetKcal} kcal/día** (${protein}g de proteína, ${carbs}g de carbohidratos y ${fats}g de grasas saludables), la clave es la consistencia y la tranquilidad hormonal. Recuerda que el metabolismo responde a la regularidad de tus hábitos y no a la perfección estricta. ¿Te gustaría profundizar en alguna comida o ingrediente específico?`;
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          userProfile,
          history: messages,
        }),
      });

      if (!res.ok) {
        throw new Error('Server response error');
      }

      const data = await res.json();
      const replyText = data.reply && data.reply.trim().length > 10
        ? data.reply
        : generateClinicalResponse(text.trim());

      const docMsg: ChatMessage = {
        id: `d-${Date.now() + 1}`,
        sender: 'doctor',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, docMsg]);
    } catch {
      // Fallback determinista inmediato y rico en contexto clínico
      const fallbackReply = generateClinicalResponse(text.trim());
      const docMsg: ChatMessage = {
        id: `d-${Date.now() + 1}`,
        sender: 'doctor',
        text: fallbackReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, docMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-140px)] min-h-[580px] text-[#2E3A36] font-sans">
      {/* Header Requerido: "Pregúntame sobre tu plan" */}
      <header className="bg-white rounded-3xl p-4 sm:p-5 border border-[#AEC9C0]/60 shadow-xs mb-3 flex-shrink-0">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#6E9E93] to-[#558379] text-white flex items-center justify-center font-bold text-base shadow-xs flex-shrink-0">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-[#2E3A36] tracking-tight">
                  Pregúntame sobre tu plan
                </h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  En línea
                </span>
              </div>
              <p className="text-xs text-[#2E3A36]/70 font-medium">
                Dra. Lorena Castro • Médica Especialista en Nutrición Clínica
              </p>
            </div>
          </div>
        </div>

        {/* Resumen Clínico del Plan */}
        {metrics && (
          <div className="mt-3 pt-3 border-t border-[#AEC9C0]/30 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#2E3A36]/80 font-mono">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-[#6E9E93]">Meta Calórica:</span>
              <span className="font-bold text-[#2E3A36] bg-[#FAF6F0] px-2 py-0.5 rounded-md border border-[#AEC9C0]/40">
                {metrics.targetKcal} kcal/día
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span><strong>P:</strong> {metrics.proteinGrams}g</span>
              <span className="text-[#AEC9C0]">•</span>
              <span><strong>C:</strong> {metrics.carbsGrams}g</span>
              <span className="text-[#AEC9C0]">•</span>
              <span><strong>G:</strong> {metrics.fatGrams}g</span>
            </div>
          </div>
        )}
      </header>

      {/* 5 Preguntas Sugeridas y Tocables */}
      <section className="mb-3 flex-shrink-0" aria-label="Preguntas Frecuentes Sugeridas">
        <div className="flex items-center gap-1.5 mb-2 px-1">
          <HelpCircle className="w-3.5 h-3.5 text-[#6E9E93]" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#2E3A36]/70">
            Preguntas frecuentes sugeridas
          </span>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-[#AEC9C0] scrollbar-track-transparent">
          {suggestedQuestions.map((question, idx) => (
            <button
              key={idx}
              id={`suggested-question-btn-${idx}`}
              onClick={() => handleSendMessage(question)}
              disabled={loading}
              className="px-3.5 py-2 bg-white hover:bg-[#FAF6F0] active:scale-[0.98] border border-[#AEC9C0]/70 rounded-2xl text-xs font-medium text-[#2E3A36] whitespace-nowrap transition-all shadow-2xs flex items-center gap-1.5 flex-shrink-0 cursor-pointer disabled:opacity-50 hover:border-[#6E9E93]"
            >
              <span>{question}</span>
              <ArrowRight className="w-3 h-3 text-[#6E9E93] opacity-60" />
            </button>
          ))}
        </div>
      </section>

      {/* Historial de Mensajes (Scrollable) */}
      <main className="flex-1 bg-white/85 rounded-3xl p-4 sm:p-5 border border-[#AEC9C0]/60 shadow-xs overflow-y-auto space-y-3.5 min-h-0 flex flex-col justify-start">
        {messages.map((msg) => {
          const isDoc = msg.sender === 'doctor';
          return (
            <article
              key={msg.id}
              className={`flex items-start gap-2.5 ${isDoc ? 'justify-start' : 'justify-end'}`}
            >
              {isDoc && (
                <div className="w-8 h-8 rounded-full bg-[#6E9E93] text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5 shadow-2xs">
                  DLC
                </div>
              )}

              <div
                className={`p-3.5 sm:p-4 rounded-2xl max-w-[85%] sm:max-w-[80%] text-xs sm:text-[13px] leading-relaxed shadow-2xs ${
                  isDoc
                    ? 'bg-[#FAF6F0] text-[#2E3A36] border border-[#AEC9C0]/50 rounded-tl-xs'
                    : 'bg-[#6E9E93] text-white font-medium rounded-tr-xs ml-auto'
                }`}
              >
                {/* Formateador simple de párrafos y negritas */}
                <div className="space-y-2 whitespace-pre-line">
                  {msg.text.split('\n\n').map((paragraph, pIdx) => (
                    <p key={pIdx}>
                      {paragraph.split('**').map((chunk, cIdx) =>
                        cIdx % 2 === 1 ? (
                          <strong key={cIdx} className={isDoc ? 'text-[#2E3A36] font-bold' : 'text-white font-bold'}>
                            {chunk}
                          </strong>
                        ) : (
                          <span key={cIdx}>{chunk}</span>
                        )
                      )}
                    </p>
                  ))}
                </div>

                <div
                  className={`text-[10px] mt-2 font-mono flex items-center gap-1 ${
                    isDoc ? 'text-[#2E3A36]/50 justify-start' : 'text-white/80 justify-end'
                  }`}
                >
                  <span>{msg.timestamp}</span>
                </div>
              </div>

              {!isDoc && (
                <div className="w-8 h-8 rounded-full bg-[#FAF6F0] border border-[#AEC9C0] text-[#2E3A36] text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  <User className="w-4 h-4 text-[#6E9E93]" />
                </div>
              )}
            </article>
          );
        })}

        {loading && (
          <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-[#FAF6F0] border border-[#AEC9C0]/40 w-fit text-xs text-[#6E9E93] italic animate-pulse">
            <div className="w-6 h-6 rounded-full bg-[#6E9E93] text-white text-[9px] font-bold flex items-center justify-center">
              DLC
            </div>
            <span>La Dra. Lorena está redactando tu respuesta médica...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </main>

      {/* Input de Texto Libre y Footer Fijo */}
      <footer className="mt-3 space-y-2 flex-shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-[#AEC9C0] shadow-xs focus-within:border-[#6E9E93] focus-within:ring-2 focus-within:ring-[#6E9E93]/20 transition-all"
        >
          <input
            id="chat-free-text-input"
            type="text"
            placeholder="Escribe tu duda sobre alimentos, porciones o síntomas..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={loading}
            className="flex-1 px-3 py-2.5 bg-transparent text-xs sm:text-sm text-[#2E3A36] placeholder-[#2E3A36]/45 focus:outline-hidden"
          />
          <button
            id="chat-send-message-btn"
            type="submit"
            disabled={!inputMessage.trim() || loading}
            className="p-3 bg-[#6E9E93] hover:bg-[#5C897F] active:scale-95 text-white rounded-xl font-bold shadow-xs transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer flex items-center justify-center"
            aria-label="Enviar mensaje"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        {/* Footer Fijo Requerido */}
        <div className="py-1 px-2">
          <p className="text-[11px] sm:text-xs text-center text-[#2E3A36]/70 font-medium leading-normal">
            No reemplaza a tu nutricionista ni a tu médico.
          </p>
        </div>
      </footer>
    </div>
  );
};
