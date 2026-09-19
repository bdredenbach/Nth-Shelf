package io.github.bdredenbach.nthshelf;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.content.ClipData;
import android.content.pm.ApplicationInfo;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowInsets;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.ImageView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.webkit.ServiceWorkerClientCompat;
import androidx.webkit.ServiceWorkerControllerCompat;
import androidx.webkit.WebViewAssetLoader;
import androidx.webkit.WebViewFeature;

public final class MainActivity extends Activity {
    private static final int FILE_CHOOSER_REQUEST = 27906;
    private static final String ASSET_HOST = "appassets.androidplatform.net";
    private static final String START_URL =
            "https://" + ASSET_HOST + "/assets/public/index.html";
    private static final long MINIMUM_SPLASH_MILLIS = 700L;
    private static final long MAXIMUM_SPLASH_MILLIS = 4000L;

    private FrameLayout rootView;
    private WebView webView;
    private ShelfBridge shelfBridge;
    private ImageView splashView;
    private WebViewAssetLoader assetLoader;
    private ValueCallback<Uri[]> pendingFileChoice;
    private View customView;
    private WebChromeClient.CustomViewCallback customViewCallback;
    private boolean backDispatchPending;
    private boolean splashDismissed;
    private long splashShownAt;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        getWindow().setStatusBarColor(Color.rgb(13, 13, 15));
        getWindow().setNavigationBarColor(Color.rgb(13, 13, 15));

        assetLoader = new WebViewAssetLoader.Builder()
                .addPathHandler("/assets/", new WebViewAssetLoader.AssetsPathHandler(this))
                .build();

        rootView = new FrameLayout(this);
        rootView.setBackgroundColor(Color.BLACK);

