package expo.modules.shubhglance

import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class ShubhGlanceModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ShubhGlance")

    AsyncFunction("writeGlance") { payload: String ->
      val context = appContext.reactContext ?: return@AsyncFunction
      val prefs = context.getSharedPreferences("shubh_glance", Context.MODE_PRIVATE)
      prefs.edit().putString("payload", payload).apply()

      val manager = AppWidgetManager.getInstance(context)
      val component = ComponentName(context.packageName, "ai.flowrad.shubh.ShubhWidgetProvider")
      val ids = manager.getAppWidgetIds(component)
      val intent = Intent().setComponent(component)
      intent.action = AppWidgetManager.ACTION_APPWIDGET_UPDATE
      intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, ids)
      context.sendBroadcast(intent)
    }
  }
}
