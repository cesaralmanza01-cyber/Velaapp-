/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { OnboardingData, CalculatedMetrics, UserProfile, MeasurementHistoryEntry, GoalOptionKey } from './types';
import { calculateMetabolicMetrics } from './utils/metabolicCalc';
import { Navbar } from './components/Navbar';
import { BottomNav, TabType } from './components/BottomNav';
import { WelcomeScreen } from './components/Onboarding/WelcomeScreen';
import { StepByStepOnboarding } from './components/Onboarding/StepByStepOnboarding';
import { MetricRevealModal } from './components/Onboarding/MetricRevealModal';
import { GoalSelectorScreen } from './components/Onboarding/GoalSelectorScreen';
import { SummaryScreen } from './components/Onboarding/SummaryScreen';
import { TrainingSetupScreen } from './components/Onboarding/TrainingSetupScreen';
import { PlanPreparingScreen } from './components/Onboarding/PlanPreparingScreen';
import { MedicalBlockScreen } from './components/Onboarding/MedicalBlockScreen';
import { AuthModal } from './components/Auth/AuthModal';
import { PlanTab } from './components/Dashboard/PlanTab';
import { TrainingTab } from './components/Dashboard/TrainingTab';
import { DiagnosticTab } from './components/Dashboard/DiagnosticTab';
import { ChatTab } from './components/Dashboard/ChatTab';
import { ProfileTab } from './components/Dashboard/ProfileTab';
import { DoctorPanel } from './components/Doctor/DoctorPanel';
import { DoctorLoginModal } from './components/Doctor/DoctorLoginModal';

