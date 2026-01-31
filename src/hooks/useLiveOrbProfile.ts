/**
 * Hook to generate LIVE orb profile during transformation journey
 * Updates in real-time based on user's answers as they progress
 */

import { useMemo, useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLaunchpadProgress } from '@/hooks/useLaunchpadProgress';
import {
  generateOrbThreads,
  DEFAULT_MULTI_THREAD_PROFILE,
  type MultiThreadOrbProfile,
  type OrbDNAThread,
} from '@/lib/orbDNAThreads';

// localStorage keys for journey data
const STORAGE_KEYS = {
  welcomeQuiz: 'launchpad_welcome_quiz',
  personalProfile: 'launchpad_personal_profile',
  lifestyleRoutine: 'launchpad_lifestyle_routine',
  growthDeepDive: 'launchpad_growth_deep_dive',
  firstChat: 'launchpad_first_chat',
  focusAreas: 'launchpad_focus_areas',
  firstWeek: 'launchpad_first_week',
  finalNotes: 'launchpad_final_notes',
};

// Map hobbies to color themes
const HOBBY_COLOR_MAP: Record<string, { hue: number; animation: 'pulse' | 'wave' | 'orbit' | 'spiral' | 'breathe' }> = {
  // Physical
  'martial-arts': { hue: 15, animation: 'spiral' },
  'fitness': { hue: 25, animation: 'pulse' },
  'sports': { hue: 20, animation: 'spiral' },
  'hiking': { hue: 45, animation: 'spiral' },
  'dancing': { hue: 340, animation: 'orbit' },
  // Intellectual
  'science': { hue: 185, animation: 'wave' },
  'psychology': { hue: 240, animation: 'wave' },
  'reading': { hue: 220, animation: 'wave' },
  'technology': { hue: 200, animation: 'wave' },
  // Spiritual
  'philosophy': { hue: 270, animation: 'breathe' },
  'meditation': { hue: 260, animation: 'breathe' },
  'yoga': { hue: 155, animation: 'breathe' },
  'tarot': { hue: 285, animation: 'orbit' },
  'magic': { hue: 280, animation: 'spiral' },
  // Creative
  'music': { hue: 320, animation: 'wave' },
  'art': { hue: 330, animation: 'orbit' },
  'writing': { hue: 250, animation: 'wave' },
  'photography': { hue: 35, animation: 'orbit' },
  'gaming': { hue: 195, animation: 'pulse' },
  // Social
  'mentoring': { hue: 145, animation: 'breathe' },
  'teaching': { hue: 150, animation: 'wave' },
  'volunteering': { hue: 140, animation: 'breathe' },
};

// Map age groups to orb complexity
const AGE_COMPLEXITY: Record<string, number> = {
  '18-24': 2,
  '25-34': 3,
  '35-44': 4,
  '45-54': 5,
  '55+': 6,
};

// Map personality traits to threads
const PERSONALITY_THREAD_MAP: Record<string, { color: string; layer: number; animation: 'pulse' | 'wave' | 'orbit' | 'spiral' | 'breathe' }> = {
  // Decision style
  'analytical': { color: '200 80% 50%', layer: 0, animation: 'wave' },
  'intuitive': { color: '270 70% 50%', layer: 0, animation: 'breathe' },
  'decisive': { color: '15 85% 55%', layer: 0, animation: 'pulse' },
  // Energy pattern
  'morning': { color: '45 85% 55%', layer: 1, animation: 'spiral' },
  'evening': { color: '260 60% 50%', layer: 1, animation: 'breathe' },
  'fluctuates': { color: '180 65% 50%', layer: 1, animation: 'wave' },
  // Work style
  'structured': { color: '210 70% 52%', layer: 1, animation: 'wave' },
  'flexible': { color: '155 60% 50%', layer: 1, animation: 'orbit' },
  'balanced': { color: '175 65% 48%', layer: 1, animation: 'wave' },
};

interface JourneyData {
  hobbies: string[];
  age: string;
  personality: string[];
  growthAreas: string[];
  focusAreas: string[];
  lifestyle: Record<string, string>;
  completedSteps: number;
}

