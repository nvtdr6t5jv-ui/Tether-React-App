import React, { useState, useCallback, useEffect } from "react";
import { View, BackHandler, Modal } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { TodayScreen } from "./TodayScreen";
import { PeopleScreen } from "./PeopleScreen";
import { PersonProfileScreen } from "./PersonProfileScreen";
import { NewConnectionScreen } from "./NewConnectionScreen";
import { EditPersonScreen } from "./EditPersonScreen";
import { CalendarScreen } from "./CalendarScreen";
import { SettingsScreen } from "./SettingsScreen";
import { OrbitSettingsScreen } from "./OrbitSettingsScreen";
import { NotificationsScreen } from "./NotificationsScreen";
import { AppearanceScreen } from "./AppearanceScreen";
import { AnalyticsScreen } from "./AnalyticsScreen";
import { EditProfileScreen } from "./EditProfileScreen";
import { SocialPulseScreen } from "./SocialPulseScreen";
import { InsightsScreen } from "./InsightsScreen";
import { PremiumScreen } from "./PremiumScreen";
import { GamificationScreen } from "./GamificationScreen";
import { BottomTabBar } from "../components/BottomTabBar";
import { SwipeableScreen } from "../components/SwipeableScreen";
import { CompleteActionModal } from "../components/CompleteActionModal";
import { LogConnectionModal } from "../components/LogConnectionModal";
import { useApp } from "../context/AppContext";
import { usePendingAction } from "../context/PendingActionContext";
import { useGamification } from "../context/GamificationContext";
import { useDeepLink } from "../context/DeepLinkContext";

type TabType = "people" | "today" | "calendar" | "insights" | "settings";

type PeopleStack = 
  | { screen: "list" }
  | { screen: "profile"; friendId: string }
  | { screen: "newConnection" }
  | { screen: "editPerson"; friendId: string };

type SettingsStack =
  | { screen: "main" }
  | { screen: "notifications" }
  | { screen: "appearance" }
  | { screen: "analytics" }
  | { screen: "editProfile" }
  | { screen: "premium" }
  | { screen: "orbitSettings" };

type TodayStack =
  | { screen: "main" }
  | { screen: "socialPulse" }
  | { screen: "progress" };

type InsightsStack =
  | { screen: "main" }
  | { screen: "detail" };

type CalendarStack =
  | { screen: "main" };

type PremiumTrigger = 'contact_limit' | 'deep_link' | 'templates' | 'analytics' | 'history' | 'bulk_actions' | 'general';