export default function App() {
  const STORAGE_KEY = 'diagnostico_metabolico_user_v2';

  // Initial Onboarding Default Form
  const defaultOnboarding: OnboardingData = {
    name: 'María Camila',
    email: '',
    age: 42,
    gender: 'femenino',
    lifeStage: 'Premenopausia',
    heightCm: 165,
    weightKg: 68,
    inBodyUploaded: false,
    silhouetteFatPercent: 32,
    neatLevel: 'ligero',
    exerciseDaysPerWeek: 3,
    exerciseDurationMinutes: 45,
    exerciseIntensity: 'moderada',
    wakeUpTime: '06:30',
    bedTime: '22:30',
    sleepHours: 8,
    activeMealTimes: ['desayuno', 'media_manana', 'almuerzo', 'cena'],
    waterLitersPerDay: 2,
    alcoholFrequency: 'ocasional',
    allergies: ['Lactosa / Lácteos enteros'],
    medicalConditions: [],
    sitToStandReps: 14,
    foodRelationship: {
      description: 'Ruido de comida recurrente en la tarde o noche',
      emotionalEating: 'Varias veces a la semana',
      compensatoryBehaviors: 'Ninguna conducta compensatoria',
    },
    trainingPreference: 'Express 15-20min',
    selectedGoal: 'perdida_moderada',
  };

  const [onboardingData, setOnboardingData] = useState<OnboardingData>(defaultOnboarding);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [currentMetrics, setCurrentMetrics] = useState<CalculatedMetrics>(() => calculateMetabolicMetrics(defaultOnboarding));
  const [authInitialized, setAuthInitialized] = useState<boolean>(false);

  type FlowState = 'welcome' | 'onboarding' | 'blocked' | 'goal' | 'summary' | 'training' | 'preparing' | 'dashboard' | 'doctor_panel';
  const [flowState, setFlowState] = useState<FlowState>('welcome');
  const [activeTab, setActiveTab] = useState<TabType>('plan');
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [showDoctorLoginModal, setShowDoctorLoginModal] = useState<boolean>(false);

  // Reveal Modal State
  const [revealModal, setRevealModal] = useState<{
    isOpen: boolean;
    type: 'bmi' | 'fat' | 'muscle' | 'visceral';
    value: number;
    statusText: string;
    isAlert: boolean;
    explanationText: string;
    biologicalInsight: string;
  }>({
    isOpen: false,
    type: 'bmi',
    value: 24.5,
    statusText: 'Óptimo',
    isAlert: false,
    explanationText: '',
    biologicalInsight: '',
  });

  // URL / Route Protection check for /panel or /admin or #panel
  useEffect(() => {
    if (!authInitialized) return;

    const checkRoute = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search.toLowerCase();
      const isPanelUrl =
        path.startsWith('/panel') ||
        path.startsWith('/admin') ||
        hash === '#panel' ||
        hash === '#admin' ||
        search.includes('view=panel');

      if (isPanelUrl) {
        if (userProfile?.role === 'doctora') {
          setFlowState('doctor_panel');
        } else {
          // Protected route gate: Not authorized, open doctor login modal
          setShowDoctorLoginModal(true);
        }
      }
    };

    checkRoute();
    window.addEventListener('popstate', checkRoute);
    window.addEventListener('hashchange', checkRoute);
    return () => {
      window.removeEventListener('popstate', checkRoute);
      window.removeEventListener('hashchange', checkRoute);
    };
  }, [authInitialized, userProfile]);

  // Load from LocalStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: UserProfile = JSON.parse(saved);
        setUserProfile(parsed);
        setOnboardingData(parsed.onboarding);
        const metrics = calculateMetabolicMetrics(parsed.onboarding, parsed.revision_medica);
        setCurrentMetrics(parsed.metrics || metrics);
        if (parsed.role === 'doctora') {
          // If already authenticated as doctor and URL has /panel or user requested
          const path = window.location.pathname.toLowerCase();
          const hash = window.location.hash.toLowerCase();
          if (path.startsWith('/panel') || hash === '#panel') {
            setFlowState('doctor_panel');
          }
        }
      }
    } catch (e) {
      console.warn('Error reading from localStorage', e);
    } finally {
      setAuthInitialized(true);
    }
  }, []);

  // Save to LocalStorage & Server Sync
  const saveProfile = async (profile: UserProfile) => {
    setUserProfile(profile);
    setCurrentMetrics(profile.metrics);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
      if (profile.onboarding.email) {
        await fetch('/api/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: profile.onboarding.email, profile }),
        });
      }
    } catch (e) {
      console.warn('Error saving profile:', e);
    }
  };

  // Trigger Intermediate Metric Reveal
  const triggerReveal = (
    type: 'bmi' | 'fat' | 'muscle' | 'visceral',
    value: number,
    statusText: string,
    isAlert: boolean,
    explanationText: string,
    biologicalInsight: string
  ) => {
    setRevealModal({
      isOpen: true,
      type,
      value,
      statusText,
      isAlert,
      explanationText,
      biologicalInsight,
    });
  };

  // Finish Onboarding Step 8
  const handleFinishStepByStep = (finalData: OnboardingData) => {
    const clearance = userProfile?.revision_medica || finalData.revision_medica;
    const finalWithClearance: OnboardingData = {
      ...finalData,
      revision_medica: clearance,
    };
    setOnboardingData(finalWithClearance);
    const metrics = calculateMetabolicMetrics(finalWithClearance, clearance);
    setCurrentMetrics(metrics);

    if (metrics.isMedicalBlocked) {
      const todayStr = new Date().toISOString().split('T')[0];
      const blockedProfile: UserProfile = {
        id: userProfile?.id || Date.now().toString(),
        name: finalWithClearance.preferredName || finalWithClearance.name || 'Paciente',
        email: finalWithClearance.email || `paciente-${Date.now()}@vela.health`,
        createdDate: userProfile?.createdDate || todayStr,
        onboarding: { ...finalWithClearance, revision_medica: 'pendiente' },
        metrics,
        role: 'paciente',
        measurementHistory: [],
        completedCheckIns: [],
        streakDays: 0,
        revision_medica: 'pendiente',
      };
      saveProfile(blockedProfile);
      setFlowState('blocked');
    } else {
      setFlowState('goal');
    }
  };

  // Goal Selected -> Calculate Final Metrics & Go to Summary
  const handleGoalSelected = (
    goalKey: GoalOptionKey,
    targetWeight: number,
    months: number,
    muscleGoal?: 'conservadora' | 'moderada' | 'maxima'
  ) => {
    const updatedData: OnboardingData = {
      ...onboardingData,
      selectedGoal: goalKey,
      muscleGoal: muscleGoal || 'moderada',
      targetWeightKg: targetWeight,
      monthsToGoal: months,
    };
    setOnboardingData(updatedData);

    const metrics = calculateMetabolicMetrics(updatedData);
    setCurrentMetrics(metrics);
    const todayStr = new Date().toISOString().split('T')[0];

    const newProfile: UserProfile = {
      id: userProfile?.id || Date.now().toString(),
      name: updatedData.preferredName || updatedData.name || 'Paciente',
      email: updatedData.email || '',
      createdDate: userProfile?.createdDate || todayStr,
      onboarding: updatedData,
      metrics,
      role: userProfile?.role || 'paciente',
      measurementHistory: userProfile?.measurementHistory || [
        {
          id: '1',
          date: todayStr,
          weightKg: updatedData.weightKg,
          bodyFatPercent: metrics.bodyFatPercent,
          muscleMassKg: metrics.muscleMassKg,
          visceralFatLevel: metrics.visceralFatLevel,
          sitToStandReps: metrics.sitToStandReps,
        },
      ],
      completedCheckIns: userProfile?.completedCheckIns || [todayStr],
      streakDays: userProfile?.streakDays || 1,
    };

    saveProfile(newProfile);
    setFlowState('summary');
  };

  // Summary -> Go to Training Setup (Step 15)
  const handleProceedToTraining = () => {
    setFlowState('training');
  };

  // Training Setup Confirmed (Step 15 -> 16)
  const handleTrainingConfirmed = (trainingConfig: {
    trainingTime: string;
    exerciseDaysPerWeek: number;
    exerciseIntensityLevel: 'baja' | 'moderada' | 'alta';
    trainingModality: any;
    trainingPreference: 'Express 15-20min' | 'Power 45-60min' | 'Gimnasio con PDF' | 'Personalizado';
    parqAnswers?: any;
    parqHasRisk?: boolean;
    parqNoticeAcknowledged?: boolean;
  }) => {
    const updatedData: OnboardingData = {
      ...onboardingData,
      trainingTime: trainingConfig.trainingTime,
      exerciseDaysPerWeek: trainingConfig.exerciseDaysPerWeek,
      exerciseIntensityLevel: trainingConfig.exerciseIntensityLevel,
      trainingModality: trainingConfig.trainingModality,
      trainingPreference: trainingConfig.trainingPreference,
      parqAnswers: trainingConfig.parqAnswers || onboardingData.parqAnswers,
      parqHasRisk: trainingConfig.parqHasRisk ?? onboardingData.parqHasRisk,
      parqNoticeAcknowledged: trainingConfig.parqNoticeAcknowledged ?? onboardingData.parqNoticeAcknowledged,
    };
    setOnboardingData(updatedData);

    if (userProfile) {
      const updatedMetrics = calculateMetabolicMetrics(updatedData);
      setCurrentMetrics(updatedMetrics);
      saveProfile({
        ...userProfile,
        onboarding: updatedData,
        metrics: updatedMetrics,
      });
    }

    setFlowState('preparing');
  };

  // Complete Preparing -> Go to Dashboard (Step 16)
  const handlePreparationComplete = () => {
    setFlowState('dashboard');
    setActiveTab('plan');
  };

  // Add Measurement to History in Dashboard
  const handleAddMeasurement = (entry: MeasurementHistoryEntry) => {
    if (!userProfile) return;
    const updatedHistory = [entry, ...userProfile.measurementHistory];
    const updatedData: OnboardingData = {
      ...userProfile.onboarding,
      weightKg: entry.weightKg,
      sitToStandReps: entry.sitToStandReps ?? userProfile.onboarding.sitToStandReps,
    };
    const updatedMetrics = calculateMetabolicMetrics(updatedData);

    const updatedProfile: UserProfile = {
      ...userProfile,
      onboarding: updatedData,
      metrics: updatedMetrics,
      measurementHistory: updatedHistory,
    };
    saveProfile(updatedProfile);
  };

  // Reset Assessment
  const handleResetAssessment = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUserProfile(null);
    setOnboardingData(defaultOnboarding);
    setFlowState('onboarding');
  };

  // User Auth Success (Patient Login / Register)
  const handleAuthSuccess = (syncedProfile: UserProfile) => {
    if (syncedProfile) {
      setUserProfile(syncedProfile);
      setOnboardingData(syncedProfile.onboarding);
      setCurrentMetrics(syncedProfile.metrics || calculateMetabolicMetrics(syncedProfile.onboarding));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(syncedProfile));
      if (syncedProfile.role === 'doctora') {
        window.history.pushState(null, '', '/panel');
        setFlowState('doctor_panel');
      }
    }
  };

  // Doctor Auth Success
  const handleDoctorAuthSuccess = (doctorProfile: UserProfile) => {
    setUserProfile(doctorProfile);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(doctorProfile));
    window.history.pushState(null, '', '/panel');
    setFlowState('doctor_panel');
  };

  // Doctor Logout
  const handleDoctorLogout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUserProfile(null);
    window.history.pushState(null, '', '/');
    setFlowState('welcome');
  };

  // If Doctor Panel is active and authorized
  if (flowState === 'doctor_panel' && userProfile?.role === 'doctora') {
    return (
      <DoctorPanel
        doctorProfile={userProfile}
        onExitToPatientApp={() => {
          window.history.pushState(null, '', '/');
          setFlowState('dashboard');
        }}
        onLogout={handleDoctorLogout}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF6F0] text-[#2E3A36] font-sans antialiased flex flex-col justify-between selection:bg-[#6E9E93] selection:text-white">
      {/* Navbar Superior con Logo Velapp y trigger médico */}
      <Navbar
        currentStepTitle={
          flowState === 'onboarding'
            ? 'Cuestionario de Diagnóstico'
            : flowState === 'blocked'
            ? 'Evaluación Médica Requerida'
            : flowState === 'goal'
            ? 'Selección de Meta Metabólica'
            : flowState === 'summary'
            ? 'Resumen de Resultados'
            : flowState === 'dashboard'
            ? 'Mi Dashboard Metabólico'
            : undefined
        }
        hasSavedPlan={!!userProfile}
        onOpenSavedPlan={() => setFlowState('dashboard')}
        userEmail={userProfile?.onboarding.email}
        onOpenAuth={() => setShowAuthModal(true)}
        isDoctor={userProfile?.role === 'doctora'}
        onOpenDoctorPanel={() => {
          window.history.pushState(null, '', '/panel');
          setFlowState('doctor_panel');
        }}
      />

      {/* Switcher Principal */}
      <main className="flex-1 flex flex-col">
        {flowState === 'welcome' && (
          <WelcomeScreen
            onStart={() => setFlowState('onboarding')}
            onHasPlan={() => {
              if (userProfile) {
                setFlowState('dashboard');
              } else {
                setShowAuthModal(true);
              }
            }}
            hasSavedPlan={!!userProfile}
          />
        )}

        {flowState === 'onboarding' && (
          <StepByStepOnboarding
            initialData={onboardingData}
            onFinishOnboarding={handleFinishStepByStep}
            onShowReveal={triggerReveal}
          />
        )}

        {flowState === 'blocked' && (
          <MedicalBlockScreen
            onboardingData={onboardingData}
            metrics={currentMetrics}
            reasons={currentMetrics.medicalBlockReasons}
            onModifyData={() => setFlowState('onboarding')}
          />
        )}

        {flowState === 'goal' && (
          <GoalSelectorScreen
            currentWeightKg={onboardingData.weightKg}
            metrics={currentMetrics}
            onSelectGoal={handleGoalSelected}
            onBack={() => setFlowState('onboarding')}
          />
        )}

        {flowState === 'summary' && (
          <SummaryScreen
            onboardingData={onboardingData}
            metrics={currentMetrics}
            onGeneratePlan={handleProceedToTraining}
            onBack={() => setFlowState('goal')}
          />
        )}

        {flowState === 'training' && (
          <TrainingSetupScreen
            onboardingData={onboardingData}
            onConfirm={handleTrainingConfirmed}
            onBack={() => setFlowState('summary')}
          />
        )}

        {flowState === 'preparing' && (
          <PlanPreparingScreen
            userName={onboardingData.preferredName || onboardingData.name}
            onComplete={handlePreparationComplete}
          />
        )}

        {flowState === 'dashboard' && userProfile && (
          <div className="flex-1">
            {activeTab === 'plan' && (
              <PlanTab
                metrics={userProfile.metrics}
                onboarding={userProfile.onboarding}
                userName={userProfile.onboarding.preferredName || userProfile.onboarding.name}
              />
            )}
            {activeTab === 'rutinas' && (
              <TrainingTab
                onboarding={userProfile.onboarding}
                userName={userProfile.onboarding.preferredName || userProfile.onboarding.name}
              />
            )}
            {activeTab === 'diagnostico' && (
              <DiagnosticTab
                metrics={userProfile.metrics}
                onboarding={userProfile.onboarding}
                history={userProfile.measurementHistory}
                onAddMeasurement={handleAddMeasurement}
              />
            )}
            {activeTab === 'chat' && <ChatTab userProfile={userProfile} />}
            {activeTab === 'perfil' && (
              <ProfileTab
                userProfile={userProfile}
                onResetAssessment={handleResetAssessment}
                onOpenAuth={() => setShowAuthModal(true)}
                onLogout={() => {
                  setFlowState('welcome');
                }}
              />
            )}
          </div>
        )}
      </main>

      {/* Navegación Inferior del Paciente */}
      {flowState === 'dashboard' && (
        <BottomNav activeTab={activeTab} onSelectTab={(t) => setActiveTab(t)} />
      )}

      {/* Modal de Revelación Intermedia */}
      {revealModal.isOpen && (
        <MetricRevealModal
          title={revealModal.type.toUpperCase()}
          metricName={
            revealModal.type === 'bmi'
              ? 'Índice de Masa Corporal (IMC)'
              : revealModal.type === 'fat'
              ? 'Porcentaje de Grasa Corporal'
              : revealModal.type === 'muscle'
              ? 'Masa Muscular Estimada'
              : 'Nivel de Grasa Visceral'
          }
          value={revealModal.value}
          unit={revealModal.type === 'bmi' ? '' : revealModal.type === 'fat' ? '%' : 'kg'}
          statusText={revealModal.statusText}
          isAlert={revealModal.isAlert}
          explanationText={revealModal.explanationText}
          biologicalInsight={revealModal.biologicalInsight}
          onNext={() => setRevealModal((prev) => ({ ...prev, isOpen: false }))}
        />
      )}

      {/* Modal de Autenticación de Paciente */}
      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
          currentProfile={userProfile}
        />
      )}

      {/* Modal de Autenticación Exclusiva para la Doctora */}
      {showDoctorLoginModal && (
        <DoctorLoginModal
          isOpen={showDoctorLoginModal}
          onClose={() => {
            setShowDoctorLoginModal(false);
            // Redirect out to home if attempted access was unauthorized
            if (window.location.pathname.startsWith('/panel') || window.location.pathname.startsWith('/admin')) {
              window.history.pushState(null, '', '/');
            }
          }}
          onSuccess={handleDoctorAuthSuccess}
        />
      )}
    </div>
  );
}

