# MindOS — Full Component & Architecture Dump
> Generated: 2026-03-03 | Total: 37 Modals · 280+ Components · 58 Pages · 93 Hooks · 9 Contexts · 50 UI Primitives · 56 Edge Functions

---

## 1. MODALS (37)

| # | Modal | File | Purpose |
|---|-------|------|---------|
| 1 | ExecutionModal | `components/dashboard/ExecutionModal.tsx` | 6-template action wizard (tts_guided, video_embed, sets_reps_timer, step_by_step, timer_focus, social_checklist) |
| 2 | HypnosisModal | `components/dashboard/HypnosisModal.tsx` | AI hypnosis player with karaoke text + breathing guide |
| 3 | DailyPrioritiesModal | `components/dashboard/DailyPrioritiesModal.tsx` | Set/edit daily priority items |
| 4 | DiagnosticsModal | `components/dashboard/DiagnosticsModal.tsx` | View system diagnostics |
| 5 | DashboardModal | `components/dashboard/DashboardModal.tsx` | Generic dashboard modal wrapper |
| 6 | MergedModals | `components/dashboard/MergedModals.tsx` | Consolidated modal container |
| 7 | MilestoneDetailModal | `components/dashboard/MilestoneDetailModal.tsx` | View/execute milestone details |
| 8 | PillarSynthesisModal | `components/dashboard/PillarSynthesisModal.tsx` | Auto-triggered when all 14 assessments complete → generates 100-day plan |
| 9 | ProfileModal | `components/dashboard/ProfileModal.tsx` | User profile viewer |
| 10 | RecalibrateModal | `components/dashboard/RecalibrateModal.tsx` | Recalibrate strategy/plan |
| 11 | SkillDetailModal | `components/dashboard/SkillDetailModal.tsx` | Individual skill tree detail |
| 12 | AddItemWizard | `components/plate/AddItemWizard.tsx` | Add new action/habit/task to plate |
| 13 | DomainAssessModal | `components/domain-assess/DomainAssessModal.tsx` | Conversational pillar assessment |
| 14 | PillarSelectionModal | `components/pillars/PillarSelectionModal.tsx` | Select pillar for actions |
| 15 | PillarModal | `components/missions/PillarModal.tsx` | Pillar info + 3 mission roadmap cards |
| 16 | MissionModal | `components/missions/MissionModal.tsx` | Mission detail & execution |
| 17 | MiniMilestoneModal | `components/missions/MiniMilestoneModal.tsx` | Mini-milestone detail |
| 18 | OrbDNAModal | `components/gamification/OrbDNAModal.tsx` | Orb DNA / trait viewer |
| 19 | SkillsModal | `components/modals/SkillsModal.tsx` | Skills overview modal |
| 20 | EnergySpendModal | `components/energy/EnergySpendModal.tsx` | Spend energy tokens |
| 21 | SettingsModal | `components/settings/SettingsModal.tsx` | App settings (tabs inside) |
| 22 | AuthModal | `components/auth/AuthModal.tsx` | Login/signup flow |
| 23 | AuthModal (legacy) | `components/AuthModal.tsx` | Root-level auth modal wrapper |
| 24 | CheckoutDialog | `components/checkout/CheckoutDialog.tsx` | Product checkout |
| 25 | SubscriptionCheckoutDialog | `components/checkout/SubscriptionCheckoutDialog.tsx` | Subscription purchase |
| 26 | PersonalHypnosisCheckoutDialog | `components/checkout/PersonalHypnosisCheckoutDialog.tsx` | Personal hypnosis purchase |
| 27 | SubscriptionsModal | `components/subscription/SubscriptionsModal.tsx` | Plans & pricing |
| 28 | PromoUpgradeModal | `components/subscription/PromoUpgradeModal.tsx` | Promo upgrade CTA |
| 29 | UpgradePromptModal | `components/subscription/UpgradePromptModal.tsx` | Upgrade gate prompt |
| 30 | ProGateOverlay | `components/subscription/ProGateOverlay.tsx` | Feature gate overlay |
| 31 | AddProjectWizard | `components/projects/AddProjectWizard.tsx` | Create new project |
| 32 | ProjectDetailModal | `components/projects/ProjectDetailModal.tsx` | Project detail viewer |
| 33 | AutoPlanEngineModal | `components/coach/AutoPlanEngineModal.tsx` | AI coaching plan generator |
| 34 | CoachesModal | `components/coaches/CoachesModal.tsx` | Browse coaches |
| 35 | CreateThreadModal | `components/community/CreateThreadModal.tsx` | New community thread |
| 36 | SuggestTopicModal | `components/community/SuggestTopicModal.tsx` | Suggest community topic |
| 37 | AddToPlanModal | `components/community/AddToPlanModal.tsx` | Add community item to plan |

---

## 2. PAGES (58)

