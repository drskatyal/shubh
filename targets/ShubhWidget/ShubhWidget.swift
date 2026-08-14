import SwiftUI
import WidgetKit

struct GlanceEntry: TimelineEntry {
    let date: Date
    let city: String
    let windowName: String
    let state: String
    let tithi: String
}

struct GlanceProvider: TimelineProvider {
    func placeholder(in context: Context) -> GlanceEntry {
        GlanceEntry(date: Date(), city: "Shubh", windowName: "Rahu Kaal", state: "Wait", tithi: "")
    }

    func getSnapshot(in context: Context, completion: @escaping (GlanceEntry) -> Void) {
        completion(load())
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<GlanceEntry>) -> Void) {
        let entry = load()
        let next = Calendar.current.date(byAdding: .minute, value: 15, to: Date()) ?? Date()
        completion(Timeline(entries: [entry], policy: .after(next)))
    }

    private func load() -> GlanceEntry {
        let defaults = UserDefaults(suiteName: "group.ai.flowrad.shubh")
        let city = defaults?.string(forKey: "city") ?? "Shubh"
        let windowName = defaults?.string(forKey: "windowName") ?? ""
        let stateKey = defaults?.string(forKey: "state") ?? "wait"
        let language = defaults?.string(forKey: "language") ?? "en"
        let tithi = defaults?.string(forKey: "tithi") ?? ""
        let state = stateKey == "now"
            ? (language == "hi" ? "अभी" : "Now")
            : (language == "hi" ? "रुकें" : "Wait")
        return GlanceEntry(date: Date(), city: city, windowName: windowName, state: state, tithi: tithi)
    }
}

struct ShubhWidgetView: View {
    var entry: GlanceEntry

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(entry.city)
                .font(.caption)
                .foregroundStyle(Color(red: 0.96, green: 0.93, blue: 0.88))
            Text(entry.windowName)
                .font(.headline)
                .foregroundStyle(Color(red: 0.91, green: 0.77, blue: 0.47))
            Text(entry.state)
                .font(.title3.weight(.semibold))
                .foregroundStyle(Color(red: 0.78, green: 0.90, blue: 0.75))
            if !entry.tithi.isEmpty {
                Text(entry.tithi)
                    .font(.caption)
                    .foregroundStyle(Color(red: 0.91, green: 0.77, blue: 0.47))
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
        .padding()
        .containerBackground(Color(red: 0.04, green: 0.06, blue: 0.13), for: .widget)
    }
}

@main
struct ShubhWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "ShubhWidget", provider: GlanceProvider()) { entry in
            ShubhWidgetView(entry: entry)
        }
        .configurationDisplayName("Shubh")
        .description("City, current window, now or wait.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}
