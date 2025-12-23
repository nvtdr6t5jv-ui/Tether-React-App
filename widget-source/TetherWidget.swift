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
    
    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            HStack {
                Image(systemName: "flame.fill")
                    .foregroundColor(.white)
                    .font(.system(size: 16, weight: .bold))
                Spacer()
                Text("STREAK")
                    .font(.system(size: 9, weight: .heavy))
                    .foregroundColor(.white.opacity(0.7))
                    .tracking(1)
            }
            
            Spacer()
            
            Text("\(entry.widgetData?.streak.current ?? 0)")
                .font(.system(size: 48, weight: .black, design: .rounded))
                .foregroundColor(.white)
            
            Text("day\(entry.widgetData?.streak.current == 1 ? "" : "s")")
                .font(.system(size: 14, weight: .semibold))
                .foregroundColor(.white.opacity(0.8))
        }
        .padding()
        .containerBackground(for: .widget) {
            LinearGradient(
                colors: [Color(red: 0.878, green: 0.478, blue: 0.373), Color(red: 0.95, green: 0.55, blue: 0.4)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        }
    }
}

struct TodayFocusWidgetView: View {
    var entry: Provider.Entry
    @Environment(\.widgetFamily) var family
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text("TODAY'S FOCUS")
                    .font(.system(size: 9, weight: .heavy))
                    .foregroundColor(Color(red: 0.24, green: 0.25, blue: 0.36).opacity(0.5))
                    .tracking(1)
                Spacer()
                Circle()
                    .fill(Color(red: 0.878, green: 0.478, blue: 0.373))
                    .frame(width: 8, height: 8)
            }
            
            Spacer()
            
            if let focus = entry.widgetData?.todayFocus {
                HStack(spacing: 12) {
                    ZStack {
                        Circle()
                            .fill(LinearGradient(
                                colors: [Color(red: 0.878, green: 0.478, blue: 0.373), Color(red: 0.95, green: 0.55, blue: 0.4)],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            ))
                            .frame(width: 48, height: 48)
                        Text(focus.friendInitials)
                            .font(.system(size: 18, weight: .bold))
                            .foregroundColor(.white)
                    }
                    .shadow(color: Color(red: 0.878, green: 0.478, blue: 0.373).opacity(0.3), radius: 8, x: 0, y: 4)
                    
                    VStack(alignment: .leading, spacing: 2) {
                        Text(focus.friendName)
                            .font(.system(size: 17, weight: .bold))
                            .foregroundColor(Color(red: 0.24, green: 0.25, blue: 0.36))
                            .lineLimit(1)
                        HStack(spacing: 4) {
                            Image(systemName: "clock")
                                .font(.system(size: 10))
                            Text("\(focus.daysSinceContact)d ago")
                                .font(.system(size: 12, weight: .medium))
                        }
                        .foregroundColor(focus.daysSinceContact > 7 ? Color(red: 0.878, green: 0.478, blue: 0.373) : Color(red: 0.24, green: 0.25, blue: 0.36).opacity(0.5))
                    }
                    
                    if family == .systemMedium {
                        Spacer()
                        
                        VStack(spacing: 8) {
                            Image(systemName: "phone.fill")
                                .font(.system(size: 14))
                                .foregroundColor(Color(red: 0.506, green: 0.698, blue: 0.604))
                                .frame(width: 36, height: 36)
                                .background(Color(red: 0.506, green: 0.698, blue: 0.604).opacity(0.15))
                                .clipShape(Circle())
                            
                            Image(systemName: "message.fill")
                                .font(.system(size: 14))
                                .foregroundColor(Color(red: 0.506, green: 0.698, blue: 0.604))
                                .frame(width: 36, height: 36)
                                .background(Color(red: 0.506, green: 0.698, blue: 0.604).opacity(0.15))
                                .clipShape(Circle())
                        }
                    }
                }
            } else {
                VStack(alignment: .leading, spacing: 4) {
                    HStack(spacing: 6) {
                        Image(systemName: "checkmark.circle.fill")
                            .foregroundColor(Color(red: 0.506, green: 0.698, blue: 0.604))
                        Text("All caught up!")
                            .font(.system(size: 17, weight: .bold))
                            .foregroundColor(Color(red: 0.24, green: 0.25, blue: 0.36))
                    }
                    Text("Great job staying connected")
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(Color(red: 0.24, green: 0.25, blue: 0.36).opacity(0.5))
                }
            }
        }
        .padding()
        .containerBackground(for: .widget) {
            Color(red: 0.957, green: 0.945, blue: 0.871)
        }
    }
}

