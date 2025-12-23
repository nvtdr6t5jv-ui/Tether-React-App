import WidgetKit
import SwiftUI

struct WidgetData: Codable {
    struct Streak: Codable {
        let current: Int
        let lastUpdated: String
    }
    
    struct TodayFocus: Codable {
        let friendName: String
        let friendInitials: String
        let friendPhoto: String?
        let daysSinceContact: Int
        let orbitName: String
    }
    
    struct Garden: Codable {
        let plantStage: Int
        let level: Int
        let xp: Int
        let xpToNextLevel: Int
    }
    
    struct Stats: Codable {
        let connectionsThisWeek: Int
        let overdueCount: Int
        let upcomingBirthdays: Int
    }
    
    struct Premium: Codable {
        let isPremium: Bool
        let plan: String?
    }
    
    let streak: Streak
    let todayFocus: TodayFocus?
    let garden: Garden
    let stats: Stats
    let premium: Premium
    let lastSynced: String
}

struct Provider: TimelineProvider {
    let appGroupId = "group.com.social.tether"
    
    func placeholder(in context: Context) -> TetherEntry {
        TetherEntry(date: Date(), widgetData: nil)
    }

    func getSnapshot(in context: Context, completion: @escaping (TetherEntry) -> ()) {
        let entry = TetherEntry(date: Date(), widgetData: loadWidgetData())
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<TetherEntry>) -> ()) {
        let currentDate = Date()
        let refreshDate = Calendar.current.date(byAdding: .minute, value: 30, to: currentDate)!
        
        let entry = TetherEntry(date: currentDate, widgetData: loadWidgetData())
        let timeline = Timeline(entries: [entry], policy: .after(refreshDate))
        
        completion(timeline)
    }
    
    private func loadWidgetData() -> WidgetData? {
        guard let userDefaults = UserDefaults(suiteName: appGroupId),
              let jsonString = userDefaults.string(forKey: "widgetData"),
              let data = jsonString.data(using: .utf8) else {
            return nil
        }
        
        return try? JSONDecoder().decode(WidgetData.self, from: data)
    }
}

struct TetherEntry: TimelineEntry {
    let date: Date
    let widgetData: WidgetData?
}

struct StreakWidgetView: View {
    var entry: Provider.Entry
    @Environment(\.widgetFamily) var family
    
    var streakMessage: String {
        let streak = entry.widgetData?.streak.current ?? 0
        if streak == 0 { return "Start your streak!" }
        if streak < 7 { return "Keep it going!" }
        if streak < 30 { return "You're on fire!" }
        return "Incredible!"
    }
    