### Root Pages
| Page | File | Route |
|------|------|-------|
| Index (Landing) | `pages/Index.tsx` | `/` |
| UserDashboard | `pages/UserDashboard.tsx` | `/dashboard` |
| LifeHub | `pages/LifeHub.tsx` | `/life` |
| ArenaHub | `pages/ArenaHub.tsx` | `/arena` |
| Community | `pages/Community.tsx` | `/community` |
| Learn | `pages/Learn.tsx` | `/learn` |
| CoachHub | `pages/CoachHub.tsx` | `/coaches` |
| Coaches | `pages/Coaches.tsx` | `/coaches` (public) |
| AdminHub | `pages/AdminHub.tsx` | `/admin-hub` |
| Subscriptions | `pages/Subscriptions.tsx` | `/subscriptions` |
| Projects | `pages/Projects.tsx` | `/projects` |
| Messages | `pages/Messages.tsx` | `/messages` |
| MessageThread | `pages/MessageThread.tsx` | `/messages/:id` |
| Courses | `pages/Courses.tsx` | `/courses` |
| CourseDetail | `pages/CourseDetail.tsx` | `/courses/:id` |
| CourseWatch | `pages/CourseWatch.tsx` | `/courses/:id/watch` |
| Onboarding | `pages/Onboarding.tsx` | `/onboarding` |
| Install | `pages/Install.tsx` | `/install` |
| NotFound | `pages/NotFound.tsx` | `*` |

### Domain Pages
| Page | File | Route |
|------|------|-------|
| LifeDomainPage | `pages/LifeDomainPage.tsx` | `/life/:domainId` |
| ArenaDomainPage | `pages/ArenaDomainPage.tsx` | `/arena/:domainId` |

### Pillar Sub-pages (6 directories)
- `pages/combat/` — Combat pillar views
- `pages/consciousness/` — Consciousness pillar views
- `pages/expansion/` — Expansion pillar views
- `pages/focus/` — Focus pillar views
- `pages/power/` — Power pillar views
- `pages/presence/` — Presence/Image pillar views
- `pages/vitality/` — Vitality pillar views

### Journey Pages
| Page | File |
|------|------|
| BusinessJourney | `pages/BusinessJourney.tsx` |
| BusinessDashboard | `pages/BusinessDashboard.tsx` |
| Business | `pages/Business.tsx` |
| CoachingJourney | `pages/CoachingJourney.tsx` |
| ProjectsJourney | `pages/ProjectsJourney.tsx` |
| AdminJourney | `pages/AdminJourney.tsx` |

### Consciousness Leap Funnel
| Page | File |
|------|------|
| ConsciousnessLeapLanding | `pages/ConsciousnessLeapLanding.tsx` |
| ConsciousnessLeapApply | `pages/ConsciousnessLeapApply.tsx` |

### Hypnosis Funnel
| Page | File |
|------|------|
| PersonalHypnosisLanding | `pages/PersonalHypnosisLanding.tsx` |
| PersonalHypnosisPending | `pages/PersonalHypnosisPending.tsx` |
| PersonalHypnosisSuccess | `pages/PersonalHypnosisSuccess.tsx` |

### Misc Pages
| Page | File |
|------|------|
| Go (affiliate redirect) | `pages/Go.tsx` |
| AffiliateSignup | `pages/AffiliateSignup.tsx` |
| DynamicLandingPage | `pages/DynamicLandingPage.tsx` |
| FeatureDetailPage | `pages/FeatureDetailPage.tsx` |
| FormView | `pages/FormView.tsx` |
| LaunchpadComplete | `pages/LaunchpadComplete.tsx` |
| PractitionerProfile | `pages/PractitionerProfile.tsx` |
| QuestRunnerPage | `pages/QuestRunnerPage.tsx` |
| Success | `pages/Success.tsx` |
| AudioPlayer | `pages/AudioPlayer.tsx` |
| VideoPlayer | `pages/VideoPlayer.tsx` |
| PrivacyPolicy | `pages/PrivacyPolicy.tsx` |
| TermsOfService | `pages/TermsOfService.tsx` |
| Unsubscribe | `pages/Unsubscribe.tsx` |

### Admin Sub-pages
- `pages/admin/` — Admin panel sub-views
- `pages/panel/` — Panel views
- `pages/dev/` — Dev tools

---

## 3. COMPONENTS BY DIRECTORY (280+)

### `components/arena/` (4)
- ArenaActivitySidebar.tsx
- ArenaHudSidebar.tsx
- ArenaLayoutWrapper.tsx
- PlaySummaryCard.tsx

