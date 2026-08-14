import ExpoModulesCore
import WidgetKit

public class ShubhGlanceModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ShubhGlance")

    AsyncFunction("writeGlance") { (payload: String) in
      guard
        let data = payload.data(using: .utf8),
        let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any]
      else {
        return
      }
      let defaults = UserDefaults(suiteName: "group.ai.flowrad.shubh")
      defaults?.set(json["city"] as? String ?? "", forKey: "city")
      defaults?.set(json["windowName"] as? String ?? "", forKey: "windowName")
      defaults?.set(json["state"] as? String ?? "wait", forKey: "state")
      defaults?.set(json["language"] as? String ?? "en", forKey: "language")
      defaults?.set(json["tithi"] as? String ?? "", forKey: "tithi")
      if #available(iOS 14.0, *) {
        WidgetCenter.shared.reloadAllTimelines()
      }
    }
  }
}
