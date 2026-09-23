package com.gasc.idappadi.sports.student;

import android.annotation.SuppressLint;
import android.content.Intent;
import android.graphics.Bitmap;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.KeyEvent;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;

public class MainActivity extends AppCompatActivity {

    // =========================================================================
    // 🌐 PRODUCTION BACKEND URL FOR STUDENT ANDROID APK
    // =========================================================================
    // When deploying your Node.js backend to Render, Railway, or VPS,
    // put your production domain URL below.
    // Example: "https://gasc-sports-api.onrender.com"
    public static final String PRODUCTION_BACKEND_URL = "https://gasc-idappadi-sports.onrender.com";

    private static final String LOCAL_ASSET_ENTRY = "file:///android_asset/student-login.html";
    private static final int FILE_CHOOSER_REQUEST_CODE = 1001;

    private WebView webView;
    private SwipeRefreshLayout swipeRefreshLayout;
    private ValueCallback<Uri[]> uploadMessageAboveL;

    @Override
    @SuppressLint("SetJavaScriptEnabled")
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        swipeRefreshLayout = findViewById(R.id.swipeRefreshLayout);
        webView = findViewById(R.id.webView);

        // Configure WebSettings for modern, rich sports UI
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setLoadWithOverviewMode(true);
        settings.setUseWideViewPort(true);
        settings.setSupportZoom(false);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        }

        // Setup Pull-to-Refresh
        swipeRefreshLayout.setColorSchemeResources(
                R.color.college_navy,
                R.color.sports_emerald,
                R.color.sports_amber
        );
        swipeRefreshLayout.setOnRefreshListener(() -> webView.reload());

        // =====================================================================
        // 🛡️ STRICT ROLE-BASED ACCESS CONTROL: STUDENT ONLY
        // =====================================================================
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                String url = request.getUrl().toString();
                return handleUrlNavigation(view, url);
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                return handleUrlNavigation(view, url);
            }

            private boolean handleUrlNavigation(WebView view, String url) {
                String lower = url.toLowerCase();

                // 🛑 STRICT GUARD: Block Admin Portal from Student APK
                if (lower.contains("admin-login") || 
                    lower.contains("admin-dashboard") || 
                    lower.contains("/admin/login") || 
                    lower.contains("/admin/dashboard") ||
                    lower.contains("/admin")) {
                    
                    Toast.makeText(MainActivity.this, 
                        "Access Restricted: This application is for Student Athletes only.", 
                        Toast.LENGTH_LONG).show();
                    
                    // Redirect back to student portal
                    loadStudentEntry();
                    return true;
                }

                // Handle external telephone / email / whatsapp links
                if (url.startsWith("tel:") || url.startsWith("mailto:") || url.startsWith("whatsapp:")) {
                    try {
                        Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                        startActivity(intent);
                        return true;
                    } catch (Exception e) {
                        return false;
                    }
                }

                return false;
            }

            @Override
            public void onPageStarted(WebView view, String url, Bitmap favicon) {
                swipeRefreshLayout.setRefreshing(true);
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                swipeRefreshLayout.setRefreshing(false);
            }

            @Override
            public void onReceivedError(WebView view, int errorCode, String description, String failingUrl) {
                swipeRefreshLayout.setRefreshing(false);
                Toast.makeText(MainActivity.this, "Network Error: " + description, Toast.LENGTH_SHORT).show();
            }
        });

        // Setup WebChromeClient for File Uploads (Profile Photos, Certificates)
        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView webView, ValueCallback<Uri[]> filePathCallback, FileChooserParams fileChooserParams) {
                if (uploadMessageAboveL != null) {
                    uploadMessageAboveL.onReceiveValue(null);
                    uploadMessageAboveL = null;
                }
                uploadMessageAboveL = filePathCallback;

                Intent intent = new Intent(Intent.ACTION_GET_CONTENT);
                intent.addCategory(Intent.CATEGORY_OPENABLE);
                intent.setType("image/*");
                try {
                    startActivityForResult(Intent.createChooser(intent, "Select Player Profile Photo"), FILE_CHOOSER_REQUEST_CODE);
                } catch (Exception e) {
                    uploadMessageAboveL = null;
                    return false;
                }
                return true;
            }
        });

        // Load the Student Portal Entry Point
        loadStudentEntry();
    }

    private void loadStudentEntry() {
        // Always load from local bundled assets - instant, no network lag!
        // API calls inside JS will go to PRODUCTION_BACKEND_URL automatically
        webView.loadUrl(LOCAL_ASSET_ENTRY);
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, @Nullable Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == FILE_CHOOSER_REQUEST_CODE) {
            if (uploadMessageAboveL == null) return;
            Uri[] results = null;
            if (resultCode == RESULT_OK && data != null) {
                Uri dataUri = data.getData();
                if (dataUri != null) {
                    results = new Uri[]{dataUri};
                }
            }
            uploadMessageAboveL.onReceiveValue(results);
            uploadMessageAboveL = null;
        }
    }

    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        if (keyCode == KeyEvent.KEYCODE_BACK && webView.canGoBack()) {
            webView.goBack();
            return true;
        }
        return super.onKeyDown(keyCode, event);
    }
}