    var body: some View {
        ZStack {
            LinearGradient(
                colors: [Color(red: 0.96, green: 0.60, blue: 0.45), Color(red: 0.88, green: 0.48, blue: 0.37)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            
            VStack(alignment: .leading, spacing: 6) {
                HStack {
                    Image(systemName: "flame.fill")
                        .foregroundColor(.white)
                        .font(.system(size: 16, weight: .semibold))
                    Spacer()
                    Text("Tether")
                        .font(.system(size: 10, weight: .medium))
                        .foregroundColor(.white.opacity(0.7))
                }
                
                Spacer()
                
                Text("\(entry.widgetData?.streak.current ?? 0)")
                    .font(.system(size: 48, weight: .bold, design: .rounded))
                    .foregroundColor(.white)
                
                Text("Day Streak")
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundColor(.white.opacity(0.9))
                
                Text(streakMessage)
                    .font(.system(size: 11, weight: .medium))
                    .foregroundColor(.white.opacity(0.7))
            }
            .padding(16)
        }
        .widgetURL(URL(string: "tether://progress"))
    }
}

struct TodayFocusWidgetView: View {
    var entry: Provider.Entry
    @Environment(\.widgetFamily) var family
    
    var body: some View {
        ZStack {
            Color(red: 0.96, green: 0.95, blue: 0.87)
            
            VStack(alignment: .leading, spacing: 6) {
                HStack {
                    Text("Today's Focus")
                        .font(.system(size: 12, weight: .bold))
                        .foregroundColor(Color(red: 0.24, green: 0.25, blue: 0.36))
                    Spacer()
                    Image(systemName: "sparkles")
                        .foregroundColor(Color(red: 0.88, green: 0.48, blue: 0.37))
                        .font(.system(size: 14))
                }
                
                Spacer()
                
                if let focus = entry.widgetData?.todayFocus {
                    HStack(spacing: 12) {
                        ZStack {
                            Circle()
                                .fill(Color(red: 0.88, green: 0.48, blue: 0.37))
                                .frame(width: 44, height: 44)
                            Text(focus.friendInitials)
                                .font(.system(size: 16, weight: .bold))
                                .foregroundColor(.white)
                        }
                        
                        VStack(alignment: .leading, spacing: 2) {
                            Text(focus.friendName)
                                .font(.system(size: 16, weight: .bold))
                                .foregroundColor(Color(red: 0.24, green: 0.25, blue: 0.36))
                                .lineLimit(1)
                            Text("\(focus.daysSinceContact)d since last contact")
                                .font(.system(size: 11, weight: .medium))
                                .foregroundColor(Color(red: 0.24, green: 0.25, blue: 0.36).opacity(0.6))
                        }
                        Spacer()
                    }
                    
                    Text("Tap to reach out")
                        .font(.system(size: 10, weight: .medium))
                        .foregroundColor(Color(red: 0.88, green: 0.48, blue: 0.37))
                } else {
                    VStack(alignment: .leading, spacing: 4) {
                        HStack(spacing: 8) {
                            Image(systemName: "checkmark.circle.fill")
                                .foregroundColor(Color(red: 0.51, green: 0.70, blue: 0.60))
                                .font(.system(size: 24))
                            Text("All caught up!")
                                .font(.system(size: 18, weight: .bold))
                                .foregroundColor(Color(red: 0.24, green: 0.25, blue: 0.36))
                        }
                        Text("Great job staying connected")
                            .font(.system(size: 12, weight: .medium))
                            .foregroundColor(Color(red: 0.24, green: 0.25, blue: 0.36).opacity(0.6))
                    }
                }
            }
            .padding(16)
        }
        .widgetURL(URL(string: "tether://today"))
    }
}

struct GardenWidgetView: View {
    var entry: Provider.Entry
    
    var plantEmoji: String {
        let stage = entry.widgetData?.garden.plantStage ?? 1
        switch stage {
        case 1: return "🌱"
        case 2: return "🌿"
        case 3: return "🪴"
        case 4: return "🌳"
        case 5: return "🌲"
        default: return "🌱"
        }
    }
    
    var progress: Double {
        let xp = Double(entry.widgetData?.garden.xp ?? 0)
        let needed = Double(entry.widgetData?.garden.xpToNextLevel ?? 100)
        return min(xp / needed, 1.0)
    }
    
    var body: some View {
        ZStack {
            LinearGradient(
                colors: [Color(red: 0.51, green: 0.70, blue: 0.60), Color(red: 0.41, green: 0.60, blue: 0.50)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            
            VStack(alignment: .leading, spacing: 6) {
                HStack {
                    Text("My Garden")
                        .font(.system(size: 12, weight: .bold))
                        .foregroundColor(.white)
                    Spacer()
                    Text("Tether")
                        .font(.system(size: 10, weight: .medium))
                        .foregroundColor(.white.opacity(0.7))
                }
                
                Spacer()
                
                HStack(alignment: .bottom) {
                    Text(plantEmoji)
                        .font(.system(size: 44))
                    
                    Spacer()
                    
                    VStack(alignment: .trailing, spacing: 2) {
                        Text("Level \(entry.widgetData?.garden.level ?? 1)")
                            .font(.system(size: 18, weight: .bold))
                            .foregroundColor(.white)
                        Text("\(entry.widgetData?.garden.xp ?? 0) XP")
                            .font(.system(size: 12, weight: .semibold))
                            .foregroundColor(.white.opacity(0.8))
                    }
                }
                
                GeometryReader { geo in
                    ZStack(alignment: .leading) {
                        RoundedRectangle(cornerRadius: 4)
                            .fill(Color.white.opacity(0.3))
                            .frame(height: 8)
                        
                        RoundedRectangle(cornerRadius: 4)
                            .fill(Color.white)
                            .frame(width: geo.size.width * CGFloat(progress), height: 8)
                    }
                }
                .frame(height: 8)
            }
            .padding(16)
        }
        .widgetURL(URL(string: "tether://garden"))
    }
}

struct QuickLogWidgetView: View {
    var body: some View {
        ZStack {
            Color(red: 0.96, green: 0.95, blue: 0.87)
            
            VStack(spacing: 10) {
                ZStack {
                    Circle()
                        .fill(Color(red: 0.88, green: 0.48, blue: 0.37).opacity(0.15))
                        .frame(width: 56, height: 56)
                    Image(systemName: "plus")
                        .font(.system(size: 26, weight: .semibold))
                        .foregroundColor(Color(red: 0.88, green: 0.48, blue: 0.37))
                }
                
                Text("Quick Log")
                    .font(.system(size: 14, weight: .bold))
                    .foregroundColor(Color(red: 0.24, green: 0.25, blue: 0.36))
                
                Text("Tap to log")
                    .font(.system(size: 11, weight: .medium))
                    .foregroundColor(Color(red: 0.24, green: 0.25, blue: 0.36).opacity(0.5))
            }
        }
        .widgetURL(URL(string: "tether://quicklog"))
    }
}

struct StatsWidgetView: View {
    var entry: Provider.Entry
    @Environment(\.widgetFamily) var family
    
    var body: some View {
        ZStack {
            Color(red: 0.96, green: 0.95, blue: 0.87)
            
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Text("This Week")
                        .font(.system(size: 12, weight: .bold))
                        .foregroundColor(Color(red: 0.24, green: 0.25, blue: 0.36))
                    Spacer()
                    Image(systemName: "chart.bar.fill")
                        .foregroundColor(Color(red: 0.51, green: 0.70, blue: 0.60))
                        .font(.system(size: 14))
                }
                
                Spacer()
                
                HStack(spacing: family == .systemMedium ? 32 : 16) {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("\(entry.widgetData?.stats.connectionsThisWeek ?? 0)")
                            .font(.system(size: 32, weight: .bold, design: .rounded))
                            .foregroundColor(Color(red: 0.51, green: 0.70, blue: 0.60))
                        Text("Connections")
                            .font(.system(size: 11, weight: .semibold))
                            .foregroundColor(Color(red: 0.24, green: 0.25, blue: 0.36).opacity(0.6))
                    }
                    
                    if family == .systemMedium {
                        Spacer()
                    }
                    
                    VStack(alignment: .leading, spacing: 4) {
                        Text("\(entry.widgetData?.stats.overdueCount ?? 0)")
                            .font(.system(size: 32, weight: .bold, design: .rounded))
                            .foregroundColor(entry.widgetData?.stats.overdueCount ?? 0 > 0 ? Color(red: 0.88, green: 0.48, blue: 0.37) : Color(red: 0.24, green: 0.25, blue: 0.36))
                        Text("Overdue")
                            .font(.system(size: 11, weight: .semibold))
                            .foregroundColor(Color(red: 0.24, green: 0.25, blue: 0.36).opacity(0.6))
                    }
                    
                    if family == .systemMedium {
                        Spacer()
                        
                        VStack(alignment: .leading, spacing: 4) {
                            Text("\(entry.widgetData?.stats.upcomingBirthdays ?? 0)")
                                .font(.system(size: 32, weight: .bold, design: .rounded))
                                .foregroundColor(Color(red: 0.39, green: 0.40, blue: 0.96))
                            Text("Birthdays")
                                .font(.system(size: 11, weight: .semibold))
                                .foregroundColor(Color(red: 0.24, green: 0.25, blue: 0.36).opacity(0.6))
                        }
                    }
                }
            }
            .padding(16)
        }
        .widgetURL(URL(string: "tether://insights"))
    }
}

@main
struct TetherWidgetBundle: WidgetBundle {
    var body: some Widget {
        StreakWidget()
        TodayFocusWidget()
        GardenWidget()
        QuickLogWidget()
        StatsWidget()
    }
}

struct StreakWidget: Widget {
    let kind: String = "StreakWidget"
    
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            StreakWidgetView(entry: entry)
                .containerBackground(.clear, for: .widget)
        }
        .configurationDisplayName("Streak")
        .description("Track your daily connection streak")
        .supportedFamilies([.systemSmall])
        .contentMarginsDisabled()
    }
}

