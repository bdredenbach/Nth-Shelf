package io.github.bdredenbach.nthshelf;

import android.app.Activity;
import android.content.Intent;
import android.content.pm.ActivityInfo;
import android.net.Uri;
import android.os.Build;
import android.util.Base64;
import android.view.View;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import android.webkit.WebView;
import androidx.webkit.WebViewCompat;
import androidx.webkit.WebViewFeature;
import androidx.webkit.JavaScriptReplyProxy;
import org.json.JSONObject;
import java.io.*;
import java.util.Collections;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/** Main-frame, exact-origin bridge. Never exposed to imported comic content. */
final class ShelfBridge {
    static final int SAVE_REQUEST = 27920;
    private final Activity activity;
    private final ExecutorService io = Executors.newSingleThreadExecutor();
    private File pending;
    private OutputStream output;
    private String name, mime;
    private JavaScriptReplyProxy saveReply;
    private int saveId;
    private boolean saving;
    ShelfBridge(Activity activity) { this.activity = activity; }

    void install(WebView view) {
        if (!WebViewFeature.isFeatureSupported(WebViewFeature.WEB_MESSAGE_LISTENER)) return;
        WebViewCompat.addWebMessageListener(view, "NthShelfHost",
            Collections.singleton("https://appassets.androidplatform.net"),
            (web, message, origin, mainFrame, reply) -> {
                if (!mainFrame) return;
                try {
                    JSONObject data = new JSONObject(message.getData());
                    int id = data.getInt("id");
                    String action = data.getString("action");
                    if ("immersive".equals(action)) {
                        immersive(data.optBoolean("enabled"));
                        respond(reply, id, true, "");
                    } else {
                        io.execute(() -> receive(data, id, action, reply));
                    }
                } catch (Exception ignored) { /* Invalid messages cannot mutate native state. */ }
            });
    }

    void immersive(boolean enabled) {
        activity.setRequestedOrientation(enabled ? ActivityInfo.SCREEN_ORIENTATION_SENSOR_LANDSCAPE : ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED);
        if (Build.VERSION.SDK_INT >= 30) {
            WindowInsetsController controller = activity.getWindow().getInsetsController();
            if (controller != null) {
                controller.setSystemBarsBehavior(WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
                if (enabled) controller.hide(WindowInsets.Type.systemBars());
                else controller.show(WindowInsets.Type.systemBars());
            }
        } else {
            activity.getWindow().getDecorView().setSystemUiVisibility(enabled
                ? View.SYSTEM_UI_FLAG_FULLSCREEN | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                : View.SYSTEM_UI_FLAG_VISIBLE);
        }
    }

    private void receive(JSONObject data, int id, String action, JavaScriptReplyProxy reply) {
        try {
            if ("begin".equals(action)) {
                if (saving) throw new IOException("Another file is waiting to be saved.");
                cleanup();
                name = data.optString("name", "nth-shelf-backup.nthshelf").replaceAll("[^a-zA-Z0-9._ -]", "_");
                if (name.length() > 160) name = name.substring(0,160);
                mime = data.optString("mime", "application/zip");
                pending = File.createTempFile("nth-shelf-export-", ".tmp", activity.getCacheDir());
                output = new FileOutputStream(pending);
            } else if ("chunk".equals(action)) {
                String chunk = data.getString("data");
                if (output == null || chunk.length() > 400000) throw new IOException("Invalid transfer chunk.");
                output.write(Base64.decode(chunk, Base64.NO_WRAP));
            } else if ("finish".equals(action)) {
                if (output == null) throw new IOException("No transfer is open.");
                output.close(); output = null;
                saving = true; saveReply = reply; saveId = id;
                activity.runOnUiThread(() -> {
                    try {
                        Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
                        intent.addCategory(Intent.CATEGORY_OPENABLE);
                        intent.setType(mime);
                        intent.putExtra(Intent.EXTRA_TITLE, name);
                        activity.startActivityForResult(intent, SAVE_REQUEST);
                    } catch (Exception error) {
                        io.execute(() -> finishSave(false, "No save-file picker is available."));
                    }
                });
                return;
            } else if ("cancel".equals(action)) {
                if (!saving) cleanup();
            } else throw new IOException("Unknown action.");
            respond(reply, id, true, "");
        } catch (Exception error) {
            if (!saving) cleanup();
            respond(reply, id, false, error.getMessage());
        }
    }

    void result(int code, Intent data) {
        io.execute(() -> {
            if (!saving) return;
            if (code != Activity.RESULT_OK || data == null || data.getData() == null) {
                finishSave(false, "Save cancelled. Your library was not changed."); return;
            }
            Uri uri = data.getData();
            try (InputStream input = new FileInputStream(pending);
                 OutputStream dest = activity.getContentResolver().openOutputStream(uri, "wt")) {
                if (dest == null) throw new IOException("Destination is unavailable.");
                byte[] bytes = new byte[65536]; int count;
                while ((count = input.read(bytes)) != -1) dest.write(bytes, 0, count);
                dest.flush();
                finishSave(true, "File saved.");
            } catch (Exception error) {
                finishSave(false, "Could not finish saving. A partial file may remain at the destination.");
            }
        });
    }
    private void finishSave(boolean ok, String message) {
        if (saveReply != null) respond(saveReply, saveId, ok, message);
        saveReply = null; saving = false; cleanup();
    }
    private void respond(JavaScriptReplyProxy reply, int id, boolean ok, String message) {
        try {
            JSONObject result = new JSONObject().put("id",id).put("ok",ok).put("message",message);
            activity.runOnUiThread(() -> reply.postMessage(result.toString()));
        } catch (Exception ignored) {}
    }
    private void cleanup() {
        try { if (output != null) output.close(); } catch (Exception ignored) {}
        output = null;
        if (pending != null) pending.delete();
        pending = null;
    }
    void destroy() { io.execute(this::cleanup); io.shutdown(); }
}