struct GardenWidgetView: View {
    var entry: Provider.Entry
    
    var plantIcon: String {
        let stage = entry.widgetData?.garden.plantStage ?? 1
        switch stage {
        case 1: return "leaf"
        case 2: return "leaf.fill"
        case 3: return "camera.macro"
        case 4: return "tree"
        case 5: return "tree.fill"
        default: return "leaf"
        }
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            HStack {
                Text("GARDEN")
                    .font(.system(size: 9, weight: .heavy))
                    .foregroundColor(.white.opacity(0.7))
                    .tracking(1)
                Spacer()
            }
            
            Spacer()
            
            HStack(alignment: .bottom) {
                Image(systemName: plantIcon)
                    .font(.system(size: 36, weight: .medium))
                    .foregroundColor(.white)
                
                Spacer()
                
                VStack(alignment: .trailing, spacing: 0) {
                    Text("LVL")
                        .font(.system(size: 9, weight: .heavy))
                        .foregroundColor(.white.opacity(0.6))
                    Text("\(entry.widgetData?.garden.level ?? 1)")
                        .font(.system(size: 28, weight: .black, design: .rounded))
                        .foregroundColor(.white)
                }
            }
            
            GeometryReader { geo in
                ZStack(alignment: .leading) {
                    RoundedRectangle(cornerRadius: 3)
                        .fill(Color.white.opacity(0.3))
                        .frame(height: 6)
                    
                    let xpVal = entry.widgetData?.garden.xp ?? 0
                    let xpMax = max(entry.widgetData?.garden.xpToNextLevel ?? 100, 1)
                    let progress = Double(xpVal) / Double(xpMax)
                    RoundedRectangle(cornerRadius: 3)
                        .fill(Color.white)
                        .frame(width: geo.size.width * CGFloat(min(progress, 1.0)), height: 6)
                }
            }
            .frame(height: 6)
            
            Text("\(entry.widgetData?.garden.xp ?? 0) / \(entry.widgetData?.garden.xpToNextLevel ?? 100) XP")
                .font(.system(size: 10, weight: .semibold))
                .foregroundColor(.white.opacity(0.8))
        }
        .padding()
        .containerBackground(for: .widget) {
            LinearGradient(
                colors: [Color(red: 0.506, green: 0.698, blue: 0.604), Color(red: 0.4, green: 0.6, blue: 0.5)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        }
    }
}

struct QuickLogWidgetView: View {
    var body: some View {
        VStack(spacing: 8) {
            ZStack {
                Circle()
                    .fill(Color.white.opacity(0.15))
                    .frame(width: 56, height: 56)
                
                Image(systemName: "plus")
                    .font(.system(size: 28, weight: .bold))
                    .foregroundColor(.white)
            }
            
            Text("Quick Log")
                .font(.system(size: 13, weight: .bold))
                .foregroundColor(.white)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .containerBackground(for: .widget) {
            LinearGradient(
                colors: [Color(red: 0.24, green: 0.25, blue: 0.36), Color(red: 0.35, green: 0.36, blue: 0.5)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        }
    }
}

struct StatsWidgetView: View {
    var entry: Provider.Entry
    @Environment(\.widgetFamily) var family
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text("THIS WEEK")
                    .font(.system(size: 9, weight: .heavy))
                    .foregroundColor(Color(red: 0.24, green: 0.25, blue: 0.36).opacity(0.5))
                    .tracking(1)
                Spacer()
                Image(systemName: "chart.bar.fill")
                    .foregroundColor(Color(red: 0.506, green: 0.698, blue: 0.604))
                    .font(.system(size: 14))
            }
            
            Spacer()
            
            if family == .systemMedium {
                HStack(spacing: 16) {
                    StatItem(
                        value: entry.widgetData?.stats.connectionsThisWeek ?? 0,
                        label: "Connections",
                        color: Color(red: 0.506, green: 0.698, blue: 0.604)
                    )
                    
                    StatItem(
                        value: entry.widgetData?.stats.overdueCount ?? 0,
                        label: "Overdue",
                        color: (entry.widgetData?.stats.overdueCount ?? 0) > 0 ? Color(red: 0.878, green: 0.478, blue: 0.373) : Color(red: 0.24, green: 0.25, blue: 0.36)
                    )
                    
                    StatItem(
                        value: entry.widgetData?.stats.upcomingBirthdays ?? 0,
                        label: "Birthdays",
                        color: Color(red: 0.545, green: 0.361, blue: 0.965)
                    )
                }
            } else {
                HStack(spacing: 16) {
                    VStack(alignment: .leading, spacing: 0) {
                        Text("\(entry.widgetData?.stats.connectionsThisWeek ?? 0)")
                            .font(.system(size: 28, weight: .black, design: .rounded))
                            .foregroundColor(Color(red: 0.506, green: 0.698, blue: 0.604))
                        Text("connections")
                            .font(.system(size: 10, weight: .semibold))
                            .foregroundColor(Color(red: 0.24, green: 0.25, blue: 0.36).opacity(0.5))
                    }
                    
                    Spacer()
                    
                    if (entry.widgetData?.stats.overdueCount ?? 0) > 0 {
                        VStack(alignment: .trailing, spacing: 0) {
                            Text("\(entry.widgetData?.stats.overdueCount ?? 0)")
                                .font(.system(size: 20, weight: .bold, design: .rounded))
                                .foregroundColor(Color(red: 0.878, green: 0.478, blue: 0.373))
                            Text("overdue")
                                .font(.system(size: 10, weight: .semibold))
                                .foregroundColor(Color(red: 0.878, green: 0.478, blue: 0.373).opacity(0.7))
                        }
                    }
                }
            }
        }
        .padding()
        .containerBackground(for: .widget) {
            Color(red: 0.957, green: 0.945, blue: 0.871)
        }
    }
}

struct StatItem: View {
    let value: Int
    let label: String
    let color: Color
    