### `components/aurora/` (25)
- AuroraAccountDropdown.tsx
- AuroraActionConfirmation.tsx
- AuroraCTAButton.tsx
- AuroraChatArea.tsx
- AuroraChatBubbles.tsx
- AuroraChatInput.tsx
- AuroraChatMessage.tsx
- AuroraChatQuickActions.tsx
- AuroraChecklistCard.tsx
- AuroraChecklistItem.tsx
- AuroraDashboardView.tsx
- AuroraDock.tsx
- AuroraFloatingOrb.tsx
- AuroraHoloOrb.tsx
- AuroraLayout.tsx
- AuroraMessageThread.tsx
- AuroraProfileSettings.tsx
- AuroraTypingIndicator.tsx
- AuroraVoiceMode.tsx
- AuroraWelcome.tsx
- BugReportDialog.tsx
- JourneyChatDock.tsx
- VoiceModeButton.tsx
- VoiceRecordingButton.tsx
- index.ts

### `components/aurora-ui/` (7) — Design System
- GradientCTAButton.tsx
- HeroBanner.tsx
- MetricCard.tsx
- PageShell.tsx
- PillChips.tsx
- PillTabNav.tsx
- SectionHeader.tsx

### `components/dashboard/` (37)
- CommandTimeline.tsx
- DailyPrioritiesModal.tsx
- DailyPulseCard.tsx
- DailyRoadmap.tsx
- DashboardBannerSlider.tsx
- DashboardLayout.tsx
- DashboardLayoutWrapper.tsx
- DashboardModal.tsx
- DashboardModals.tsx
- DashboardSidebar.tsx
- DiagnosticsModal.tsx
- ExecutionModal.tsx
- GlobalChatInput.tsx
- GoalsPopover.tsx
- HudSidebar.tsx
- HypnosisModal.tsx
- JobPanel.tsx
- MergedModals.tsx
- MilestoneDetailModal.tsx
- MobileHeroGrid.tsx
- MotivationalBanner.tsx
- NowSection.tsx
- PillarSynthesisModal.tsx
- ProfileContent.tsx
- ProfileDrawer.tsx
- ProfileModal.tsx
- RecalibrateModal.tsx
- RecalibrationSummary.tsx
- RoadmapSidebar.tsx
- SkillDetailModal.tsx
- SkillsPanel.tsx
- StartSessionButton.tsx
- TasksPopover.tsx

#### `dashboard/missions/` (7)
- DayTaskList.tsx
- MissionCard.tsx
- MissionsRoadmap.tsx
- MonthTimeline.tsx
- TodayFocus.tsx
- WeekCalendarStrip.tsx
- index.ts

#### `dashboard/plan/` (4)
- CommitmentFlow.tsx
- PlanRoadmap.tsx
- SchedulePreview.tsx
- TasksPanel.tsx

#### `dashboard/unified/` (12)
- BehavioralInsightsCard.tsx
- CharacterHUD.tsx
- ChecklistsCard.tsx
- CommitmentsCard.tsx
- ConsciousnessCard.tsx
- CurrentFocusCard.tsx
- DailyAnchorsDisplay.tsx
- DailyHabitsCard.tsx
- IdentityProfileCard.tsx
- SidebarCharacterHUD.tsx
- TraitsCard.tsx
- index.ts

#### `dashboard/v2/` (7)
- LifeAnalysisChart.tsx
- NextActionBanner.tsx
- PlanProgressCard.tsx
- StatsGrid.tsx
- TodaysHabitsCard.tsx
- WeeklyActivityChart.tsx
- index.ts

### `components/domain-assess/` (3)
- DomainAssessChat.tsx
- DomainAssessModal.tsx
- DomainAssessResults.tsx

### `components/execution/` (3)
- MovementScoreCard.tsx
- TodayExecutionSection.tsx
- TodayScheduleCard.tsx

### `components/gamification/` (10)
- AchievementToast.tsx
- EgoStateSelector.tsx
- EnergyBalance.tsx
- GameStatsCard.tsx
- IdentityDisplay.tsx
- LevelProgress.tsx
- OrbDNACard.tsx
- OrbDNAModal.tsx
- StreakCounter.tsx
- index.ts

### `components/hubs/` (3)
- AnalysisProgressBar.tsx
- DailyMilestones.tsx
- HubPillarsList.tsx

### `components/hub-shared/` (5)
- PillarHubLayout.tsx
- PillarStatusCard.tsx
- PillarToolsGrid.tsx
- index.ts
- pillarColors.ts

### `components/life/` (4)
- DomainIntakeFlow.tsx
- LifeActivitySidebar.tsx
- LifeHudSidebar.tsx
- LifeLayoutWrapper.tsx

### `components/missions/` (4)
- MiniMilestoneModal.tsx
- MissionCard.tsx
- MissionModal.tsx
- PillarModal.tsx

### `components/orb/` (11)
- BusinessOrb.tsx
- CSSOrb.tsx
- Orb.tsx
- OrbDebugOverlay.tsx
- OrbFullscreenViewer.tsx
- OrbParticles.tsx
- PersonalizedOrb.tsx
- PresetOrb.tsx
- WebGLOrb.tsx
- index.ts
- types.ts

