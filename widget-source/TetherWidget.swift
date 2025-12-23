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
                    .foregroundColor(.orange)
                    .font(.system(size: 18))
                Spacer()
                Text("Tether")
                    .font(.caption2)
                    .foregroundColor(.secondary)
            }
            
            Spacer()
            
            Text("\(entry.widgetData?.streak.current ?? 0)")
                .font(.system(size: 40, weight: .bold, design: .rounded))
                .foregroundColor(.primary)
            
            Text("Day Streak")
                .font(.caption)
                .foregroundColor(.secondary)
        }
    }
}

struct TodayFocusWidgetView: View {
    var entry: Provider.Entry
    @Environment(\.widgetFamily) var family
    
    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            HStack {
                Text("Today's Focus")
                    .font(.caption)
                    .fontWeight(.semibold)
                    .foregroundColor(.secondary)
                Spacer()
                Image(systemName: "person.circle.fill")
                    .foregroundColor(Color(red: 0.506, green: 0.561, blue: 0.604))
            }
            
            Spacer()
            
            if let focus = entry.widgetData?.todayFocus {
                HStack(spacing: 10) {
                    ZStack {
                        Circle()
                            .fill(Color(red: 0.878, green: 0.478, blue: 0.373))
                            .frame(width: family == .systemSmall ? 36 : 40, height: family == .systemSmall ? 36 : 40)
                        Text(focus.friendInitials)
                            .font(.system(size: family == .systemSmall ? 14 : 16, weight: .bold))
                            .foregroundColor(.white)
                    }
                    
                    VStack(alignment: .leading, spacing: 1) {
                        Text(focus.friendName)
                            .font(.subheadline)
                            .fontWeight(.semibold)
                            .lineLimit(1)
                        Text("\(focus.daysSinceContact) days ago")
                            .font(.caption2)
                            .foregroundColor(.secondary)
                    }
                }
            } else {
                VStack(alignment: .leading, spacing: 2) {
                    Text("All caught up!")
                        .font(.subheadline)
                        .fontWeight(.semibold)
                    Text("Great job staying connected")
                        .font(.caption2)
                        .foregroundColor(.secondary)
                }
            }
        }
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
    
    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            HStack {
                Text("Garden")
                    .font(.caption)
                    .fontWeight(.semibold)
                    .foregroundColor(.secondary)
                Spacer()
            }
            
            Spacer()
            
            HStack {
                Text(plantEmoji)
                    .font(.system(size: 32))
                
                Spacer()
                
                VStack(alignment: .trailing, spacing: 1) {
                    Text("Level \(entry.widgetData?.garden.level ?? 1)")
                        .font(.subheadline)
                        .fontWeight(.semibold)
                    Text("\(entry.widgetData?.garden.xp ?? 0) XP")
                        .font(.caption2)
                        .foregroundColor(Color(red: 0.506, green: 0.698, blue: 0.604))
                }
            }
            
            GeometryReader { geo in
                ZStack(alignment: .leading) {
                    RoundedRectangle(cornerRadius: 3)
                        .fill(Color.gray.opacity(0.2))
                        .frame(height: 5)
                    
                    let progress = Double(entry.widgetData?.garden.xp ?? 0) / Double(entry.widgetData?.garden.xpToNextLevel ?? 100)
                    RoundedRectangle(cornerRadius: 3)
                        .fill(Color(red: 0.506, green: 0.698, blue: 0.604))
                        .frame(width: geo.size.width * CGFloat(min(progress, 1.0)), height: 5)
                }
            }
            .frame(height: 5)
        }
    }
}

struct QuickLogWidgetView: View {
    var body: some View {
        VStack(spacing: 8) {
            Image(systemName: "plus.circle.fill")
                .font(.system(size: 28))
                .foregroundColor(Color(red: 0.878, green: 0.478, blue: 0.373))
            
            Text("Quick Log")
                .font(.caption)
                .fontWeight(.semibold)
                .foregroundColor(.primary)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}

struct StatsWidgetView: View {
    var entry: Provider.Entry
    @Environment(\.widgetFamily) var family
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text("This Week")
                    .font(.caption)
                    .fontWeight(.semibold)
                    .foregroundColor(.secondary)
                Spacer()
                Image(systemName: "chart.bar.fill")
                    .foregroundColor(Color(red: 0.506, green: 0.698, blue: 0.604))
            }
            
            Spacer()
            
            HStack(spacing: 12) {
                VStack(alignment: .leading, spacing: 1) {
                    Text("\(entry.widgetData?.stats.connectionsThisWeek ?? 0)")
                        .font(.title3)
                        .fontWeight(.bold)
                    Text("Connections")
                        .font(.caption2)
                        .foregroundColor(.secondary)
                }
                
                Spacer()
                
                VStack(alignment: .leading, spacing: 1) {
                    Text("\(entry.widgetData?.stats.overdueCount ?? 0)")
                        .font(.title3)
                        .fontWeight(.bold)
                        .foregroundColor(entry.widgetData?.stats.overdueCount ?? 0 > 0 ? .orange : .primary)
                    Text("Overdue")
                        .font(.caption2)
                        .foregroundColor(.secondary)
                }
            }
        }
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
                .padding(12)
                .containerBackground(.fill.tertiary, for: .widget)
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
                .padding(12)
                .containerBackground(.fill.tertiary, for: .widget)
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
                .padding(12)
                .containerBackground(.fill.tertiary, for: .widget)
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
            Link(destination: URL(string: "tether://quicklog")!) {
                QuickLogWidgetView()
            }
            .padding(12)
            .containerBackground(.fill.tertiary, for: .widget)
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
                .padding(12)
                .containerBackground(.fill.tertiary, for: .widget)
        }
        .configurationDisplayName("Weekly Stats")
        .description("Your connection statistics")
        .supportedFamilies([.systemSmall, .systemMedium])
        .contentMarginsDisabled()
    }
}