    var body: some View {
        VStack(alignment: .leading, spacing: 2) {
            Text("\(value)")
                .font(.system(size: 24, weight: .black, design: .rounded))
                .foregroundColor(color)
            Text(label)
                .font(.system(size: 10, weight: .semibold))
                .foregroundColor(Color(red: 0.24, green: 0.25, blue: 0.36).opacity(0.5))
        }
        .frame(maxWidth: .infinity, alignment: .leading)
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
        }
        .configurationDisplayName("Streak")
        .description("Track your daily connection streak")
        .supportedFamilies([.systemSmall])
    }
}

struct TodayFocusWidget: Widget {
    let kind: String = "TodayFocusWidget"
    
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            TodayFocusWidgetView(entry: entry)
        }
        .configurationDisplayName("Today's Focus")
        .description("See who to connect with today")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

struct GardenWidget: Widget {
    let kind: String = "GardenWidget"
    
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            GardenWidgetView(entry: entry)
        }
        .configurationDisplayName("Garden")
        .description("Watch your connection garden grow")
        .supportedFamilies([.systemSmall])
    }
}

struct QuickLogWidget: Widget {
    let kind: String = "QuickLogWidget"
    
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            Link(destination: URL(string: "tether://quicklog")!) {
                QuickLogWidgetView()
            }
        }
        .configurationDisplayName("Quick Log")
        .description("Quickly log a connection")
        .supportedFamilies([.systemSmall])
    }
}

struct StatsWidget: Widget {
    let kind: String = "StatsWidget"
    
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            StatsWidgetView(entry: entry)
        }
        .configurationDisplayName("Weekly Stats")
        .description("Your connection statistics")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}