struct TodayFocusWidget: Widget {
    let kind: String = "TodayFocusWidget"
    
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            TodayFocusWidgetView(entry: entry)
                .containerBackground(.clear, for: .widget)
        }
        .configurationDisplayName("Today's Focus")
        .description("See who to connect with today")
        .supportedFamilies([.systemSmall, .systemMedium])
        .contentMarginsDisabled()
    }
}

struct GardenWidget: Widget {
    let kind: String = "GardenWidget"
    
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            GardenWidgetView(entry: entry)
                .containerBackground(.clear, for: .widget)
        }
        .configurationDisplayName("Garden")
        .description("Watch your connection garden grow")
        .supportedFamilies([.systemSmall])
        .contentMarginsDisabled()
    }
}

struct QuickLogWidget: Widget {
    let kind: String = "QuickLogWidget"
    
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            QuickLogWidgetView()
                .containerBackground(.clear, for: .widget)
        }
        .configurationDisplayName("Quick Log")
        .description("Quickly log a connection")
        .supportedFamilies([.systemSmall])
        .contentMarginsDisabled()
    }
}

struct StatsWidget: Widget {
    let kind: String = "StatsWidget"
    
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            StatsWidgetView(entry: entry)
                .containerBackground(.clear, for: .widget)
        }
        .configurationDisplayName("Weekly Stats")
        .description("Your connection statistics")
        .supportedFamilies([.systemSmall, .systemMedium])
        .contentMarginsDisabled()
    }
}