function parseStorageData(): JourneyData {
  const data: JourneyData = {
    hobbies: [],
    age: '',
    personality: [],
    growthAreas: [],
    focusAreas: [],
    lifestyle: {},
    completedSteps: 0,
  };

  try {
    // Welcome quiz
    const welcomeRaw = localStorage.getItem(STORAGE_KEYS.welcomeQuiz);
    if (welcomeRaw) {
      const welcome = JSON.parse(welcomeRaw);
      if (welcome.hobbies) data.hobbies = welcome.hobbies;
      if (welcome.age) data.age = welcome.age;
      data.completedSteps = Math.max(data.completedSteps, 1);
    }

    // Personal profile (step 2)
    const profileRaw = localStorage.getItem(STORAGE_KEYS.personalProfile);
    if (profileRaw) {
      const profile = JSON.parse(profileRaw);
      if (profile.hobbies) data.hobbies = [...new Set([...data.hobbies, ...profile.hobbies])];
      if (profile.age) data.age = profile.age;
      if (profile.personality_type) data.personality.push(profile.personality_type);
      if (profile.decision_style) data.personality.push(profile.decision_style);
      if (profile.energy_pattern) data.personality.push(profile.energy_pattern);
      if (profile.work_style) data.personality.push(profile.work_style);
      data.completedSteps = Math.max(data.completedSteps, 2);
    }

    // Lifestyle routine (step 3)
    const lifestyleRaw = localStorage.getItem(STORAGE_KEYS.lifestyleRoutine);
    if (lifestyleRaw) {
      const lifestyle = JSON.parse(lifestyleRaw);
      data.lifestyle = lifestyle;
      // Extract personality hints from lifestyle
      if (lifestyle.peak_productivity) {
        if (lifestyle.peak_productivity.includes('morning') || lifestyle.peak_productivity.includes('early')) {
          data.personality.push('morning');
        } else if (lifestyle.peak_productivity.includes('evening') || lifestyle.peak_productivity.includes('night')) {
          data.personality.push('evening');
        }
      }
      data.completedSteps = Math.max(data.completedSteps, 3);
    }

    // Growth deep dive (step 4)
    const deepDiveRaw = localStorage.getItem(STORAGE_KEYS.growthDeepDive);
    if (deepDiveRaw) {
      const deepDive = JSON.parse(deepDiveRaw);
      if (deepDive.answers) {
        Object.values(deepDive.answers).forEach((answers: unknown) => {
          if (Array.isArray(answers)) {
            data.growthAreas.push(...answers.slice(0, 3));
          }
        });
      }
      data.completedSteps = Math.max(data.completedSteps, 4);
    }

    // Focus areas (step 8)
    const focusRaw = localStorage.getItem(STORAGE_KEYS.focusAreas);
    if (focusRaw) {
      const focus = JSON.parse(focusRaw);
      if (focus.focus_areas) data.focusAreas = focus.focus_areas;
      data.completedSteps = Math.max(data.completedSteps, 8);
    }

    // First week (step 9)
    const firstWeekRaw = localStorage.getItem(STORAGE_KEYS.firstWeek);
    if (firstWeekRaw) {
      data.completedSteps = Math.max(data.completedSteps, 9);
    }

  } catch (e) {
    console.error('Error parsing journey storage:', e);
  }

  return data;
}

function generateLiveThreads(journeyData: JourneyData): OrbDNAThread[] {
  const threads: OrbDNAThread[] = [];
  let threadIndex = 0;

  // Add hobby threads (layer 0 - core)
  journeyData.hobbies.slice(0, 4).forEach((hobby) => {
    const mapping = HOBBY_COLOR_MAP[hobby];
    if (mapping) {
      threads.push({
        id: `live-hobby-${threadIndex}`,
        label: hobby,
        source: 'hobby',
        color: `${mapping.hue} 75% 52%`,
        intensity: 0.9 - threadIndex * 0.1,
        animation: mapping.animation,
        layer: 0,
        rotationAxis: {
          x: Math.sin(threadIndex * 1.7),
          y: Math.cos(threadIndex * 2.3),
          z: Math.sin(threadIndex * 0.8),
        },
        rotationSpeed: 0.003 + threadIndex * 0.001,
      });
      threadIndex++;
    }
  });

  // Add personality threads (layer 1 - inner)
  const uniquePersonality = [...new Set(journeyData.personality)];
  uniquePersonality.slice(0, 3).forEach((trait) => {
    const mapping = PERSONALITY_THREAD_MAP[trait];
    if (mapping) {
      threads.push({
        id: `live-personality-${threadIndex}`,
        label: trait,
        source: 'trait',
        color: mapping.color,
        intensity: 0.7 - (threadIndex - journeyData.hobbies.length) * 0.1,
        animation: mapping.animation,
        layer: mapping.layer,
        rotationAxis: {
          x: Math.cos(threadIndex * 1.2),
          y: Math.sin(threadIndex * 1.8),
          z: Math.cos(threadIndex * 0.6),
        },
        rotationSpeed: 0.004,
      });
      threadIndex++;
    }
  });

  // Add growth area threads (layer 2 - outer, aspirational)
  journeyData.growthAreas.slice(0, 3).forEach((area, i) => {
    const hue = (area.charCodeAt(0) * 17 + area.charCodeAt(1) * 23) % 360;
    threads.push({
      id: `live-growth-${threadIndex}`,
      label: area,
      source: 'growth_edge',
      color: `${hue} 65% 58%`,
      intensity: 0.5 - i * 0.1,
      animation: 'breathe',
      layer: 2,
      rotationAxis: {
        x: Math.sin(threadIndex * 0.9),
        y: Math.cos(threadIndex * 1.4),
        z: Math.sin(threadIndex * 2.1),
      },
      rotationSpeed: 0.002,
    });
    threadIndex++;
  });

  // Add focus area threads (layer 3 - outer glow)
  journeyData.focusAreas.slice(0, 3).forEach((area, i) => {
    const hue = (area.charCodeAt(0) * 31 + (area.charCodeAt(1) || 50) * 13) % 360;
    threads.push({
      id: `live-focus-${threadIndex}`,
      label: area,
      source: 'strength',
      color: `${hue} 70% 55%`,
      intensity: 0.4 - i * 0.08,
      animation: 'orbit',
      layer: 3,
      rotationAxis: {
        x: Math.cos(threadIndex * 1.1),
        y: Math.sin(threadIndex * 0.7),
        z: Math.cos(threadIndex * 1.9),
      },
      rotationSpeed: 0.0025,
    });
    threadIndex++;
  });

  return threads;
}