### `components/coach/` (18)
- AutoPlanEngineModal.tsx
- ClientProfilePanel.tsx
- CoachActivitySidebar.tsx
- CoachAnalyticsTab.tsx
- CoachClientsTab.tsx
- CoachContentTab.tsx
- CoachDashboardOverview.tsx
- CoachDashboardTab.tsx
- CoachHudSidebar.tsx
- CoachLandingPagesTab.tsx
- CoachLeadsTab.tsx
- CoachMarketingTab.tsx
- CoachPlansTab.tsx
- CoachProductsTab.tsx
- CoachSettingsTab.tsx
- CoachSlugRedirect.tsx
- CoachesLayoutWrapper.tsx
- `landing-pages/` (sub-dir)

### `components/coaches/` (8)
- CoachBookingView.tsx
- CoachCard.tsx
- CoachDetailView.tsx
- CoachMiniItemCard.tsx
- CoachReviewSlider.tsx
- CoachesModal.tsx
- FeaturedCoaches.tsx
- index.ts

### `components/community/` (18)
- AddToPlanModal.tsx
- CommunityActivitySidebar.tsx
- CommunityForumBoard.tsx
- CommunityHeader.tsx
- CommunityHudSidebar.tsx
- CommunityLayoutWrapper.tsx
- CommunityMiniProfile.tsx
- CommunityOrb.tsx
- CommunityPlayerCard.tsx
- CommunityPulse.tsx
- CreateThreadModal.tsx
- PillarTabs.tsx
- PillarTopicBoards.tsx
- PlayerAvatar.tsx
- SuggestTopicModal.tsx
- ThreadCard.tsx
- ThreadList.tsx
- UsernameGate.tsx

### `components/admin/` (17+)
- AdminActivitySidebar.tsx
- AdminGrantPurchaseDialog.tsx
- AdminHudSidebar.tsx
- AdminLayoutWrapper.tsx
- AdminPageHeader.tsx
- FileUpload.tsx
- ImageUpload.tsx
- MultiFileUpload.tsx
- NotificationBell.tsx
- NotificationPanel.tsx
- TemplateCoveragePanel.tsx
- `analytics/` (sub-dir)
- `aurora/` (sub-dir)
- `content/` (sub-dir)
- `forms/` (sub-dir)
- `landing/` (sub-dir)
- `newsletter/` (sub-dir)
- `recordings/` (sub-dir)

### `components/subscription/` (4)
- ProGateOverlay.tsx
- PromoUpgradeModal.tsx
- SubscriptionsModal.tsx
- UpgradePromptModal.tsx

### `components/plate/` (3)
- AddItemWizard.tsx
- PlateItemCard.tsx
- UserPlateGrid.tsx

### `components/energy/` (2)
- EnergyHistory.tsx
- EnergySpendModal.tsx

### `components/projects/` (7)
- AddProjectWizard.tsx
- PlayProjectFields.tsx
- ProjectCard.tsx
- ProjectDetailModal.tsx
- ProjectsActivitySidebar.tsx
- ProjectsHudSidebar.tsx
- ProjectsLayoutWrapper.tsx

### `components/profile/` (8)
- ProfileActions.tsx
- ProfileActivity.tsx
- ProfileAurora.tsx
- ProfileHeader.tsx
- ProfileOverview.tsx
- ProfilePurchases.tsx
- ProfileTabs.tsx
- index.ts

### `components/onboarding/` (3)
- OnboardingFlow.tsx
- OnboardingIntro.tsx
- OnboardingReveal.tsx

### `components/launchpad/` (3+)
- AIAnalysisDisplay.tsx
- LaunchpadProgress.tsx
- index.ts
- `summary/` (sub-dir)

### `components/presence/` (11)
- ComponentCard.tsx
- DeltaView.tsx
- DirectModeToggle.tsx
- FindingsList.tsx
- FixLibrary.tsx
- GuidedCapture.tsx
- LeveragePoints.tsx
- PresenceIndex.tsx
- PresenceResults.tsx
- PrivacyConsent.tsx
- TopPriorities.tsx

### `components/hypnosis/` (5)
- BreathingGuide.tsx
- KaraokeText.tsx
- RecentSessions.tsx
- SessionStats.tsx
- index.ts

### `components/landing/` (9)
- DynamicBenefits.tsx
- DynamicCTA.tsx
- DynamicFAQ.tsx
- DynamicForWho.tsx
- DynamicHero.tsx
- DynamicPainPoints.tsx
- DynamicProcess.tsx
- DynamicTestimonials.tsx
- index.ts

### `components/home/` (14)
- AuroraCoachSection.tsx
- FearOfMissingOutSection.tsx
- FeatureShowcaseSection.tsx
- FinalCTASection.tsx
- FreeJourneyBannerSection.tsx
- GameHeroSection.tsx
- HandsFreeSection.tsx
- HowItWorksSection.tsx
- LifePillarsSection.tsx
- SystemArchitectureSection.tsx
- TransformationJourneySection.tsx
- TransformationProofSection.tsx
- TwoWorldsSection.tsx
- WhyChooseUsSection.tsx
- index.ts