        webView = new WebView(this);
        shelfBridge = new ShelfBridge(this);
        shelfBridge.install(webView);
        webView.setBackgroundColor(Color.rgb(13, 13, 15));
        webView.setWebViewClient(createWebViewClient());
        webView.setWebChromeClient(createWebChromeClient());
        boolean debuggable = (getApplicationInfo().flags & ApplicationInfo.FLAG_DEBUGGABLE) != 0;
        WebView.setWebContentsDebuggingEnabled(debuggable);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowContentAccess(true);
        settings.setAllowFileAccess(false);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);
        settings.setSupportMultipleWindows(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setUserAgentString(
                settings.getUserAgentString() + " NthShelfAndroid/2.79.10"
        );
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            settings.setSafeBrowsingEnabled(true);
        }

        installServiceWorkerAssetBridge();
        rootView.addView(
                webView,
                new FrameLayout.LayoutParams(
                        ViewGroup.LayoutParams.MATCH_PARENT,
                        ViewGroup.LayoutParams.MATCH_PARENT
                )
        );
        splashView = createSplashView();
        rootView.addView(
                splashView,
                new FrameLayout.LayoutParams(
                        ViewGroup.LayoutParams.MATCH_PARENT,
                        ViewGroup.LayoutParams.MATCH_PARENT
                )
        );
        splashShownAt = System.currentTimeMillis();
        setContentView(rootView);
        splashView.postDelayed(this::dismissSplash, MAXIMUM_SPLASH_MILLIS);

        if (savedInstanceState == null || webView.restoreState(savedInstanceState) == null) {
            webView.loadUrl(START_URL);
        }
    }

    private WebViewClient createWebViewClient() {
        return new WebViewClient() {
            @Nullable
            @Override
            public WebResourceResponse shouldInterceptRequest(
                    @NonNull WebView view,
                    @NonNull WebResourceRequest request
            ) {
                return assetLoader.shouldInterceptRequest(request.getUrl());
            }

            @Override
            public void onPageFinished(@NonNull WebView view, @NonNull String url) {
                super.onPageFinished(view, url);
                ImageView splash = splashView;
                if (splash == null) return;
                long elapsed = System.currentTimeMillis() - splashShownAt;
                splash.postDelayed(
                        MainActivity.this::dismissSplash,
                        Math.max(0L, MINIMUM_SPLASH_MILLIS - elapsed)
                );
            }

            @Override
            public boolean shouldOverrideUrlLoading(
                    @NonNull WebView view,
                    @NonNull WebResourceRequest request
            ) {
                Uri uri = request.getUrl();
                if (ASSET_HOST.equalsIgnoreCase(uri.getHost())) {
                    return false;
                }
                try {
                    startActivity(new Intent(Intent.ACTION_VIEW, uri));
                } catch (ActivityNotFoundException ignored) {
                    // Leave the current reader state untouched when no handler exists.
                }
                return true;
            }
        };
    }

    private ImageView createSplashView() {
        ImageView splash = new BrandedSplashView(this);
        splash.setImageResource(R.drawable.nth_shelf_splash);
        splash.setScaleType(ImageView.ScaleType.FIT_CENTER);
        splash.setContentDescription(getString(R.string.app_name));
        splash.setOnApplyWindowInsetsListener((view, insets) -> {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                android.graphics.Insets bars = insets.getInsets(WindowInsets.Type.systemBars());
                view.setPadding(bars.left, bars.top, bars.right, bars.bottom);
            } else {
                view.setPadding(
                        insets.getSystemWindowInsetLeft(),
                        insets.getSystemWindowInsetTop(),
                        insets.getSystemWindowInsetRight(),
                        insets.getSystemWindowInsetBottom()
                );
            }
            return insets;
        });
        return splash;
    }

    private void dismissSplash() {
        if (splashDismissed || splashView == null) return;
        splashDismissed = true;
        splashView.animate()
                .alpha(0f)
                .setDuration(220L)
                .withEndAction(() -> {
                    if (splashView != null && splashView.getParent() == rootView) {
                        rootView.removeView(splashView);
                    }
                    splashView = null;
                })
                .start();
    }

    private WebChromeClient createWebChromeClient() {
        return new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(
                    WebView view,
                    ValueCallback<Uri[]> filePathCallback,
                    FileChooserParams fileChooserParams
            ) {
                if (pendingFileChoice != null) {
                    pendingFileChoice.onReceiveValue(null);
                }
                pendingFileChoice = filePathCallback;
                try {
                    Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT);
                    intent.addCategory(Intent.CATEGORY_OPENABLE);
                    // Several Android file managers register CBZ files with no
                    // useful MIME type. Request any document here and let the
                    // existing JavaScript extension gate decide what is valid.
                    intent.setType("*/*");
                    intent.putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true);
                    startActivityForResult(intent, FILE_CHOOSER_REQUEST);
                    return true;
                } catch (ActivityNotFoundException error) {
                    pendingFileChoice = null;
                    return false;
                }
            }

            @Override
            public void onShowCustomView(View view, CustomViewCallback callback) {
                if (customView != null) {
                    callback.onCustomViewHidden();
                    return;
                }
                customView = view;
                customViewCallback = callback;
                setContentView(view);
            }

            @Override
            public void onHideCustomView() {
                hideCustomView();
            }
        };
    }

    private void installServiceWorkerAssetBridge() {
        if (!WebViewFeature.isFeatureSupported(WebViewFeature.SERVICE_WORKER_BASIC_USAGE)) {
            return;
        }
        ServiceWorkerControllerCompat.getInstance().setServiceWorkerClient(
                new ServiceWorkerClientCompat() {
                    @Nullable
                    @Override
                    public WebResourceResponse shouldInterceptRequest(
                            @NonNull WebResourceRequest request
                    ) {
                        return assetLoader.shouldInterceptRequest(request.getUrl());
                    }
                }
        );
    }

    private void hideCustomView() {
        if (customView == null) {
            return;
        }
        customView = null;
        setContentView(rootView);
        if (customViewCallback != null) {
            customViewCallback.onCustomViewHidden();
            customViewCallback = null;
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, @Nullable Intent data) {
        if (requestCode == ArchiveBridge.SAVE || requestCode == ArchiveBridge.OPEN) {
            shelfBridge.archives.result(resultCode,data);
            return;
        }
        if (requestCode == ShelfBridge.SAVE_REQUEST) {
            shelfBridge.result(resultCode, data);
            return;
        }
        if (requestCode == FILE_CHOOSER_REQUEST && pendingFileChoice != null) {
            Uri[] result = collectChosenUris(resultCode, data);
            pendingFileChoice.onReceiveValue(result);
            pendingFileChoice = null;
            return;
        }
        super.onActivityResult(requestCode, resultCode, data);
    }

    @Nullable
    private Uri[] collectChosenUris(int resultCode, @Nullable Intent data) {
        if (resultCode != RESULT_OK || data == null) {
            return null;
        }
        ClipData clips = data.getClipData();
        if (clips != null && clips.getItemCount() > 0) {
            Uri[] uris = new Uri[clips.getItemCount()];
            for (int i = 0; i < clips.getItemCount(); i++) {
                uris[i] = clips.getItemAt(i).getUri();
            }
            return uris;
        }
        Uri uri = data.getData();
        return uri == null ? null : new Uri[] { uri };
    }

    @Override
    protected void onSaveInstanceState(@NonNull Bundle outState) {
        webView.saveState(outState);
        super.onSaveInstanceState(outState);
    }

    @Override
    public void onBackPressed() {
        if (customView != null) {
            hideCustomView();
            return;
        }
        if (backDispatchPending) return;
        backDispatchPending = true;
        webView.evaluateJavascript(
                "Boolean(window.LongboxApp && window.LongboxApp.handleBack && window.LongboxApp.handleBack())",
                handled -> {
                    backDispatchPending = false;
                    if ("true".equals(handled)) return;
                    performDefaultBack();
                }
        );
    }

    private void performDefaultBack() {
        if (webView.canGoBack()) webView.goBack();
        else super.onBackPressed();
    }

    @Override
    protected void onDestroy() {
        if (shelfBridge != null) shelfBridge.destroy();
        if (pendingFileChoice != null) {
            pendingFileChoice.onReceiveValue(null);
            pendingFileChoice = null;
        }
        webView.stopLoading();
        webView.setWebChromeClient(null);
        webView.setWebViewClient(null);
        webView.destroy();
        super.onDestroy();
    }
}
