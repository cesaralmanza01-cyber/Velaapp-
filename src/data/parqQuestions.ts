import { ParqAnswers } from '../types';

export interface ParqQuestionItem {
  id: keyof ParqAnswers;
  num: number;
  question: string;
  detail: string;
  category: string;
}

export const PARQ_QUESTIONS: ParqQuestionItem[] = [
  {
    id: 'q1_heartCondition',
    num: 1,
    question: '¿Un médico te ha dicho alguna vez que tienes una condición cardíaca y que solo deberías hacer actividad física recomendada por un médico?',
    detail: 'Condiciones cardiovasculares, cardiopatías congénitas o recomendación médica restrictiva previa.',
    category: 'Cardiovascular',
  },
  {
    id: 'q2_chestPainActivity',
    num: 2,
    question: '¿Sientes dolor en el pecho cuando haces actividad física?',
    detail: 'Opresión torácica, punzadas o malestar retroesternal durante el ejercicio o esfuerzo físico.',
    category: 'Cardiovascular',
  },
  {
    id: 'q3_chestPainRest',
    num: 3,
    question: 'En el último mes, ¿has tenido dolor en el pecho sin estar haciendo actividad física?',
    detail: 'Dolor o molestia en el pecho en estado de reposo, descanso o al dormir.',
    category: 'Cardiovascular',
  },
  {
    id: 'q4_balanceDizziness',
    num: 4,
    question: '¿Pierdes el equilibrio por mareo, o alguna vez pierdes el conocimiento?',
    detail: 'Síncopes, desmayos, desvanecimientos repentinos o pérdida de estabilidad motora.',
    category: 'Neurológico / Balance',
  },
  {
    id: 'q5_boneJointProblem',
    num: 5,
    question: '¿Tienes algún problema óseo o articular que pueda empeorar con un cambio en tu actividad física?',
    detail: 'Dolor crónico o limitación funcional en rodillas, columna, cadera, hombros u otras articulaciones.',
    category: 'Osteomuscular',
  },
  {
    id: 'q6_bloodPressureMeds',
    num: 6,
    question: '¿Tu médico te está recetando actualmente medicamentos para la presión arterial o el corazón?',
    detail: 'Fármacos para hipertensión arterial, arritmias u otra condición cardiovascular.',
    category: 'Farmacológico',
  },
  {
    id: 'q7_otherReason',
    num: 7,
    question: '¿Sabes de alguna otra razón por la que no deberías hacer actividad física?',
    detail: 'Cualquier otra causa clínica o física preventiva no mencionada anteriormente.',
    category: 'General',
  },
];