### `components/learn/` (4)
- CurriculumWizard.tsx
- LearnCurriculumSidebar.tsx
- LessonFocusSession.tsx
- LessonViewer.tsx

### `components/courses/` (4)
- CourseCard.tsx
- CourseCurriculum.tsx
- CourseFilters.tsx
- OfferCard.tsx

### `components/checkout/` (3)
- CheckoutDialog.tsx
- PersonalHypnosisCheckoutDialog.tsx
- SubscriptionCheckoutDialog.tsx

### `components/business/` (3)
- BusinessCard.tsx
- BusinessDashboardModals.tsx
- BusinessHUD.tsx

### `components/flow/` (3)
- FlowProgress.tsx
- FlowRenderer.tsx
- QuestionCard.tsx

### `components/messages/` (3)
- ConversationItem.tsx
- MessageBubble.tsx
- NewMessageDialog.tsx

### `components/pdf/` (14)
- GuestPDFRenderer.tsx
- PDFBehavioralPage.tsx
- PDFConsciousnessPage.tsx
- PDFCoverPage.tsx
- PDFDashboardPage.tsx
- PDFHawkinsPage.tsx
- PDFIdentityPage.tsx
- PDFLifeDirectionPage.tsx
- PDFLifePlanPage.tsx
- PDFOrbPage.tsx
- PDFScoresPage.tsx
- ProfilePDFRenderer.tsx
- index.ts
- usePDFCapture.ts

### `components/navigation/` (4)
- AppNameDropdown.tsx
- BottomTabBar.tsx
- HeaderActions.tsx
- TopNavBar.tsx

### `components/layout/` (1)
- ProtectedAppShell.tsx

### `components/sidebar/` (1)
- SidebarOrbWidget.tsx

### `components/settings/` (2+)
- SettingsModal.tsx
- index.ts
- `tabs/` (sub-dir)

### `components/icons/` (1)
- AuroraOrbIcon.tsx

### `components/pillars/` (1)
- PillarSelectionModal.tsx

### `components/modals/` (1)
- SkillsModal.tsx

### `components/auth/` (1)
- AuthModal.tsx

### Root-level Components (32)
- AdminRoute.tsx
- AffiliateTracker.tsx
- AnalyticsProvider.tsx
- AuthModal.tsx
- BookingCalendar.tsx
- BugReportWidget.tsx
- ConsciousnessField.tsx
- CookieConsent.tsx
- EpisodeViewer.tsx
- ErrorBoundary.tsx
- FlowAuditProvider.tsx
- Footer.tsx
- FormProgressBar.tsx
- Header.tsx
- LanguagePrompt.tsx
- LeadCaptureDialog.tsx
- LeadCaptureForm.tsx
- MatrixRain.tsx
- NotificationPermissionPrompt.tsx
- PWAInstallBanner.tsx
- PWAInstallModal.tsx
- PWAUpdatePrompt.tsx
- ProtectedRoute.tsx
- PullToRefreshIndicator.tsx
- ResourcesDownload.tsx
- RoleRoute.tsx
- ThemeProvider.tsx
- UserNotificationBell.tsx
- UserNotificationPanel.tsx
- VideoPlayer.tsx

---

## 4. HOOKS (93)

### Core Hooks
| Hook | File |
|------|------|
| useActionItems | `hooks/useActionItems.ts` |
| useNowEngine | `hooks/useNowEngine.ts` |
| useGameState | `hooks/useGameState.ts` |
| useStrategyPlans | `hooks/useStrategyPlans.ts` |
| useLifeDomains | `hooks/useLifeDomains.ts` |
| useLifePlan | `hooks/useLifePlan.ts` |
| useMissionsRoadmap | `hooks/useMissionsRoadmap.ts` |
| useTodayExecution | `hooks/useTodayExecution.ts` |
| useTodaysHabits | `hooks/useTodaysHabits.ts` |
| useSkillsProgress | `hooks/useSkillsProgress.ts` |
| useUnifiedDashboard | `hooks/useUnifiedDashboard.ts` |
| useDailyPriorities | `hooks/useDailyPriorities.ts` |
| useDailyPulse | `hooks/useDailyPulse.ts` |
| useWeeklyActivity | `hooks/useWeeklyActivity.ts` |
| useLifeAnalysis | `hooks/useLifeAnalysis.ts` |

### Auth & User
| Hook | File |
|------|------|
| useUserProfile | `hooks/useUserProfile.ts` |
| useUserRoles | `hooks/useUserRoles.ts` |
| useUserJob | `hooks/useUserJob.ts` |
| useUserPlate | `hooks/useUserPlate.ts` |
| useUserPurchases | `hooks/useUserPurchases.ts` |
| useUserNotifications | `hooks/useUserNotifications.ts` |
| useSubscriptionGate | `hooks/useSubscriptionGate.ts` |

