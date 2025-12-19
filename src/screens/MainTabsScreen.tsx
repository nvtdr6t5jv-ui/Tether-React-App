import React, { useState, useCallback } from "react";
import { View, BackHandler, Modal } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { HomeScreen } from "./HomeScreen";
import { PeopleScreen } from "./PeopleScreen";
import { PersonProfileScreen } from "./PersonProfileScreen";
import { NewConnectionScreen } from "./NewConnectionScreen";
import { EditPersonScreen } from "./EditPersonScreen";
import { ActionsScreen } from "./ActionsScreen";
import { SettingsScreen } from "./SettingsScreen";
import { NotificationsScreen } from "./NotificationsScreen";
import { AppearanceScreen } from "./AppearanceScreen";
import { AnalyticsScreen } from "./AnalyticsScreen";
import { EditProfileScreen } from "./EditProfileScreen";
import { SocialPulseScreen } from "./SocialPulseScreen";
import { PremiumScreen } from "./PremiumScreen";
import { BottomTabBar } from "../components/BottomTabBar";
import { useApp } from "../context/AppContext";

type TabType = "home" | "people" | "actions" | "settings";

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
  | { screen: "premium" };

type HomeStack =
  | { screen: "main" }
  | { screen: "socialPulse" };

type ActionsStack =
  | { screen: "main" }
  | { screen: "newNote" };

export const MainTabsScreen = () => {
  const { resetApp } = useApp();
  const [activeTab, setActiveTab] = useState<TabType>("home");
  
  const [peopleStack, setPeopleStack] = useState<PeopleStack>({ screen: "list" });
  const [settingsStack, setSettingsStack] = useState<SettingsStack>({ screen: "main" });
  const [actionsStack, setActionsStack] = useState<ActionsStack>({ screen: "main" });
  const [homeStack, setHomeStack] = useState<HomeStack>({ screen: "main" });
  const [showPremium, setShowPremium] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (showPremium) {
          setShowPremium(false);
          return true;
        }
        if (activeTab === "home" && homeStack.screen !== "main") {
          setHomeStack({ screen: "main" });
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
        if (activeTab === "actions" && actionsStack.screen !== "main") {
          setActionsStack({ screen: "main" });
          return true;
        }
        if (activeTab !== "home") {
          setActiveTab("home");
          return true;
        }
        return false;
      };

      const subscription = BackHandler.addEventListener("hardwareBackPress", onBackPress);
      return () => subscription.remove();
    }, [activeTab, peopleStack, settingsStack, actionsStack, homeStack, showPremium])
  );

  const handleTabPress = (tab: string) => {
    if (tab === activeTab) {
      if (tab === "home") setHomeStack({ screen: "main" });
      if (tab === "people") setPeopleStack({ screen: "list" });
      if (tab === "settings") setSettingsStack({ screen: "main" });
      if (tab === "actions") setActionsStack({ screen: "main" });
    } else {
      setActiveTab(tab as TabType);
    }
  };

  const renderHomeScreen = () => {
    switch (homeStack.screen) {
      case "socialPulse":
        return (
          <SocialPulseScreen
            onBack={() => setHomeStack({ screen: "main" })}
          />
        );
      case "main":
      default:
        return (
          <HomeScreen
            onNavigate={(screen) => {
              if (screen === "people") {
                setActiveTab("people");
              } else if (screen === "actions") {
                setActiveTab("actions");
              }
            }}
            onNavigateToSocialPulse={() => setHomeStack({ screen: "socialPulse" })}
          />
        );
    }
  };

  const renderPeopleScreen = () => {
    switch (peopleStack.screen) {
      case "list":
        return (
          <PeopleScreen
            onNavigateToProfile={(friendId) => setPeopleStack({ screen: "profile", friendId })}
            onNavigateToNewConnection={() => setPeopleStack({ screen: "newConnection" })}
          />
        );
      case "profile":
        return (
          <PersonProfileScreen
            friendId={peopleStack.friendId}
            onBack={() => setPeopleStack({ screen: "list" })}
            onEdit={(friendId) => setPeopleStack({ screen: "editPerson", friendId })}
          />
        );
      case "newConnection":
        return (
          <NewConnectionScreen
            onBack={() => setPeopleStack({ screen: "list" })}
            onSave={(friendId) => setPeopleStack({ screen: "profile", friendId })}
          />
        );
      case "editPerson":
        return (
          <EditPersonScreen
            friendId={peopleStack.friendId}
            onBack={() => setPeopleStack({ screen: "profile", friendId: peopleStack.friendId })}
            onSave={() => setPeopleStack({ screen: "profile", friendId: peopleStack.friendId })}
          />
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

  const renderActionsScreen = () => {
    switch (actionsStack.screen) {
      case "main":
        return (
          <ActionsScreen
            onNavigateToProfile={(friendId) => {
              setActiveTab("people");
              setPeopleStack({ screen: "profile", friendId });
            }}
            onNavigateToNewNote={() => {
              setActiveTab("people");
              setPeopleStack({ screen: "newConnection" });
            }}
          />
        );
      default:
        return (
          <ActionsScreen
            onNavigateToProfile={(friendId) => {
              setActiveTab("people");
              setPeopleStack({ screen: "profile", friendId });
            }}
            onNavigateToNewNote={() => {
              setActiveTab("people");
              setPeopleStack({ screen: "newConnection" });
            }}
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
            onLogout={async () => {
              await resetApp();
            }}
          />
        );
      case "notifications":
        return (
          <NotificationsScreen
            onBack={() => setSettingsStack({ screen: "main" })}
          />
        );
      case "appearance":
        return (
          <AppearanceScreen
            onBack={() => setSettingsStack({ screen: "main" })}
          />
        );
      case "analytics":
        return (
          <AnalyticsScreen
            onBack={() => setSettingsStack({ screen: "main" })}
          />
        );
      case "editProfile":
        return (
          <EditProfileScreen
            onBack={() => setSettingsStack({ screen: "main" })}
            onSave={() => setSettingsStack({ screen: "main" })}
          />
        );
      default:
        return (
          <SettingsScreen
            onNavigateToNotifications={() => setSettingsStack({ screen: "notifications" })}
            onNavigateToAppearance={() => setSettingsStack({ screen: "appearance" })}
            onNavigateToAnalytics={() => setSettingsStack({ screen: "analytics" })}
            onNavigateToEditProfile={() => setSettingsStack({ screen: "editProfile" })}
            onNavigateToPremium={() => setShowPremium(true)}
            onLogout={async () => {
              await resetApp();
            }}
          />
        );
    }
  };

  const renderScreen = () => {
    switch (activeTab) {
      case "home":
        return renderHomeScreen();
      case "people":
        return renderPeopleScreen();
      case "actions":
        return renderActionsScreen();
      case "settings":
        return renderSettingsScreen();
      default:
        return renderHomeScreen();
    }
  };

  const showTabBar = 
    (activeTab === "people" && peopleStack.screen === "list") ||
    (activeTab === "settings" && settingsStack.screen === "main") ||
    (activeTab === "actions" && actionsStack.screen === "main") ||
    (activeTab === "home" && homeStack.screen === "main");

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
        <PremiumScreen onClose={() => setShowPremium(false)} />
      </Modal>
    </View>
  );
};