export function useLiveOrbProfile() {
  const { user } = useAuth();
  const { progress, currentStep } = useLaunchpadProgress();
  const [storageVersion, setStorageVersion] = useState(0);

  // Listen for localStorage changes
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key && Object.values(STORAGE_KEYS).includes(e.key)) {
        setStorageVersion(v => v + 1);
      }
    };

    // Also poll periodically during journey for real-time updates
    const interval = setInterval(() => {
      setStorageVersion(v => v + 1);
    }, 2000);

    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      clearInterval(interval);
    };
  }, []);

  // Parse journey data from localStorage and DB progress
  const journeyData = useMemo(() => {
    // Parse localStorage data
    const localData = parseStorageData();
    
    // Merge with DB progress if available
    if (progress) {
      const profileData = progress.step_2_profile_data as Record<string, unknown> | null;
      if (profileData?.hobbies && Array.isArray(profileData.hobbies)) {
        localData.hobbies = [...new Set([...localData.hobbies, ...profileData.hobbies])];
      }
      if (profileData?.age) localData.age = profileData.age as string;
      
      const focusAreas = progress.step_5_focus_areas_selected;
      if (focusAreas && Array.isArray(focusAreas)) {
        localData.focusAreas = [...new Set([...localData.focusAreas, ...focusAreas])];
      }
      
      localData.completedSteps = Math.max(localData.completedSteps, currentStep - 1);
    }
    
    return localData;
  }, [progress, currentStep, storageVersion]);

  // Generate live profile
  const liveProfile = useMemo((): MultiThreadOrbProfile => {
    const threads = generateLiveThreads(journeyData);
    
    // If no data yet, return default
    if (threads.length === 0) {
      return DEFAULT_MULTI_THREAD_PROFILE;
    }

    // Calculate complexity from age
    const complexity = AGE_COMPLEXITY[journeyData.age] || 3;
    
    // Get dominant color from first thread
    const dominantColor = threads[0]?.color || '200 80% 50%';
    const dominantColors = threads.slice(0, 3).map(t => t.color);

    // Calculate base geometry from step progress
    const consciousnessLevel = Math.min(100, 30 + journeyData.completedSteps * 8);
    let baseGeometry: 'octahedron' | 'icosahedron' | 'dodecahedron' | 'sphere' | 'torus' = 'octahedron';
    if (journeyData.completedSteps >= 9) baseGeometry = 'sphere';
    else if (journeyData.completedSteps >= 6) baseGeometry = 'dodecahedron';
    else if (journeyData.completedSteps >= 3) baseGeometry = 'icosahedron';

    return {
      threads,
      shape: {
        baseGeometry,
        edgeSharpness: 0.4 + journeyData.completedSteps * 0.05,
        symmetry: 0.5 + journeyData.completedSteps * 0.04,
        organicFlow: 0.4 + journeyData.completedSteps * 0.05,
        complexity,
      },
      coreGlow: {
        color: dominantColor,
        intensity: 0.5 + journeyData.completedSteps * 0.05,
        pulseRate: 1.0 + journeyData.completedSteps * 0.1,
      },
      motionProfile: {
        speed: 0.8 + journeyData.completedSteps * 0.1,
        pulseRate: 1.0 + journeyData.completedSteps * 0.15,
        reactivity: 0.4 + journeyData.completedSteps * 0.06,
        smoothness: 0.5 + journeyData.completedSteps * 0.04,
      },
      consciousnessLevel,
      dominantColors,
    };
  }, [journeyData]);

  // Check if we're in an active journey
  const isInJourney = useMemo(() => {
    return currentStep > 1 && currentStep <= 11;
  }, [currentStep]);

  // Check if orb has any personalization
  const hasPersonalization = useMemo(() => {
    return journeyData.hobbies.length > 0 || 
           journeyData.personality.length > 0 || 
           journeyData.focusAreas.length > 0;
  }, [journeyData]);

  return {
    profile: liveProfile,
    isInJourney,
    hasPersonalization,
    completedSteps: journeyData.completedSteps,
    threadCount: liveProfile.threads.length,
  };
}