### Pillar Coaches
| Hook | File |
|------|------|
| useCombatCoach | `hooks/useCombatCoach.ts` |
| useConsciousnessCoach | `hooks/useConsciousnessCoach.ts` |
| useExpansionCoach | `hooks/useExpansionCoach.ts` |
| useFocusCoach | `hooks/useFocusCoach.ts` |
| usePresenceCoach | `hooks/usePresenceCoach.ts` |
| useVitalityEngine | `hooks/useVitalityEngine.ts` |

### Domain & Assessment
| Hook | File |
|------|------|
| useDomainAssessment | `hooks/useDomainAssessment.ts` |
| usePillarAccess | `hooks/usePillarAccess.ts` |
| usePillarContext | `hooks/usePillarContext.ts` |
| useAllDomainsComplete | `hooks/useAllDomainsComplete.ts` |
| usePresenceScans | `hooks/usePresenceScans.ts` |

### Business & Coach
| Hook | File |
|------|------|
| useBusinessJourneys | `hooks/useBusinessJourneys.ts` |
| useBusinessJourneyProgress | `hooks/useBusinessJourneyProgress.ts` |
| useBusinessPlan | `hooks/useBusinessPlan.ts` |
| useBusinessBranding | `hooks/useBusinessBranding.ts` |
| useBusinessOrbProfile | `hooks/useBusinessOrbProfile.ts` |
| useCoachClients | `hooks/useCoachClients.ts` |
| useCoachClientView | `hooks/useCoachClientView.ts` |
| useCoachLeads | `hooks/useCoachLeads.ts` |
| useCoachingJourneyProgress | `hooks/useCoachingJourneyProgress.ts` |
| usePractitioners | `hooks/usePractitioners.ts` |

### Orb & Gamification
| Hook | File |
|------|------|
| useOrbProfile | `hooks/useOrbProfile.ts` |
| useLiveOrbProfile | `hooks/useLiveOrbProfile.ts` |
| useOrbPresetMorph | `hooks/useOrbPresetMorph.ts` |

### Aurora Sub-hooks (`hooks/aurora/`, 17)
- useAuroraChat.tsx
- useAuroraCommands.tsx
- useAuroraReminders.tsx
- useAuroraVoice.tsx
- useAuroraVoiceMode.tsx
- useActionTrust.tsx
- useChecklists.tsx
- useChecklistsData.tsx
- useCommandBus.tsx
- useDailyHabits.tsx
- useDashboard.tsx
- useLifeModel.tsx
- useOnboardingProgress.tsx
- useProactiveAurora.tsx
- useSmartSuggestions.tsx
- useUserContext.tsx
- index.ts

### Journey Hooks (`hooks/journey/`, 3)
- useAutoSave.ts
- utils.ts
- index.ts

### Learn Hooks (`hooks/learn/`, 1)
- useLessonTTS.ts

### Misc Hooks
| Hook | File |
|------|------|
| useTranslation | `hooks/useTranslation.ts` |
| useGenderedTranslation | `hooks/useGenderedTranslation.ts` |
| useSidebars | `hooks/useSidebars.ts` |
| useModalState | `hooks/useModalState.ts` |
| useAnalytics | `hooks/useAnalytics.ts` |
| useSEO | `hooks/useSEO.ts` |
| usePWA | `hooks/usePWA.ts` |
| useHaptics | `hooks/useHaptics.ts` |
| usePullToRefresh | `hooks/usePullToRefresh.tsx` |
| usePushNotifications | `hooks/usePushNotifications.ts` |
| useStorageUrl | `hooks/useStorageUrl.ts` |
| useThemeSettings | `hooks/useThemeSettings.ts` |
| useSiteSettings | `hooks/useSiteSettings.ts` |
| useProductBranding | `hooks/useProductBranding.ts` |
| usePromoPopup | `hooks/usePromoPopup.ts` |
| useConversionEvents | `hooks/useConversionEvents.ts` |
| useUTMTracker | `hooks/useUTMTracker.ts` |
| useBugReport | `hooks/useBugReport.ts` |
| useCommandSchedule | `hooks/useCommandSchedule.ts` |
| useProjects | `hooks/useProjects.ts` |
| useProjectsJourneyProgress | `hooks/useProjectsJourneyProgress.ts` |
| useAdminAuroraInsights | `hooks/useAdminAuroraInsights.ts` |
| useAdminJourneyProgress | `hooks/useAdminJourneyProgress.ts` |
| useAdminNotifications | `hooks/useAdminNotifications.ts` |
| useAdminUserView | `hooks/useAdminUserView.ts` |
| useDailyHypnosis | `hooks/useDailyHypnosis.ts` |
| useEpisodeProgress | `hooks/useEpisodeProgress.ts` |
| useGuestDataMigration | `hooks/useGuestDataMigration.ts` |
| useGuestLaunchpadAutoSave | `hooks/useGuestLaunchpadAutoSave.ts` |
| useGuestLaunchpadProgress | `hooks/useGuestLaunchpadProgress.ts` |
| useGuestPDF | `hooks/useGuestPDF.ts` |
| useLaunchpadAutoSave | `hooks/useLaunchpadAutoSave.ts` |
| useLaunchpadData | `hooks/useLaunchpadData.ts` |
| useLaunchpadProgress | `hooks/useLaunchpadProgress.ts` |
| useProfilePDF | `hooks/useProfilePDF.ts` |
| useCommunityDailyLimit | `hooks/useCommunityDailyLimit.ts` |
| useCommunityFeed | `hooks/useCommunityFeed.ts` |
| useCommunityUsername | `hooks/useCommunityUsername.ts` |
| useUpdateEnrollmentProgress | `hooks/useUpdateEnrollmentProgress.ts` |
| use-mobile | `hooks/use-mobile.tsx` |
| use-toast | `hooks/use-toast.ts` |