export const MainTabsScreen = () => {
  const { resetApp, logInteraction, updateInteraction, interactions, friends } = useApp();
  const { pendingAction, showCompleteModal, setShowCompleteModal, clearPendingAction } = usePendingAction();
  const { recordDailyActivity, checkAndUpdateAchievements, updateChallengeProgress, state: gamificationState, streakData } = useGamification();
  const [activeTab, setActiveTab] = useState<TabType>("today");
  
  const [peopleStack, setPeopleStack] = useState<PeopleStack>({ screen: "list" });
  const [settingsStack, setSettingsStack] = useState<SettingsStack>({ screen: "main" });
  const [todayStack, setTodayStack] = useState<TodayStack>({ screen: "main" });
  const [insightsStack, setInsightsStack] = useState<InsightsStack>({ screen: "main" });
  const [calendarStack, setCalendarStack] = useState<CalendarStack>({ screen: "main" });
  const [showPremium, setShowPremium] = useState(false);
  const [premiumTrigger, setPremiumTrigger] = useState<PremiumTrigger>('general');
  const [showQuickLogModal, setShowQuickLogModal] = useState(false);
  
  const { pendingDeepLink, clearDeepLink } = useDeepLink();

  useEffect(() => {
    if (pendingDeepLink) {
      switch (pendingDeepLink.route) {
        case 'today':
          setActiveTab('today');
          setTodayStack({ screen: 'main' });
          break;
        case 'people':
          setActiveTab('people');
          setPeopleStack({ screen: 'list' });
          break;
        case 'calendar':
          setActiveTab('calendar');
          break;
        case 'insights':
          setActiveTab('insights');
          break;
        case 'settings':
          setActiveTab('settings');
          setSettingsStack({ screen: 'main' });
          break;
        case 'progress':
        case 'garden':
          setActiveTab('today');
          setTodayStack({ screen: 'progress' });
          break;
        case 'quicklog':
          setActiveTab('today');
          setTodayStack({ screen: 'main' });
          setTimeout(() => setShowQuickLogModal(true), 300);
          break;
        case 'profile':
          if (pendingDeepLink.params?.id) {
            setActiveTab('people');
            setPeopleStack({ screen: 'profile', friendId: pendingDeepLink.params.id });
          }
          break;
      }
      clearDeepLink();
    }
  }, [pendingDeepLink, clearDeepLink]);

  const showPremiumModal = (trigger: PremiumTrigger = 'general') => {
    setPremiumTrigger(trigger);
    setShowPremium(true);
  };

  const handleCompleteAction = async (type: string, note: string, outcome: 'completed' | 'no_response' | 'voicemail') => {
    if (!pendingAction) return;
    
    const finalNote = outcome === 'no_response' 
      ? 'No response' 
      : outcome === 'voicemail' 
        ? 'Left voicemail' 
        : note || `Quick ${type}`;
    
    await logInteraction(pendingAction.friendId, type as any, finalNote);
    await recordDailyActivity();
    
    const callCount = interactions.filter(i => i.type === 'call').length + (type === 'call' ? 1 : 0);
    const textCount = interactions.filter(i => i.type === 'text').length + (type === 'text' ? 1 : 0);
    const inPersonCount = interactions.filter(i => i.type === 'in_person' || i.type === 'meetup').length;
    
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const weekInteractions = interactions.filter(i => new Date(i.date) >= oneWeekAgo);
    const uniquePeople = new Set(weekInteractions.map(i => i.friendId)).size;
    const completedChallenges = gamificationState.weeklyChallenges.filter(c => c.isCompleted).length;
    
    checkAndUpdateAchievements({
      totalInteractions: interactions.length + 1,
      callCount,
      textCount,
      inPersonCount,
      uniquePeopleThisWeek: uniquePeople,
      reconnections: 0,
      currentStreak: streakData.currentStreak,
      challengesCompleted: completedChallenges,
    });
    
    const challenges = gamificationState.weeklyChallenges;
    if (type === 'call') {
      const callChallenge = challenges.find(c => c.type === 'calls' && !c.isCompleted);
      if (callChallenge) {
        updateChallengeProgress(callChallenge.id, callChallenge.progress + 1);
      }
    }
    if (type === 'text') {
      const textChallenge = challenges.find(c => c.type === 'messages' && !c.isCompleted);
      if (textChallenge) {
        updateChallengeProgress(textChallenge.id, textChallenge.progress + 1);
      }
    }
    
    clearPendingAction();
    setShowCompleteModal(false);
  };

  const handleDiscardAction = () => {
    clearPendingAction();
  };

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (showPremium) {
          setShowPremium(false);
          return true;
        }
        if (activeTab === "today" && todayStack.screen !== "main") {
          setTodayStack({ screen: "main" });
          return true;
        }
        if (activeTab === "people" && peopleStack.screen !== "list") {
          if (peopleStack.screen === "editPerson") {
            setPeopleStack({ screen: "profile", friendId: (peopleStack as any).friendId });
          } else {
            setPeopleStack({ screen: "list" });
          }
          return true;
        }
        if (activeTab === "settings" && settingsStack.screen !== "main") {
          setSettingsStack({ screen: "main" });
          return true;
        }
        if (activeTab === "insights" && insightsStack.screen !== "main") {
          setInsightsStack({ screen: "main" });
          return true;
        }
        if (activeTab !== "today") {
          setActiveTab("today");
          return true;
        }
        return false;
      };

      const subscription = BackHandler.addEventListener("hardwareBackPress", onBackPress);
      return () => subscription.remove();
    }, [activeTab, peopleStack, settingsStack, todayStack, insightsStack, showPremium])
  );

  const handleTabPress = (tab: string) => {
    if (tab === activeTab) {
      if (tab === "today") setTodayStack({ screen: "main" });
      if (tab === "people") setPeopleStack({ screen: "list" });
      if (tab === "settings") setSettingsStack({ screen: "main" });
      if (tab === "insights") setInsightsStack({ screen: "main" });
      if (tab === "calendar") setCalendarStack({ screen: "main" });
    } else {
      setActiveTab(tab as TabType);
    }
  };

  const renderTodayScreen = () => {
    switch (todayStack.screen) {
      case "socialPulse":
        return (
          <SwipeableScreen onSwipeBack={() => setTodayStack({ screen: "main" })}>
            <SocialPulseScreen
              onBack={() => setTodayStack({ screen: "main" })}
              onPremiumRequired={() => showPremiumModal('analytics')}
              onNavigateToGarden={() => setTodayStack({ screen: "progress" })}
            />
          </SwipeableScreen>
        );
      case "progress":
        return (
          <SwipeableScreen onSwipeBack={() => setTodayStack({ screen: "main" })}>
            <GamificationScreen
              onBack={() => setTodayStack({ screen: "main" })}
            />
          </SwipeableScreen>
        );
      case "main":
      default:
        return (
          <TodayScreen
            onNavigate={(screen) => {
              if (screen === "people") {
                setActiveTab("people");
              } else if (screen === "calendar") {
                setActiveTab("calendar");
              }
            }}
            onNavigateToSocialPulse={() => setTodayStack({ screen: "socialPulse" })}
            onNavigateToProgress={() => setTodayStack({ screen: "progress" })}
            onNavigateToProfile={(friendId) => {
              setActiveTab("people");
              setPeopleStack({ screen: "profile", friendId });
            }}
          />
        );
    }
  };

  const renderCalendarScreen = () => {
    return (
      <CalendarScreen
        onNavigateToProfile={(friendId) => {
          setActiveTab("people");
          setPeopleStack({ screen: "profile", friendId });
        }}
      />
    );
  };

  const renderInsightsScreen = () => {
    return (
      <InsightsScreen
        onPremiumRequired={() => showPremiumModal('analytics')}
        onNavigateToProfile={(friendId) => {
          setActiveTab("people");
          setPeopleStack({ screen: "profile", friendId });
        }}
        onNavigateToGarden={() => {
          setActiveTab("today");
          setTodayStack({ screen: "progress" });
        }}
      />
    );
  };

  const renderPeopleScreen = () => {
    switch (peopleStack.screen) {
      case "list":
        return (
          <PeopleScreen
            onNavigateToProfile={(friendId) => setPeopleStack({ screen: "profile", friendId })}
            onNavigateToNewConnection={() => setPeopleStack({ screen: "newConnection" })}
            onPremiumRequired={() => showPremiumModal('contact_limit')}
          />
        );
      case "profile":
        return (
          <SwipeableScreen onSwipeBack={() => setPeopleStack({ screen: "list" })}>
            <PersonProfileScreen
              friendId={peopleStack.friendId}
              onBack={() => setPeopleStack({ screen: "list" })}
              onEdit={(friendId) => setPeopleStack({ screen: "editPerson", friendId })}
              onPremiumRequired={(trigger) => showPremiumModal(trigger as PremiumTrigger)}
            />
          </SwipeableScreen>
        );
      case "newConnection":
        return (
          <SwipeableScreen onSwipeBack={() => setPeopleStack({ screen: "list" })}>
            <NewConnectionScreen
              onBack={() => setPeopleStack({ screen: "list" })}
              onSave={(friendId) => setPeopleStack({ screen: "profile", friendId })}
              onPremiumRequired={() => showPremiumModal('contact_limit')}
            />
          </SwipeableScreen>
        );
      case "editPerson":
        return (
          <SwipeableScreen onSwipeBack={() => setPeopleStack({ screen: "profile", friendId: peopleStack.friendId })}>
            <EditPersonScreen
              friendId={peopleStack.friendId}
              onBack={() => setPeopleStack({ screen: "profile", friendId: peopleStack.friendId })}
              onSave={() => setPeopleStack({ screen: "profile", friendId: peopleStack.friendId })}
            />
          </SwipeableScreen>
        );
      default:
        return (
          <PeopleScreen
            onNavigateToProfile={(friendId) => setPeopleStack({ screen: "profile", friendId })}
            onNavigateToNewConnection={() => setPeopleStack({ screen: "newConnection" })}
          />
        );
    }
  };

  const renderSettingsScreen = () => {
    switch (settingsStack.screen) {
      case "main":
        return (
          <SettingsScreen
            onNavigateToNotifications={() => setSettingsStack({ screen: "notifications" })}
            onNavigateToAppearance={() => setSettingsStack({ screen: "appearance" })}
            onNavigateToAnalytics={() => setSettingsStack({ screen: "analytics" })}
            onNavigateToEditProfile={() => setSettingsStack({ screen: "editProfile" })}
            onNavigateToPremium={() => setShowPremium(true)}
            onNavigateToOrbitSettings={() => setSettingsStack({ screen: "orbitSettings" })}
            onLogout={async () => {
              await resetApp();
            }}
          />
        );
      case "notifications":
        return (
          <SwipeableScreen onSwipeBack={() => setSettingsStack({ screen: "main" })}>
            <NotificationsScreen
              onBack={() => setSettingsStack({ screen: "main" })}
            />
          </SwipeableScreen>
        );
      case "appearance":
        return (
          <SwipeableScreen onSwipeBack={() => setSettingsStack({ screen: "main" })}>
            <AppearanceScreen
              onBack={() => setSettingsStack({ screen: "main" })}
            />
          </SwipeableScreen>
        );
      case "analytics":
        return (
          <SwipeableScreen onSwipeBack={() => setSettingsStack({ screen: "main" })}>
            <AnalyticsScreen
              onBack={() => setSettingsStack({ screen: "main" })}
            />
          </SwipeableScreen>
        );
      case "editProfile":
        return (
          <SwipeableScreen onSwipeBack={() => setSettingsStack({ screen: "main" })}>
            <EditProfileScreen
              onBack={() => setSettingsStack({ screen: "main" })}
              onSave={() => setSettingsStack({ screen: "main" })}
            />
          </SwipeableScreen>
        );
      case "orbitSettings":
        return (
          <SwipeableScreen onSwipeBack={() => setSettingsStack({ screen: "main" })}>
            <OrbitSettingsScreen
              onBack={() => setSettingsStack({ screen: "main" })}
            />
          </SwipeableScreen>
        );
      default:
        return (
          <SettingsScreen
            onNavigateToNotifications={() => setSettingsStack({ screen: "notifications" })}
            onNavigateToAppearance={() => setSettingsStack({ screen: "appearance" })}
            onNavigateToAnalytics={() => setSettingsStack({ screen: "analytics" })}
            onNavigateToEditProfile={() => setSettingsStack({ screen: "editProfile" })}
            onNavigateToPremium={() => setShowPremium(true)}
            onNavigateToOrbitSettings={() => setSettingsStack({ screen: "orbitSettings" })}
            onLogout={async () => {
              await resetApp();
            }}
          />
        );
    }
  };

  const renderScreen = () => {
    switch (activeTab) {
      case "today":
        return renderTodayScreen();
      case "people":
        return renderPeopleScreen();
      case "calendar":
        return renderCalendarScreen();
      case "insights":
        return renderInsightsScreen();
      case "settings":
        return renderSettingsScreen();
      default:
        return renderTodayScreen();
    }
  };

  const showTabBar = 
    (activeTab === "people" && peopleStack.screen === "list") ||
    (activeTab === "settings" && settingsStack.screen === "main") ||
    (activeTab === "calendar" && calendarStack.screen === "main") ||
    (activeTab === "insights" && insightsStack.screen === "main") ||
    (activeTab === "today" && todayStack.screen === "main");

  return (
    <View style={{ flex: 1, backgroundColor: "#F7F8F6" }}>
      {renderScreen()}
      {showTabBar && (
        <BottomTabBar activeTab={activeTab} onTabPress={handleTabPress} />
      )}
      <Modal
        visible={showPremium}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={() => setShowPremium(false)}
      >
        <PremiumScreen onClose={() => setShowPremium(false)} trigger={premiumTrigger} />
      </Modal>
      <CompleteActionModal
        visible={showCompleteModal}
        onClose={() => setShowCompleteModal(false)}
        pendingAction={pendingAction}
        onComplete={handleCompleteAction}
        onDiscard={handleDiscardAction}
      />
      <LogConnectionModal
        visible={showQuickLogModal}
        onClose={() => setShowQuickLogModal(false)}
        friends={friends}
        onLogConnection={async (friendId, type, note, date) => {
          await logInteraction(friendId, type as any, note, undefined, date);
          await recordDailyActivity();
          setShowQuickLogModal(false);
        }}
      />
    </View>
  );
};
