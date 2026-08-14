package ai.flowrad.shubh

import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.widget.RemoteViews
import org.json.JSONObject

/**
 * Home-screen glance: city + current window + now/wait.
 * Payload is written by ShubhGlanceModule from JS (`src/widget/syncGlance.ts`).
 */
class ShubhWidgetProvider : AppWidgetProvider() {
    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray,
    ) {
        val prefs = context.getSharedPreferences("shubh_glance", Context.MODE_PRIVATE)
        val raw = prefs.getString("payload", null)
        val city: String
        val window: String
        val state: String
        if (raw != null) {
            val json = JSONObject(raw)
            city = json.optString("city", "Shubh")
            val tithi = json.optString("tithi", "")
            window =
                if (tithi.isNotEmpty()) {
                    "${json.optString("windowName", "")} · $tithi"
                } else {
                    json.optString("windowName", "")
                }
            val key = json.optString("state", "wait")
            val lang = json.optString("language", "en")
            state =
                if (key == "now") {
                    if (lang == "hi") "अभी" else "Now"
                } else {
                    if (lang == "hi") "रुकें" else "Wait"
                }
        } else {
            city = "Shubh"
            window = ""
            state = ""
        }

        for (id in appWidgetIds) {
            val views = RemoteViews(context.packageName, R.layout.shubh_widget)
            views.setTextViewText(R.id.shubh_widget_city, city)
            views.setTextViewText(R.id.shubh_widget_window, window)
            views.setTextViewText(R.id.shubh_widget_state, state)
            appWidgetManager.updateAppWidget(id, views)
        }
    }
}