---

## 5. CONTEXTS (9)

| Context | File | Purpose |
|---------|------|---------|
| AuthContext | `contexts/AuthContext.tsx` | User auth state, session, profile |
| GameStateContext | `contexts/GameStateContext.tsx` | XP, level, tokens, streaks, energy |
| AuroraChatContext | `contexts/AuroraChatContext.tsx` | Aurora AI chat state, conversations |
| AuroraActionsContext | `contexts/AuroraActionsContext.tsx` | Aurora command bus, action dispatching |
| SidebarContext | `contexts/SidebarContext.tsx` | Left/right sidebar injection |
| LanguageContext | `contexts/LanguageContext.tsx` | i18n language (he/en) + RTL |
| AuthModalContext | `contexts/AuthModalContext.tsx` | Auth modal open/close state |
| CoachesModalContext | `contexts/CoachesModalContext.tsx` | Coaches modal state |
| SubscriptionsModalContext | `contexts/SubscriptionsModalContext.tsx` | Subscriptions modal state |

---

## 6. UI PRIMITIVES — shadcn/ui (50)

`src/components/ui/`:
accordion · alert · alert-dialog · aspect-ratio · avatar · badge · breadcrumb · button · calendar · card · carousel · chart · checkbox · collapsible · command · context-menu · dialog · drawer · dropdown-menu · form · hover-card · input · input-otp · label · menubar · mobile-time-picker · navigation-menu · pagination · popover · progress · radio-group · resizable · scroll-area · select · separator · sheet · sidebar · skeleton · slider · sonner · switch · table · tabs · textarea · toast · toaster · toggle · toggle-group · tooltip · use-toast

---

## 7. EDGE FUNCTIONS (56)

### AI & Generation
| Function | Purpose |
|----------|---------|
| aurora-chat | Main Aurora AI conversation |
| aurora-analyze | Deep analysis of user data |
| aurora-generate-title | Generate conversation titles |
| aurora-proactive | Proactive nudge generation |
| aurora-recalibrate | Recalibrate user strategy |
| aurora-summarize-conversation | Summarize conversations |
| generate-90day-strategy | Create 90-day transformation plan |
| generate-today-queue | NowEngine: daily action queue |
| generate-execution-steps | Execution step templates for actions |
| generate-phase-actions | Lazy phase task generation |
| generate-pillar-synthesis | Synthesize all pillar data into plan |
| generate-first-week-actions | Bootstrap first week tasks |
| generate-daily-quests | Daily quest generation |
| generate-weekly-build | Weekly build report |
| generate-health-plan | Health/vitality plan |
| generate-identity-archetype | Identity archetype analysis |
| generate-curriculum | Course curriculum generation |
| generate-coach-plan | AI coaching plan for clients |
| generate-business-plan | Business milestone plan |
| generate-branding-suggestions | Brand identity suggestions |
| generate-landing-page | Dynamic landing page content |
| generate-launchpad-summary | Launchpad summary |
| generate-analytics-report | Analytics report generation |

### Assessment
| Function | Purpose |
|----------|---------|
| domain-assess | Conversational domain assessment |
| consciousness-assess | Consciousness level assessment |
| analyze-life-plan | Analyze existing life plan |
| analyze-presence | Presence/image analysis |
| analyze-introspection-form | Form introspection analysis |

### Hypnosis & Audio
| Function | Purpose |
|----------|---------|
| ai-hypnosis | Generate AI hypnosis sessions |
| generate-hypnosis-script | Hypnosis script creation |
| cache-hypnosis-audio | Cache generated audio |
| text-to-speech | TTS conversion |
| elevenlabs-tts | ElevenLabs TTS integration |
| elevenlabs-transcribe | Voice transcription |
| get-audio-by-token | Secure audio retrieval |
| get-video-by-token | Secure video retrieval |

### User Data
| Function | Purpose |
|----------|---------|
| get-user-data | Fetch comprehensive user data |
| onboarding-chat | Onboarding conversation flow |
| check-subscription | Verify subscription status |
| add-plate-item | Add item to user plate |

### Payments & Commerce
| Function | Purpose |
|----------|---------|
| create-checkout-session | Stripe checkout session |
| create-coach-checkout | Coach service checkout |
| customer-portal | Stripe customer portal |
| stripe-webhook | Stripe webhook handler |
| admin-grant-purchase | Admin grant purchase access |

### Email & Notifications
| Function | Purpose |
|----------|---------|
| push-notifications | Push notification sender |
| send-welcome-email | Welcome email |
| send-newsletter | Newsletter distribution |
| send-form-pdf-email | PDF form email |
| send-order-confirmation | Order confirmation email |
| send-order-notification | Admin order notification |

### Leads & Funnels
| Function | Purpose |
|----------|---------|
| submit-lead | Generic lead capture |
| submit-consciousness-leap-lead | Consciousness Leap lead |
| submit-consciousness-leap-application | Consciousness Leap application |
| validate-consciousness-leap-token | Token validation |

### Shared
| Directory | Purpose |
|-----------|---------|
| `_shared/` | CORS, context builder, shared utilities |

---

## 8. SERVICES (6)

| Service | File | Purpose |
|---------|------|---------|
| actionItems | `services/actionItems.ts` | CRUD for action_items (SSOT) |
| hypnosis | `services/hypnosis.ts` | Hypnosis session management |
| scheduleBlocks | `services/scheduleBlocks.ts` | Time block scheduling |
| unifiedContext | `services/unifiedContext.ts` | Unified user context builder |
| userMemory | `services/userMemory.ts` | User memory/pattern storage |
| voice | `services/voice.ts` | Voice recording/playback |

---

## 9. NAVIGATION (3)

| File | Purpose |
|------|---------|
| `navigation/osNav.ts` | OS_TABS: Dashboard, Core, Arena, Community, Study (+Coach for practitioners) |
| `navigation/lifeDomains.ts` | 14 pillar registry: CORE_DOMAINS (all 14), getDomainById(), LIFE_DOMAINS |
| `navigation/domainIntakeQuestions.ts` | Assessment question sets per pillar |

---

## 10. UTILITIES (1)

| File | Purpose |
|------|---------|
| `utils/assessmentQuality.ts` | `isAssessmentReady()` validator for pillar completion |

---

## 11. LAYOUT WRAPPERS (Hub → Sidebar Injection)

Each hub uses a LayoutWrapper that injects left (HUD) + right (Activity) sidebars:

| Hub | Wrapper | Left Sidebar | Right Sidebar |
|-----|---------|-------------|---------------|
| Dashboard | DashboardLayoutWrapper | HudSidebar | RoadmapSidebar |
| Core/Life | LifeLayoutWrapper | LifeHudSidebar | LifeActivitySidebar |
| Arena | ArenaLayoutWrapper | ArenaHudSidebar | ArenaActivitySidebar |
| Community | CommunityLayoutWrapper | CommunityHudSidebar | CommunityActivitySidebar |
| Coach | CoachesLayoutWrapper | CoachHudSidebar | CoachActivitySidebar |
| Admin | AdminLayoutWrapper | AdminHudSidebar | AdminActivitySidebar |
| Projects | ProjectsLayoutWrapper | ProjectsHudSidebar | ProjectsActivitySidebar |

---

## 12. WIREFRAMES

**None found.** No wireframe files exist in the project. The term "wireframe" only appears as a 3D mesh rendering property in `WebGLOrb.tsx` and `CSSOrb.tsx`.

---

## 13. KEY ARCHITECTURAL PATTERNS

### Single Source of Truth (SSOT)
- **action_items** table = all execution data (tasks, habits, sessions, milestones, roadmap)
- **life_plans** + plan_missions + life_plan_milestones = strategic planning layer
- **GameStateContext** = XP, level, tokens, streaks, energy (derived from action_items completion)

### Hub Duality
- **Core (/life)** = Assessment + Planning (diagnose → plan → results)
- **Arena (/arena)** = Live Execution (today queue → do it → feedback)

### Execution Flow
1. User assesses pillars via `DomainAssessModal`
2. `generate-90day-strategy` creates strategic plan
3. `generate-today-queue` (NowEngine) produces daily actions
4. `ExecutionModal` guides step-by-step execution (6 templates)
5. `action_items` updated → triggers XP/token rewards → GameState refreshes

### Sidebar Injection Pattern
```
LayoutWrapper → useSidebars(leftContent, rightContent)
  → SidebarContext → ProtectedAppShell renders them
```

### Aurora AI Stack
```
AuroraFloatingOrb (entry point)
  → AuroraDock (expandable chat)
    → AuroraChatArea → AuroraChatBubbles
    → useAuroraChat (conversation management)
    → aurora-chat edge function (AI backend)
    → AuroraActionsContext (command bus)
```
